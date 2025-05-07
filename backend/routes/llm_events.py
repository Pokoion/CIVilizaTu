from flask import Blueprint, request, jsonify
import requests
import os

llm_events_bp = Blueprint('llm_events', __name__, url_prefix='/api/llm-events')

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

@llm_events_bp.route('/action', methods=['POST'])
def receive_ai_action():
    data = request.get_json()
    try:
        resp = requests.post(f"{FRONTEND_URL}/api/ai-action", json=data, timeout=10)
        return jsonify({"message": "Acción recibida y reenviada al frontend", "frontend_response": resp.json()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@llm_events_bp.route('/end-turn', methods=['POST'])
def receive_ai_end_turn():
    data = request.get_json()
    try:
        resp = requests.post(f"{FRONTEND_URL}/api/ai-end-turn", json=data, timeout=10)
        return jsonify({"message": "Fin de ronda recibido y reenviado al frontend", "frontend_response": resp.json()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
