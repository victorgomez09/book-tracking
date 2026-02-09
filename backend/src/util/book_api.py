from datetime import datetime
from typing import Any, Dict, List, Optional
import requests

def fetch_multiple_books(title: str, author: str, max_results: int = 10, lang: str = "es") -> List[Dict[str, Any]]:
    # Aumentamos maxResults para obtener variedad
    query = f"intitle:{title}+inauthor:{author}"
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults={max_results}&langRestrict={lang}"
    
    books_found = []
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if "items" in data:
            for item in data["items"]:
                vol = item.get("volumeInfo", {})
                
                published_dt = _parse_google_date(vol.get("publishedDate"))
                print("vol", _get_book_identifiers(vol))
                print("----------------------")
                
                book_data = {
                    "title": vol.get("title"),
                    "author": ", ".join(vol.get("authors", ["Autor Desconocido"])),
                    "published_date": published_dt,
                    "description": vol.get("description", "Sin descripción disponible."),
                    "page_count": vol.get("pageCount", 0),
                    "image_url": vol.get("imageLinks", {}).get("thumbnail"),
                    "external_link": vol.get("infoLink"),
                    "category": ", ".join(vol.get("categories", ["General"])),
                    "isbn": _get_book_identifiers(vol)
                }
                books_found.append(book_data)
                
    except Exception as e:
        print(f"Error buscando en Google Books: {e}")
    
    return books_found

def _parse_google_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    
    try:
        # Caso 1: "YYYY-MM-DD" (Fecha completa)
        if len(date_str) == 10:
            return datetime.strptime(date_str, "%Y-%m-%d")
        
        # Caso 2: "YYYY" (Solo año)
        if len(date_str) == 4:
            return datetime.strptime(date_str, "%Y")
        
        # Caso 3: "YYYY-MM" (Año y mes)
        if len(date_str) == 7:
            return datetime.strptime(date_str, "%Y-%m")
            
    except ValueError:
        return None # O podrías devolver una fecha por defecto
    
    return None

def _get_book_identifiers(item):
    if not item:
        print("DEBUG: Item está vacío")
        return {"isbn": None, "google_id": None, "oclc": None}

    # Intentamos sacar el ID de la raíz o de donde esté
    google_id = item.get("id")
    
    # Si 'item' resulta ser ya el 'volumeInfo', buscamos los identificadores directamente
    vol = item.get("volumeInfo", item) 
    identifiers = vol.get("industryIdentifiers", [])
    
    data = {
        "isbn": None,
        "google_id": google_id,
        "oclc": None
    }

    print(f"DEBUG: Procesando ID {google_id}, Identificadores encontrados: {len(identifiers)}")

    for id_obj in identifiers:
        id_type = id_obj.get("type")
        id_val = id_obj.get("identifier")

        if id_type == "ISBN_13":
            return id_val
            # No hacemos break aún para ver si hay más info en el log si quieres
        elif id_type == "ISBN_10" and not data["isbn"]:
            return id_val
        elif id_type == "OTHER":
            if "OCLC" in id_val:
                return id_val.replace("OCLC:", "").strip()
            # Algunos libros usan 'OTHER' para el ISBN si la base de datos es vieja
            elif not data["isbn"] and len(id_val) in [10, 13] and id_val.isdigit():
                return id_val