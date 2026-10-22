from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import Partida, Erabiltzaile, GameState
from mongoengine import ValidationError
from datetime import datetime
from services.partida_service import get_partida_by_id, save_partida_game_state, partida_to_dict, delete_partida
from services.llm_service import create_map, send_ia_game_state, get_ai_visible_state  # Importa el método para crear el mapa y obtener acciones de la IA

games_bp = Blueprint('games', __name__, url_prefix='/api/games')

TERRAIN_IDS = [
    "lautada",   # 0
    "basoa",     # 1
    "mendia",    # 2
    "ura",       # 3
    "desertua",  # 4
    "pantano",   # 5
    "itsasoa"    # 6
]

# POST /api/games - Create a new game
@games_bp.route('', methods=['POST'])
@jwt_required()
def create_game():
    import sys
    print("===> [POST /api/games] Nueva petición recibida", file=sys.stderr)
    data = request.get_json()
    print("===> Datos recibidos:", data, file=sys.stderr)
    name = data.get('name')
    scenario_id = data.get('scenario_id')
    game_state = data.get('game_state')
    map_width = data.get('map_width')
    map_height = data.get('map_height')
    map_type = data.get('map_type', 0)

    # Generar el mapa y posiciones iniciales usando el servicio LLM
    print(f"===> Llamando a create_map({map_width}, {map_height}, {map_type})", file=sys.stderr)
    import time

    max_retries = 5
    retries = 0
    while retries < max_retries:
        map_result = create_map(map_width, map_height, map_type)
        if "error" in map_result and map_result.get("status_code") == 429:
            print(f"===> [POST /api/games] 429 recibido al crear mapa, reintentando... ({retries+1}/{max_retries})", file=sys.stderr)
            time.sleep(1.5 * (retries + 1))
            retries += 1
            continue
        break

    if "error" in map_result:
        status = map_result.get("status_code", 500)
        return jsonify({"error": f"Mapa sortzean errorea: {map_result['error']}"}), status

    fog_player = [[False for _ in range(50)] for _ in range(50)]
    fog_ai = [[False for _ in range(50)] for _ in range(50)]

    player_starts = map_result.get("player_start", [])
    ai_starts = map_result.get("ai_start", [])

    numeric_map = map_result["mapa"]

    TARGET_SIZE = 50
    string_map = []

    for i in range(TARGET_SIZE):
        # Usa la fila si existe, si no, crea una nueva de ceros
        row = numeric_map[i] if (isinstance(numeric_map, list) and i < len(numeric_map)) else []
        if not isinstance(row, list):
            row = []
        # Ajusta la longitud de la fila y convierte a string
        string_row = []
        for j in range(TARGET_SIZE):
            val = row[j] if j < len(row) and isinstance(row[j], int) else 0
            # Si el índice no es válido, pon lautada
            if not (0 <= val < len(TERRAIN_IDS)):
                val = 0
            string_row.append(TERRAIN_IDS[val])
        string_map.append(string_row)

    #print("===> string_map (ajustado 50x50, limpio):", string_map, file=sys.stderr)

    if "map" not in game_state:
        game_state["map"] = {}
    game_state["map"]["tiles"] = string_map
    game_state["map"]["visible_objects"] = map_result.get("visible_objects", [])
    game_state["map"]["fog_of_war_player"] = fog_player
    game_state["map"]["fog_of_war_ai"] = fog_ai

    #print("===> game_state final:", game_state, file=sys.stderr)

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
        print("===> Partida guardada correctamente", file=sys.stderr)
        return jsonify({
            "game": partida_to_dict(game),
            "player_positions": player_starts,
            "ai_positions": ai_starts,
            "message": "Partida arrakastaz sortu da"
        }), 201
    except Exception as e:
        import traceback
        print("===> ERROR al guardar la partida:", str(e), file=sys.stderr)
        traceback.print_exc()
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
    import time

    data = request.get_json()
    game_state = data.get("game_state")
    if not game_state:
        return jsonify({"error": "Jokoaren egoera beharrezkoa da"}), 400

    ai_visible_json = get_ai_visible_state(game_state)

    max_retries = 10
    retries = 0
    while retries < max_retries:
        ai_response = send_ia_game_state({"game_state_visible": ai_visible_json})

        # Si hay error 429, espera y reintenta (con límite para no colgar la petición)
        if "error_type" in ai_response and ai_response["error_type"] == "rate_limit":
            retries += 1
            wait = min(2 ** retries, 30)
            print(f"===> [getIAAction] 429 recibido, reintentando en {wait}s... ({retries}/{max_retries})", flush=True)
            time.sleep(wait)
            continue

        # Comprobar formato correcto
        if (
            isinstance(ai_response, dict)
            and "action" in ai_response
            and isinstance(ai_response["action"], dict)
            and "type" in ai_response["action"]
            and "payload" in ai_response["action"]
        ):
            return jsonify(ai_response), 200

        retries += 1
        time.sleep(1.5 * retries)

    # Si tras los reintentos no se consigue una respuesta válida, enviar endTurn
    return jsonify({
        "action": {
            "type": "endTurn",
            "payload": {}
        },
        "reasoning": "No valid response.",
        "analysis": "No valid response."
    }), 200

@games_bp.route('/<string:game_id>', methods=['DELETE'])
@jwt_required()
def delete_game(game_id):
    user_id = get_jwt_identity()
    deleted = delete_partida(game_id, user_id)
    if deleted:
        return jsonify({"message": "Partida ezabatu da"}), 200
    else:
        return jsonify({"error": "Partida ez da aurkitu"}), 404