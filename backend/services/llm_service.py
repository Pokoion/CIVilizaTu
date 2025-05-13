import os
import requests

LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')

def create_map(width, height):
    url = f"{LLM_SERVICE_URL}/eskuratuMapa"
    payload = {"width": width, "height": height}
    try:
        resp = requests.get(url, params=payload, timeout=60)  
        resp.raise_for_status()
        data = resp.json()
        return {
            "mapa": data.get("terrain", []),  
            "visible_objects": data.get("visible_objects", [])  
        }
    except Exception as e:
        return {"error": str(e)}

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
