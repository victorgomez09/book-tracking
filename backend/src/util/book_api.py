from typing import Optional
import requests

def search_book(title: str, lang: str = "es", author: Optional[str] = None):
    query = f"intitle:{title}"
    if author:
        query += f"+inauthor:{author}"
    
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=1&langRestrict={lang}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if "items" in data:
            item = data["items"][0]["volumeInfo"]
            # Extraemos el ISBN-13 si existe
            isbns = item.get("industryIdentifiers", [])
            isbn_13 = next((i["identifier"] for i in isbns if i["type"] == "ISBN_13"), None)
            print("item", item)
            
            return {
                "title": item.get("title"),
                "author": ", ".join(item.get("authors", ["Anónimo"])),
                "publisher": item.get("publisher"),
                "published_date": item.get("publishedDate"),
                "description": item.get("description"),
                "page_count": item.get("pageCount"),
                "category": ", ".join(item.get("categories", ["General"])),
                "image_url": item.get("imageLinks", {}).get("thumbnail"),
                "isbn": isbn_13
            }
    return None