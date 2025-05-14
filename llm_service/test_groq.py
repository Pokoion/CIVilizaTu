from GroqConnector import GroqConnector

def main():
    connector = GroqConnector()
    
    # Test prompt
    prompt = """
    Genera un mapa:
    
    El mapa debe incluir diferentes tipos de terreno:
    - Lautada (0)
    - Basoa (1)
    - Mendia (2)
    - Ura (3)
    - Desertua (4)
    - Pantanoa (5)
    - Itsasoa (6)
    
    Debes distribuir los terrenos de forma estratégica y coherente, con:
    - Masas de agua conectadas
    - Cadenas montañosas
    - Bosques en zonas apropiadas
    
    Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta:
    {{
        "terrain": [
            [0, 2, 4, ...],
            [2, 2, 3, ...],
            ...
        ]
    }}
    
    Donde "terrain" es una matriz bidimensional de 50x50 pero en vez de numeros dame nombres de terrains.
    """
    
    response = connector.send_prompt(prompt)
    print(response)

if __name__ == '__main__':
    main()