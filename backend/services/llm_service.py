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

# Coste de movimiento por tipo de terreno (índice coincide con TERRAIN_IDS)
TERRAIN_COSTS = [1, 2, 2, 1, 3, 3, 1]

def create_map(width, height, map_type=0):
    url = f"{LLM_SERVICE_URL}/eskuratuMapa"
    payload = {"width": width, "height": height, "map_type": map_type}
    try:
        resp = requests.post(url, json=payload, timeout=280)
        if resp.status_code == 429:
            return {"error": "Rate limit", "status_code": 429}
        resp.raise_for_status()
        data = resp.json()
        return {
            "mapa": data.get("terrain", []),
            "visible_objects": data.get("visible-objects", []),
            "player_start": data.get("player_start", []),
            "ai_start": data.get("ai_start", [])
        }
    except Exception as e:
        print(f"Error llamando a /eskuratuMapa: {e}")
        return {"error": str(e)}

def send_ia_game_state(game_state_visible):
    url = f"{LLM_SERVICE_URL}/eskuratuEkintza"
    try:
        resp = requests.post(url, json=game_state_visible, timeout=280)
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

    visible_positions = set()
    visible_tiles = []
    for i, row in enumerate(terrain):
        fog_row = fog[i] if i < len(fog) else []
        for j, cell in enumerate(row):
            if j < len(fog_row) and fog_row[j]:
                terrain_num = TERRAIN_IDS.index(cell) if cell in TERRAIN_IDS else 0
                cost = TERRAIN_COSTS[terrain_num]
                visible_tiles.append({
                    "x": j,
                    "y": i,
                    "type": terrain_num,
                    "cost": cost
                })
                visible_positions.add((j, i))

    # Objetos visibles SOLO en posiciones visibles
    visible_elements = [
        obj for obj in visible_objects
        if (obj.get("position", {}).get("x"), obj.get("position", {}).get("y")) in visible_positions
    ]

    # Unidades enemigas (del jugador) en posiciones visibles
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

    # Ciudades enemigas (del jugador) en posiciones visibles
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
        "visible_tiles": visible_tiles,
        "visible_objects": visible_elements,
        "visible_enemyUnits": enemyUnits,
        "visible_enemyCities": visible_Cities
    }
