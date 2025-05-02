from models.schemas import Partida, GameState
from mongoengine import ValidationError
from datetime import datetime

def get_partida_by_id(game_id, user_id):
    return Partida.objects(id=game_id, user_id=user_id).first()

def save_partida_game_state(game, game_state_dict):
    try:
        game.game_state = GameState(**game_state_dict)
        game.last_saved = datetime.utcnow()
        game.save()
        return True, None
    except ValidationError as e:
        return False, f"GameState error: {str(e)}"

def partida_to_dict(game):
    return {
        "game_id": str(game.id),
        "name": game.name,
        "scenario_id": game.scenario_id,
        "game_state": game.game_state.to_mongo().to_dict() if game.game_state else None
    }

def delete_partida(game_id, user_id):
    partida = get_partida_by_id(game_id, user_id)
    if partida:
        partida.delete()
        return True
    return False
