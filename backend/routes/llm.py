from flask import Blueprint, request, jsonify
import os

llm_bp = Blueprint('llm', __name__, url_prefix='/api/llm')

@llm_bp.route('/generate-map', methods=['POST'])
def generate_map():
    data = request.get_json()
    # Aquí simplemente devuelves el JSON recibido al frontend o lo procesas si quieres
    # El LLM_SERVICE será el encargado de comunicarse con GroQ y devolver el resultado real
    return jsonify({"request": data}), 200

@llm_bp.route('/ai-turn', methods=['POST'])
def ai_turn():
    data = request.get_json()
    # Aquí simplemente devuelves el JSON recibido al frontend o lo procesas si quieres
    # El LLM_SERVICE será el encargado de comunicarse con GroQ y devolver el resultado real
    return jsonify({"request": data}), 200

