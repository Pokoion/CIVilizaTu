import os
import requests
import random

LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')

TERRAIN_IDS = [
    "lautada",
    "basoa",
    "mendia",
    "ura",
    "desertua",
    "pantano",
    "itsasoa"
]

def generate_random_map(width=50, height=50):
    return [[random.choice(TERRAIN_IDS) for _ in range(width)] for _ in range(height)]

def create_map(width, height):
    # MOCK: genera un mapa aleatorio de ids de terrenos válidos
    mapa = generate_random_map(width, height)
    visible_objects = []

    # Posiciones iniciales fijas para cada civilización (puedes ajustar las coordenadas)
    player_start = [{"x": 2, "y": 2}, {"x": 3, "y": 3}]
    ai_start = [{"x": 40, "y": 40}, {"x": 41, "y": 41}]

    return {
        "mapa": mapa,
        "visible_objects": visible_objects,
        "player_start": player_start,   
        "ai_start": ai_start
    }
    # --- Código real abajo ---
    # url = f"{LLM_SERVICE_URL}/eskuratuMapa"
    # payload = {"width": width, "height": height}
    # try:
    #     resp = requests.get(url, params=payload, timeout=60)  
    #     resp.raise_for_status()
    #     data = resp.json()
    #     return {
    #         "mapa": data.get("terrain", []),  
    #         "visible_objects": data.get("visible_objects", [])  
    #     }
    # except Exception as e:
    #     return {"error": str(e)}

def send_ia_game_state(game_state_visible):
    url = f"{LLM_SERVICE_URL}/eskuratuEkintza"
    try:
        resp = requests.post(url, json=game_state_visible, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def get_ai_visible_state(game_state):
    ai_data = game_state.get("ai", {})
    terrain = game_state.get("map", {}).get("terrain", [])
    fog = game_state.get("map", {}).get("fog_of_war_ai", [])
    visible_objects = game_state.get("map", {}).get("visible_objects", [])

    visible_terrain = []
    visible_elements = []

    for i, row in enumerate(terrain):
        fog_row = fog[i] if i < len(fog) else []
        visible_row = []
        for j, cell in enumerate(row):
            if j < len(fog_row) and fog_row[j] == 1:
                visible_row.append(cell)  
                # Filtrar objetos visibles dentro del terreno visible
                for obj in visible_objects:
                    if obj["position"]["x"] == i and obj["position"]["y"] == j:
                        visible_elements.append(obj)
            else:
                visible_row.append("no_visible")  #
        visible_terrain.append(visible_row)

    return {
        "ai": ai_data,
        "visible_terrain": visible_terrain,
        "visible_elements": visible_elements  
    }
