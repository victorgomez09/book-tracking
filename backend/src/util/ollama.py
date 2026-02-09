import json
import re
import ollama

def get_ai_recommendations(user_books):
    prompt = build_prompt(user_books)
    
    response = ollama.chat(
        model='llama3.2:1b', 
        messages=[{'role': 'user', 'content': prompt}],
        options={
            "temperature": 0.7, # Creatividad moderada
            "top_p": 0.9,
            "num_predict": 500 # Evita que se enrolle demasiado
        }
    )

    raw_content = response['message']['content']

    # Limpieza: Extraer solo lo que está entre corchetes [ ]
    try:
        json_match = re.search(r'\[.*\]', raw_content, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
            return json.loads(clean_json)
        return []
    except Exception as e:
        print(f"Error parseando IA: {e}")
        return []

def build_prompt(user_books):
    # Formateamos solo libros con buena nota para no contaminar el gusto
    books_data = "\n".join([
        f"- {b.title} por {b.author}. Género: {b.category}. Mi nota: {b.rating}/5. Notas: {b.notes}"
        for b in user_books if b.rating >= 4
    ])

    return f"""
<SYSTEM>
Eres un experto librero con memoria fotográfica. Tu objetivo es recomendar 3 libros nuevos basados en la biblioteca del usuario. 
Reglas estrictas:
1. Recomienda libros que NO estén en la lista proporcionada.
2. Sé específico: si le gusta el "Terror", busca subgéneros similares.
3. El formato de respuesta debe ser EXCLUSIVAMENTE un JSON válido.
</SYSTEM>

<USER_LIBRARY>
{books_data}
</USER_LIBRARY>

<FORMAT_EXAMPLE>
[
  {{
    "title": "Nombre del Libro",
    "author": "Nombre del Autor",
    "reason": "Como te gustó 'Libro X', este te encantará por su estilo similar en..."
  }}
]
</FORMAT_EXAMPLE>

Responde estrictamente en formato JSON:
[
  {"title": "...", "author": "...", "reason": "..."}
]
"""