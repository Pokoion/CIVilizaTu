from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.schemas import Partida, Erabiltzaile
from datetime import datetime

games_bp = Blueprint('games', __name__, url_prefix='/api/games')

# POST /api/games - Create a new game
@games_bp.route('', methods=['POST'])
@jwt_required()
def create_game():
    data = request.get_json()
    name = data.get('name')
    scenario_id = data.get('scenario_id')

    if not name or not scenario_id:
        return jsonify({"error": "Izena eta eszenatoki ID-a beharrezkoak dira"}), 400

    user_id = get_jwt_identity()
    try:
        game = Partida(
            user_id=user_id,
            name=name,
            scenario_id=scenario_id,
            created_at=datetime.utcnow(),
            last_saved=datetime.utcnow(),
            game_state={"turn": 0, "current_player": "player"}
        )
        game.save()
        return jsonify({"game_id": str(game.id), "message": "Partida arrakastaz sortu da"}), 201
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

    if not game_state:
        return jsonify({"error": "Jokoaren egoera beharrezkoa da"}), 400

    user_id = get_jwt_identity()
    try:
        game = Partida.objects(id=game_id, user_id=user_id).first()
        if not game:
            return jsonify({"error": "Partida ez da aurkitu"}), 404

        game.update(last_saved=datetime.utcnow(), game_state=game_state)
        return jsonify({"message": "Partida arrakastaz gorde da"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET /api/games/{gameId} - Load a saved game
@games_bp.route('/<string:game_id>', methods=['GET'])
@jwt_required()
def load_game(game_id):
    user_id = get_jwt_identity()
    try:
        game = Partida.objects(id=game_id, user_id=user_id).first()
        if not game:
            return jsonify({"error": "Partida ez da aurkitu"}), 404

        return jsonify({
            "game_id": str(game.id),
            "name": game.name,
            "scenario_id": game.scenario_id,
            "game_state": game.game_state
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
