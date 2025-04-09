from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import groq
from dotenv import load_dotenv
import time

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuración de Groq
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
if not GROQ_API_KEY:
    raise ValueError("No se ha configurado GROQ_API_KEY. Asegúrate de que esté en el archivo .env")

# Configuración de modelos
DEFAULT_MODEL = os.environ.get('GROQ_DEFAULT_MODEL', 'llama-3.3-70b-versatile')
ALTERNATIVE_MODELS = os.environ.get('GROQ_AVAILABLE_MODELS', 'llama-3.3-70b-versatile,llama-3.1-8b-instant').split(',')
TEMPERATURE = float(os.environ.get('GROQ_TEMPERATURE', '0.7'))
MAX_TOKENS = int(os.environ.get('GROQ_MAX_TOKENS', '1024'))

# Estado del servicio
current_model = DEFAULT_MODEL
model_switch_count = 0
last_error_time = 0

# Inicializar el cliente Groq
try:
    groq_client = groq.Groq(api_key=GROQ_API_KEY)
except TypeError as e:
    print(f"Error al inicializar Groq client: {e}")
    import httpx
    from groq.client import Groq
    
    groq_client = Groq(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
