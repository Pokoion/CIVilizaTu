import os
import requests

LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')

def create_map(width, height):
    url = f"{LLM_SERVICE_URL}/eskuratuMapa"
    payload = {"width": width, "height": height}
    try:
        resp = requests.post(url, json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}

def get_ai_actions(game_state_visible):
    url = f"{LLM_SERVICE_URL}/eskuratuEkintza"
    try:
        resp = requests.post(url, json=game_state_visible, timeout=60)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}
