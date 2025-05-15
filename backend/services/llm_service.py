import os
import requests
import random
import json
import traceback

LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')

TERRAIN_IDS = [
    "lautada",   # 0
    "basoa",     # 1
    "mendia",    # 2
    "ura",       # 3
    "desertua",  # 4
    "pantano",   # 5
    "itsasoa"    # 6
]

def generate_random_map(width=50, height=50):
    return [[random.randint(0, 6) for _ in range(width)] for _ in range(height)]

def create_map(width, height):
    # MOCK: genera un mapa aleatorio de ids de terrenos válidos
    mapa = generate_random_map(width, height)
    visible_objects = []

    # Posiciones iniciales fijas para cada civilización (puedes ajustar las coordenadas)
    player_start = [{"x": 4, "y": 3}, {"x": 5, "y": 3}]
    ai_start = [{"x": 4, "y": 4}, {"x": 5, "y": 4}]

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
    print("Enviando game_state_visible a IA:")
    print(json.dumps(game_state_visible, indent=2, ensure_ascii=False))  # <-- LOG
    url = f"{LLM_SERVICE_URL}/eskuratuEkintza"
    try:
        resp = requests.post(url, json=game_state_visible, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}

def get_ai_visible_state(game_state):
    ai_data = game_state.get("ai", {})
    player_data = game_state.get("player", {})
    terrain = game_state.get("map", {}).get("tiles", [])
    fog = game_state.get("map", {}).get("fog_of_war_ai", [])
    visible_objects = game_state.get("map", {}).get("visible_objects", [])

    visible_terrain = []
    visible_elements = []

    # Para guardar las posiciones visibles
    visible_positions = set()

    for i, row in enumerate(terrain):
        fog_row = fog[i] if i < len(fog) else []
        visible_row = []
        for j, cell in enumerate(row):
            if j < len(fog_row) and fog_row[j]:
                visible_row.append(cell)
                visible_positions.add((j, i))  # x = columna = j, y = fila = i
                for obj in visible_objects:
                    if obj["position"]["x"] == j and obj["position"]["y"] == i:
                        visible_elements.append(obj)
            else:
                visible_row.append("no_visible")
        visible_terrain.append(visible_row)

    # Unidades enemigas (del jugador) en posiciones visibles (solo campos necesarios)
    enemyUnits = []
    for unit in player_data.get("units", []):
        pos = unit.get("position", {})
        if (pos.get("x"), pos.get("y")) in visible_positions:
            enemyUnits.append({
                "health": unit.get("health"),
                "id": unit.get("id"),
                "position": unit.get("position"),
                "range": unit.get("range"),
                "strength": unit.get("strength"),
                "type": unit.get("type"),
            })

    # Ciudades enemigas (del jugador) en posiciones visibles (solo campos necesarios)
    visible_Cities = []
    for city in player_data.get("cities", []):
        pos = city.get("position", {})
        if (pos.get("x"), pos.get("y")) in visible_positions:
            visible_Cities.append({
                "defense": city.get("defense"),
                "era": city.get("era"),
                "health": city.get("health"),
                "id": city.get("id"),
                "name": city.get("name"),
                "position": city.get("position"),
            })

    return {
        "ai": ai_data,
        "visible_terrain": visible_terrain,
        "visible_objects": visible_elements,
        "visible_enemyUnits": enemyUnits,
        "visible_enemyCities": visible_Cities
    }
