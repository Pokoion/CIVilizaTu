from models.schemas import Partida, GameState
from mongoengine import ValidationError
from datetime import datetime

def get_partida_by_id(game_id, user_id):
    return Partida.objects(id=game_id, user_id=user_id).first()

def save_partida_game_state(game, game_state_dict):
    try:
        # Asegura que los campos nuevos/obligatorios estén presentes en player y ai
        for side in ["player", "ai"]:
            if side in game_state_dict:
                game_state_dict[side].setdefault("civilization", "")
                game_state_dict[side].setdefault("era", "")
                game_state_dict[side].setdefault("leader_name", "")
                game_state_dict[side].setdefault("resources", {})
                game_state_dict[side].setdefault("cities", [])
                game_state_dict[side].setdefault("units", [])
                game_state_dict[side].setdefault("technologies", [])

        # Asegura que el mapa tenga los nuevos campos requeridos
        if "map" in game_state_dict:
            game_state_dict["map"].setdefault("visible_objects", [])
            game_state_dict["map"].setdefault("fog_of_war_player", [])
            game_state_dict["map"].setdefault("fog_of_war_ai", [])
            # Asegura que tiles existe y es una matriz de strings
            if "tiles" not in game_state_dict["map"]:
                width = game_state_dict["map"].get("size", {}).get("width", 0)
                height = game_state_dict["map"].get("size", {}).get("height", 0)
                game_state_dict["map"]["tiles"] = [["" for _ in range(width)] for _ in range(height)]
            # Elimina 'terrain' si existe, ya que no está en el schema
            if "terrain" in game_state_dict["map"]:
                del game_state_dict["map"]["terrain"]
            # Si tienes size, asegúrate de que sea un dict con width y height
            if "size" in game_state_dict["map"] and not isinstance(game_state_dict["map"]["size"], dict):
                game_state_dict["map"]["size"] = dict(game_state_dict["map"]["size"])

        game.game_state = GameState(**game_state_dict)
        game.last_saved = datetime.utcnow()
        game.save()
        return True, None
    except ValidationError as e:
        return False, f"GameState error: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"

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