from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import Partida, Erabiltzaile, GameState
from mongoengine import ValidationError
from datetime import datetime
from services.partida_service import get_partida_by_id, save_partida_game_state, partida_to_dict, delete_partida
from services.llm_service import create_map, send_ia_game_state, get_ai_visible_state  # Importa el método para crear el mapa y obtener acciones de la IA

games_bp = Blueprint('games', __name__, url_prefix='/api/games')

# POST /api/games - Create a new game
@games_bp.route('', methods=['POST'])
@jwt_required()
def create_game():
    data = request.get_json()
    name = data.get('name')
    scenario_id = data.get('scenario_id')
    game_state = data.get('game_state')
    map_width = data.get('map_width')
    map_height = data.get('map_height')

    # Generar el mapa y posiciones iniciales usando el servicio LLM
    map_result = create_map(map_width, map_height)
    if "error" in map_result:
        return jsonify({"error": f"Mapa sortzean errorea: {map_result['error']}"}), 500

    # Matriz de niebla de guerra inicial (todo oculto)
    fog_player = [[False for _ in range(map_width)] for _ in range(map_height)]
    fog_ai = [[False for _ in range(map_width)] for _ in range(map_height)]

    # Unidades iniciales para cada bando usando las posiciones de player_start y ai_start
    player_units = []
    ai_units = []
    player_starts = map_result.get("player_start", [])
    ai_starts = map_result.get("ai_start", [])

    # Inserta el mapa generado en el atributo tiles de GameMap
    if "map" not in game_state:
        game_state["map"] = {}
    game_state["map"]["tiles"] = map_result["mapa"]
    game_state["map"]["visible_objects"] = map_result.get("visible_objects", [])
    game_state["map"]["fog_of_war_player"] = fog_player
    game_state["map"]["fog_of_war_ai"] = fog_ai

    # Asigna las unidades iniciales
    if "player" in game_state:
        game_state["player"]["units"] = player_units
    if "ai" in game_state:
        game_state["ai"]["units"] = ai_units

    user_id = get_jwt_identity()
    try:
        game = Partida(
            user_id=user_id,
            name=name,
            scenario_id=scenario_id,
            created_at=datetime.utcnow(),
            last_saved=datetime.utcnow(),
            game_state=game_state
        )
        game.save()
        return jsonify({
            "game": partida_to_dict(game),
            "player_positions": player_starts,
            "ai_positions": ai_starts,
            "message": "Partida arrakastaz sortu da"
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET /api/games - List saved games
@games_bp.route('', methods=['GET'])
@jwt_required()
def list_games():
    user_id = get_jwt_identity()
    try:
        games = Partida.objects(user_id=user_id)
        games_list = [
            {
                "game_id": str(game.id),
                "name": game.name,
                "scenario_id": game.scenario_id,
                "created_at": game.created_at.isoformat(),
                "last_saved": game.last_saved.isoformat()
            }
            for game in games
        ]
        return jsonify(games_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST /api/games/{gameId}/save - Save game state
@games_bp.route('/<string:game_id>/save', methods=['POST'])
@jwt_required()
def save_game(game_id):
    data = request.get_json()
    game_state = data.get('game_state')

    user_id = get_jwt_identity()
    game = get_partida_by_id(game_id, user_id)
    if not game:
        return jsonify({"error": "Partida ez da aurkitu"}), 404

    ok, err = save_partida_game_state(game, game_state)
    if not ok:
        return jsonify({"error": err}), 400

    return jsonify({"message": "Partida arrakastaz gorde da"}), 200

# GET /api/games/{gameId} - Load a saved game
@games_bp.route('/<string:game_id>', methods=['GET'])
@jwt_required()
def load_game(game_id):
    user_id = get_jwt_identity()
    game = get_partida_by_id(game_id, user_id)
    if not game:
        return jsonify({"error": "Partida ez da aurkitu"}), 404

    return jsonify(partida_to_dict(game)), 200

# POST /api/games/getIAAction - Get AI actions based on the current game state
@games_bp.route('/getIAAction', methods=['POST'])
@jwt_required()
def get_ia_action():
    data = request.get_json()
    game_state = data.get("game_state")

    if not game_state:
        return jsonify({"error": "Jokoaren egoera beharrezkoa da"}), 400

    # Obtener solo la información visible para la IA
    ai_visible_json = get_ai_visible_state(game_state)

    # Llamar al servicio LLM para obtener las acciones de la IA usando solo la información visible
    ai_response = send_ia_game_state(ai_visible_json)
    if "error" in ai_response:
        return jsonify({"error": f"AI zerbitzuaren errorea: {ai_response['error']}"}), 500

    return jsonify(ai_response.get("action")), 200

@games_bp.route('/<string:game_id>', methods=['DELETE'])
@jwt_required()
def delete_game(game_id):
    user_id = get_jwt_identity()
    deleted = delete_partida(game_id, user_id)
    if deleted:
        return jsonify({"message": "Partida ezabatu da"}), 200
    else:
        return jsonify({"error": "Partida ez da aurkitu"}), 404