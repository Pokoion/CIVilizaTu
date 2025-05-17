from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from flask_mongoengine import MongoEngine
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.games import games_bp
from datetime import timedelta

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB configuration
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/civilizatu')
app.config['MONGODB_SETTINGS'] = {
    'host': mongo_uri
}
db = MongoEngine(app)

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['JWT_DECODE_LEEWAY'] = 5
jwt = JWTManager(app)

# URL del servicio LLM
LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(games_bp)

if __name__ == '__main__':
    app.run(port=5000)
