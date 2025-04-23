from mongoengine import Document, StringField, DateTimeField, BooleanField, ListField, DictField, EmbeddedDocument, EmbeddedDocumentField, IntField, EmbeddedDocumentListField

class Erabiltzaile(Document):
    username = StringField(required=True)
    email = StringField(required=True, unique=True)
    created_at = DateTimeField()
    last_login = DateTimeField()

class GameState(EmbeddedDocument):
    turn = IntField(default=0)
    player = DictField(default={})
    ai = DictField(default={})
    map = DictField(default={})
    current_player = StringField(required=True)

class Partida(Document):
    user_id = StringField(required=True)
    name = StringField(required=True)
    scenario_id = StringField(required=True)
    created_at = DateTimeField()
    last_saved = DateTimeField()
    is_autosave = BooleanField(default=False)
    cheats_used = ListField(StringField(), default=[])
    game_state = EmbeddedDocumentField(GameState)

class Eszenatoki(Document):
    name = StringField(required=True)
    description = StringField(required=True)
    difficulty = StringField(required=True)
    map_size = DictField(required=True)
    initial_state = DictField(required=True)
