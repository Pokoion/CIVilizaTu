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
    
    Responde con un objeto JSON con esta estructura exacta:
    {{
        "terrain": [
            [0, 2, 4, ...],
            [2, 2, 3, ...],
            ...
        ]
    }}
    
    Donde "terrain" es una matriz bidimensional de 50x50 pero en vez de numeros dame nombres de terrains.
    Aparte del json de terrain, dame otro json con la siguiente estructura:
    {{
        "spawn_points": [
            {
                "player": {
                    "settler": {"x": 10, "y": 15},  
                    "soldier": {"x": 20, "y": 25}   
                }
            },
            {
                "ai": {
                    "settler": {"x": 30, "y": 35},  
                    "soldier": {"x": 40, "y": 45}   
                }
            }
        ]
    }}
    Donde "spawn_points" es una lista de puntos de aparición para las unidades de ambos jugadores.
    Debes de tener en cuenta lo siguiente:
    - Ambas unidades de cada jugador deben aparecer a un tile de distancia entre sí.
    - Las unidades del player deben aparecer lejos de las unidades del ai.
    - Las coordenadas de las unidades deben estar dentro del mapa terrain y no pueden aparecer en un tile 3 (Ura) ni 6 (Itsasoa).     
    """
    
    response = connector.send_prompt(prompt)
    print(response)

if __name__ == '__main__':
    main()