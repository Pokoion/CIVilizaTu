from mongoengine import (
    Document, EmbeddedDocument, StringField, DateTimeField, BooleanField, ListField, DictField,
    EmbeddedDocumentField, EmbeddedDocumentListField, IntField, FloatField
)

class Erabiltzaile(Document):
    username = StringField(required=True)
    email = StringField(required=True, unique=True)
    password_hash = StringField()
    created_at = DateTimeField()
    last_login = DateTimeField()

class Eszenatoki(Document):
    name = StringField(required=True)
    description = StringField(required=True)
    difficulty = StringField(required=True)
    map_size = DictField(required=True)
    initial_state = DictField(required=True)

class Position(EmbeddedDocument):
    x = IntField(required=True)
    y = IntField(required=True)

class trainingElements(EmbeddedDocument):
    id = StringField(required=True)
    type = StringField()
    turnsLeft = IntField()

class Resources(EmbeddedDocument):
    food = IntField()
    natural_resources = IntField()
    science = IntField()
    gold = IntField()
    culture = IntField()


class City(EmbeddedDocument):
    id = StringField(required=True)
    name = StringField(required=True)
    position = EmbeddedDocumentField(Position)
    population = IntField()
    buildings = ListField(StringField(), default=[])  
    production = EmbeddedDocumentField(Resources)
    owner = StringField(required=True)  
    defense = IntField(default=100)    
    health = IntField(default=100)      
    era = StringField()
    training = EmbeddedDocumentField(trainingElements)  

class Unit(EmbeddedDocument):
    id = StringField(required=True)
    type = StringField(required=True)
    position = EmbeddedDocumentField(Position)
    movement_points = IntField()
    movement_points_left = IntField()
    strength = IntField()
    health = IntField()
    range = IntField()
    visible = BooleanField()


class PlayerState(EmbeddedDocument):
    civilization = StringField()
    era = StringField()
    leader_name = StringField()
    resources = EmbeddedDocumentField(Resources)
    cities = EmbeddedDocumentListField(City)
    units = EmbeddedDocumentListField(Unit)
    technologies = ListField(StringField(), default=[])

class MapSize(EmbeddedDocument):
    width = IntField()
    height = IntField()

class VisibleObject(EmbeddedDocument):
    type = StringField(required=True)
    position = EmbeddedDocumentField(Position)


class GameMap(EmbeddedDocument):
    size = EmbeddedDocumentField(MapSize)
    visible_objects = EmbeddedDocumentListField(VisibleObject)
    fog_of_war_player = ListField(ListField(IntField()))
    fog_of_war_ai = ListField(ListField(IntField()))
    terrain = ListField(ListField(StringField()))

class GameState(EmbeddedDocument):
    turn = IntField()
    current_player = StringField()
    cheats_used = ListField(StringField(), default=[])
    player = EmbeddedDocumentField(PlayerState)
    ai = EmbeddedDocumentField(PlayerState)
    map = EmbeddedDocumentField(GameMap)

class Partida(Document):
    user_id = StringField(required=True)
    name = StringField(required=True)
    scenario_id = StringField(required=True)
    created_at = DateTimeField()
    last_saved = DateTimeField()
    cheats_used = ListField(StringField(), default=[])
    game_state = EmbeddedDocumentField(GameState)
