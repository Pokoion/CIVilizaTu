from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import groq
from dotenv import load_dotenv
import time
from GroqConnector import GroqConnector

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de Groq
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_BASE_URL = os.getenv('GROQ_BASE_URL')
if not GROQ_API_KEY:
    raise ValueError("No se ha configurado GROQ_API_KEY. Asegúrate de que esté en el archivo .env")

# Configuración de modelos
DEFAULT_MODEL = os.getenv('GROQ_DEFAULT_MODEL')
ALTERNATIVE_MODELS = os.getenv('GROQ_AVAILABLE_MODELS')
TEMPERATURE = os.getenv('GROQ_TEMPERATURE')
MAX_TOKENS = os.getenv('GROQ_MAX_TOKENS')

# Estado del servicio
current_model = DEFAULT_MODEL
model_switch_count = 0
last_error_time = 0

# Inicializar el cliente Groq
try:
    groq_client = groq.Groq(api_key=GROQ_API_KEY)
except TypeError as e:
    print(f"Error al inicializar Groq client: {e}")
    
    groq_client = groq.Groq(
        api_key=GROQ_API_KEY,
        base_url=GROQ_BASE_URL,
        timeout=60
    )

def get_next_model(current_model):
    """Obtiene el siguiente modelo de la lista de modelos alternativos"""
    try:
        current_index = ALTERNATIVE_MODELS.index(current_model)
        next_index = (current_index + 1) % len(ALTERNATIVE_MODELS)
        return ALTERNATIVE_MODELS[next_index]
    except ValueError:
        # Si el modelo actual no está en la lista, volver al primero
        return ALTERNATIVE_MODELS[0]

@app.route('/api/groq', methods=['POST'])
def query_groq():
    global current_model, model_switch_count, last_error_time
    
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'Se requiere el campo "query"'}), 400
    
    query = data['query']
    forced_error = data.get('force_error', False)  # Para pruebas de error
    model_id = data.get('model_id', current_model)
    
    # Si se está forzando un error, simular un 429
    if forced_error:
        print("Forzando un error 429 para pruebas")
        previous_model = current_model
        current_model = get_next_model(current_model)
        model_switch_count += 1
        
        return jsonify({
            'response': f"Se ha excedido el límite de tokens para el modelo {previous_model}. Cambiando automáticamente al modelo {current_model}.",
            'model': current_model,
            'model_switched': True,
            'previous_model': previous_model,
            'switch_count': model_switch_count,
            'error_type': 'rate_limit_simulated'
        })
    
    try:
        # Realizar la consulta a Groq
        completion = groq_client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": "Eres un asistente útil para el juego CIVilizaTu, un juego de estrategia por turnos inspirado en Civilization."},
                {"role": "user", "content": query}
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS
        )
        
        # Extraer la respuesta
        response_text = completion.choices[0].message.content
        
        return jsonify({
            'response': response_text,
            'model': completion.model,
            'model_switched': False,
            'current_model': current_model
        })
    
    except Exception as e:
        error_str = str(e)
        print(f"Error al consultar Groq API: {error_str}")
        
        # Detectar error 429 (Rate limit exceeded)
        if "429" in error_str or "rate limit" in error_str.lower():
            previous_model = current_model
            current_model = get_next_model(current_model)
            model_switch_count += 1
            last_error_time = time.time()
            
            return jsonify({
                'response': f"Se ha excedido el límite de tokens para el modelo {previous_model}. Cambiando automáticamente al modelo {current_model}.",
                'model': current_model,
                'model_switched': True,
                'previous_model': previous_model,
                'switch_count': model_switch_count,
                'error_type': 'rate_limit'
            })
        
        return jsonify({'error': error_str}), 500

@app.route('/api/groq/status', methods=['GET'])
def get_status():
    """Devuelve el estado actual del servicio LLM"""
    return jsonify({
        'current_model': current_model,
        'available_models': ALTERNATIVE_MODELS,
        'model_switch_count': model_switch_count,
        'last_error_time': last_error_time
    })

@app.route('/eskuratuMapa', methods=['POST'])
def eskuratu_mapa():
    global current_model, model_switch_count, last_error_time
    
    data = request.json
    if not data:
        return jsonify({'error': 'No se recibieron datos'}), 400
    
    width = data.get('width')
    height = data.get('height')
    
    if not width or not height:
        return jsonify({'error': 'Se requieren los parámetros "width" y "height"'}), 400
    
    # Crear un prompt para generar el mapa
    prompt = f"""
    Genera un mapa para un juego de estrategia por turnos con las siguientes dimensiones:
    - Ancho: {width}
    - Alto: {height}
    
    El mapa debe incluir diferentes tipos de terreno:
    - Lautada (0)
    - Basoa (1)
    - Mendia (2)
    - Ura (3)
    - Desertua (4)
    - Pantanoa (5)
    - Itsasoa (6)
    
    Debes distribuir los terrenos de forma estratégica y coherente, con:
    - Masas de agua conectadas
    - Cadenas montañosas
    - Bosques en zonas apropiadas
    
    Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta:
    {{
        "terrain": [
            [0, 1, 2, ...],
            [1, 1, 3, ...],
            ...
        ]
    }}
    
    Donde "terrain" es una matriz bidimensional de {height}x{width} con valores numéricos entre 0-6 que representan los tipos de terreno.
    """
    
    try:
        # Usar el cliente directo de Groq para enviar el prompt
        completion = groq_client.chat.completions.create(
            model=current_model,
            messages=[
                {"role": "system", "content": "Eres un generador de mapas para juegos de estrategia por turnos."},
                {"role": "user", "content": prompt}
            ],
            temperature=float(TEMPERATURE),
            max_tokens=int(MAX_TOKENS)
        )
        
        # Extraer la respuesta del modelo
        response_text = completion.choices[0].message.content
        
        # Procesar la respuesta para extraer el JSON
        
        import json
        import re

        try:
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_text = json_match.group(1)
                map_data = json.loads(json_text)
                if "terrain" in map_data and isinstance(map_data["terrain"], list):
                    return jsonify(map_data)
                else:
                    return jsonify({"error": "La respuesta del modelo no contiene un mapa válido"}), 500
            else:
                return jsonify({"error": "No se encontró JSON válido en la respuesta del modelo"}), 500
        except json.JSONDecodeError:
            return jsonify({"error": "La respuesta del modelo no es un JSON válido"}), 500
        
    
    except Exception as e:
        error_str = str(e)
        print(f"Error al generar mapa: {error_str}")
        
        # Manejar el error 429 (Rate limit exceeded)
        if "429" in error_str or "rate limit" in error_str.lower():
            previous_model = current_model
            current_model = get_next_model(current_model)
            model_switch_count += 1
            last_error_time = time.time()
            
            # Generar un mapa predeterminado
            basic_terrain = [[2 for _ in range(width)] for _ in range(height)]
            return jsonify({
                "terrain": basic_terrain,
                "model_switched": True,
                "previous_model": previous_model,
                "current_model": current_model,
                "error_type": "rate_limit"
            }), 429
        
        # Para otros errores, generar un mapa predeterminado
        basic_terrain = [[3 for _ in range(width)] for _ in range(height)]
        return jsonify({"terrain": basic_terrain, "error": error_str}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
