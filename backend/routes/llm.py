from flask import Blueprint, request, jsonify
import requests
import os

llm_bp = Blueprint('llm', __name__, url_prefix='/api/llm')

@llm_bp.route('/status', methods=['GET'])
def llm_status():
    llm_service_url = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')
    try:
        resp = requests.get(f"{llm_service_url}/api/groq/status", timeout=10)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@llm_bp.route('/query', methods=['POST'])
def llm_query():
    llm_service_url = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')
    try:
        data = request.get_json()
        resp = requests.post(f"{llm_service_url}/api/groq", json=data, timeout=60)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
