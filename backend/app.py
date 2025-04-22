from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
from flask_mongoengine import MongoEngine
from flask_jwt_extended import JWTManager
from flask_dance.contrib.google import make_google_blueprint
from routes.auth import auth_bp, google_bp

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB configuration
app.config['MONGODB_SETTINGS'] = {
    'db': 'civilizatu',
    'host': 'localhost',
    'port': 27017
}
db = MongoEngine(app)

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret'
jwt = JWTManager(app)

# OAuth2 configuration
app.config['GOOGLE_OAUTH_CLIENT_ID'] = 'your_google_client_id'
app.config['GOOGLE_OAUTH_CLIENT_SECRET'] = 'your_google_client_secret'

# URL del servicio LLM
LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:5001')

@app.route('/api/llm/query', methods=['POST'])
def query_llm():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'Se requiere el campo "query"'}), 400
    
    query = data['query']
    force_error = data.get('force_error', False)
    
    try:
        # Enviar la consulta al servicio LLM
        response = requests.post(
            f"{LLM_SERVICE_URL}/api/groq",
            json={'query': query, 'force_error': force_error}
        )
        
        if response.status_code != 200:
            return jsonify({'error': 'Error en el servicio LLM'}), 500
        
        return response.json()
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/llm/status', methods=['GET'])
def get_llm_status():
    """Obtiene el estado actual del servicio LLM"""
    try:
        response = requests.get(f"{LLM_SERVICE_URL}/api/groq/status")
        if response.status_code == 200:
            return response.json()
        else:
            return jsonify({'error': 'No se pudo obtener el estado del servicio LLM'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(google_bp, url_prefix="/login")

if __name__ == '__main__':
    app.run(port=5000)
