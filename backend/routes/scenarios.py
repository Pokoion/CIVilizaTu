from flask import Blueprint, jsonify
from models.schemas import Eszenatoki

scenarios_bp = Blueprint('scenarios', __name__, url_prefix='/api/scenarios')

@scenarios_bp.route('', methods=['GET'])
def list_scenarios():
    scenarios = Eszenatoki.objects()
    result = []
    for s in scenarios:
        result.append({
            "scenario_id": str(s.id),
            "name": s.name,
            "description": s.description,
            "map_size": s.map_size
        })
    return jsonify(result), 200
