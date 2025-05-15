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
        print("[eskuratuMapa] ❌ No se recibieron datos", flush=True)
        return jsonify({'error': 'No se recibieron datos'}), 400
    
    width = data.get('width')
    height = data.get('height')
    
    if not width or not height:
        print("[eskuratuMapa] ❌ Faltan parámetros width/height", flush=True)
        return jsonify({'error': 'Se requieren los parámetros "width" y "height"'}), 400
    
    # Crear un prompt para generar el mapa
    prompt = f"""
Genera los siguientes JSON:

1. Un mapa llamado terrain de {width} de ancho y {height} de alto, ten en cuenta lo siguiente:
- Las dimensiones del mapa TIENEN que ser de {width}x{height} y los valores numéricos deben ser entre 0-6
- El mapa debe incluir diferentes tipos de terreno:
	- Lautada (0)
	- Basoa (1)
	- Mendia (2)
	- Ura (3)
	- Desertua (4)
	- Pantanoa (5)
	- Itsasoa (6)

- Debes distribuir los terrenos de forma estratégica y coherente, con:
	- Masas de agua conectadas
	- Cadenas montañosas
	- Bosques en zonas apropiadas

- Para ello genera un objeto JSON con esta estructura exacta:
{{
	"terrain": [
            [0, 1, 2, ...],
            [1, 1, 3, ...],
            ...
        ]
}}

2. Un objeto llamado visible-objects en el que se van a almacenar los distintos objetos que habrá repartidos por el mapa
terrain. Los posibles visible-objects son los siguientes:
- arbola: los arboles que van a haber en el mapa
- harria: las piedras que van a haber en el mapa
- urrea: las menas de oro que va a haber en el mapa
- ganadua: las vacas que va a haber en el mapa
- burdina: las menas de hierro que van a haber en el mapa
- egurra: las pilas de madera que van a haber en el mapa
- zientzia: 5 puntos de ciencia que van a haber en el mapa

- El objeto de visible-objects lo tienes que generar de esta manera:
{{
    "visible-objects": [
        {{"type": "arbola", "position": {{"x": 10, "y": 18}}}},
        {{"type": "harria", "position": {{"x": 20, "y": 18}}}},
        ...
    ]
}}
Debes tener en cuenta:
- Por cada objeto visible tienes que hacer un nuevo objeto, no sirve con mencionar la posición
- Los objetos posición de los objetos visibles es valida siempre y cuando las coordenadas estén acorde las dimensiones del mapa
y siempre y cuando la posición no coincida con un tile 3 (Ura) ni tamoco 6 (Itsasoa)
- No se pueden solapar los objetos visibles sobre si mismos, una posición única por cada objeto
- Los objetos visibles tampoco se pueden solapar con las unidades del jugador y del agente IA
- Incluye al menos 10 objetos visibles de cada tipo
- La posición de los objetos visibles no puede estar a menos de 15 tiles de distancia entre ellos

3. Dos objetos llamados player_start y ai_start que contienen los puntos de aparición de las unidades del jugador y del agente IA, es decir, tú. 
- Los objetos start los tienes que generar de la siguiente manera: 
{{
        player_start: [{{"x": 2, "y": 2}}, {{"x": 3, "y": 3}}], 
        ai_start: [{{"x": 30, "y": 30}}, {{"x": 31, "y": 31}}]
}}
Debes tener en cuenta: 
- La primera fila indica las coordenadas dentro del mapa terrain de las unidades settler (colono) y soldier (soldado) del jugador
	- El primer par de coordenadas indica el punto de aparición del settler del jugador, mientras que el segundo par indica el del
	  soldier del jugador
- La segunda fila indica lo mismo pero para el agente IA.
- Las coordenadas no se pueden solapar
- Las coordenadas de las unidades es valida siempre y cuando las coordenadas estén acorde las dimensiones del mapa
y siempre y cuando la posición no coincida con un tile 3 (Ura) ni tamoco 6 (Itsasoa)
- Los settler y soldier de ambos tienen que aparecer a 1 tile de distancia, puede ser horizontalmente, verticalmente o en diagonal siempre y cuando el mapa lo permita
- Las unidades del jugador y del agente IA deben aparecer lejos, por ello la distancia entre los puntos de aparición debe ser notable

QUIERO QUE SOLAMENTE DEVUELVAS UN JSON DONDE SE GUARDA terrain, visible-objects y ambost start. LOS JSON, NADA MAS. NO QUIERO NINGUN TEXTO EXPLICATIVO NI NINGUN TIPO DE COMENTARIO.
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
        #return jsonify(response_text)
        # Procesar la respuesta para extraer el JSON
        import json
        import re

        try:
            # Buscar el bloque JSON en el texto
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_text = json_match.group(1)
                map_data = json.loads(json_text)

                # Validar que los datos contengan terrain, visible-objects y start
                if "terrain" in map_data and isinstance(map_data["terrain"], list) and \
                   "visible-objects" in map_data and isinstance(map_data["visible-objects"], list) and \
                   "player_start" in map_data and isinstance(map_data["player_start"], list) and \
                   "ai_start" in map_data and isinstance(map_data["ai_start"], list):
                    print(f"[eskuratuMapa] ✅ Mapa generado por LLM (modelo: {current_model})", flush=True)
                    # Devolver un único JSON con los datos
                    return jsonify({
                        "terrain": map_data["terrain"],
                        "visible-objects": map_data["visible-objects"],
                        "player_start": map_data["player_start"],
                        "ai_start": map_data["ai_start"],
                    })
                else:
                    print("[eskuratuMapa] ❌ El JSON del modelo no contiene los datos esperados", flush=True)
                    return jsonify({"error": "La respuesta del modelo no contiene los datos esperados (terrain, visible-objects, start)"}), 500
            else:
                print("[eskuratuMapa] ❌ No se encontró un bloque JSON válido en la respuesta del modelo", flush=True)
                return jsonify({"error": "No se encontró un bloque JSON válido en la respuesta del modelo"}), 500
        except json.JSONDecodeError:
            print("[eskuratuMapa] ❌ La respuesta del modelo no es un JSON válido", flush=True)
            return jsonify({"error": "La respuesta del modelo no es un JSON valido"}), 500
    
    except Exception as e:
        error_str = str(e)
        print(f"[eskuratuMapa] ⚠️ Error al generar mapa: {error_str}", flush=True)
        
        # Manejar el error 429 (Rate limit exceeded)
        if "429" in error_str or "rate limit" in error_str.lower():
            previous_model = current_model
            current_model = get_next_model(current_model)
            model_switch_count += 1
            last_error_time = time.time()
            
            # Generar un mapa predeterminado
            basic_terrain = [[2 for _ in range(width)] for _ in range(height)]
            print(f"[eskuratuMapa] 🚧 Rate limit: devolviendo mapa DEFAULT (modelo cambiado a {current_model})", flush=True)
            return jsonify({
                "terrain": basic_terrain,
                "model_switched": True,
                "previous_model": previous_model,
                "current_model": current_model,
                "error_type": "rate_limit"
            }), 429
        
        # Para otros errores, generar un mapa predeterminado
        basic_terrain = [[3 for _ in range(width)] for _ in range(height)]
        print("[eskuratuMapa] 🚧 Error inesperado: devolviendo mapa DEFAULT", flush=True)
        return jsonify({"terrain": basic_terrain, "error": error_str}), 500
    
@app.route('/eskuratuEkintza', methods=['POST'])
def eskuratu_ekintza():
    global current_model, model_switch_count, last_error_time

    data = request.json
    if not data:
        return jsonify({'error': 'No se recibió el estado del juego (game state)'}), 400

    game_state = data.get('game_state_visible')
    if not game_state:
        return jsonify({'error': 'El campo "game_state" es obligatorio'}), 400

    # Crear un prompt para generar las acciones
    prompt = f"""
    He aquí el estado del juego:
    {game_state}

    Tu eres un agente IA que está jugando a un juego de estrategia por turnos. 
    Tu objetivo es expandir tu imperio, conquistar ciudades enemigas, reunir recursos
    y ganarle a tu contrincante. Recibiras el estado del juego y deberás de generar
    una serie de acciones que deberás de realizar en este turno.

    Es tu responsabilidad analizar el estado del juego, formular una estrategia y 
    definir las acciones que debes de realizar este turno. Sigue estos pasos:

    1. Analiza el estado del juego, teniendo esto en cuenta:
    - La posición, situación y edificios de tus ciudades
    - La posición y estadisticas de tus unidades
    - Los recursos que tienes y de donde los obtienes
    - Zonas exploradas en el mapa
    - La posición y fortalezas de las unidades enemigas
    - Oportunidades (recursos, tecnologías)
    - Fog of war (zonas no exploradas)

    2. Formula una estrategia basada en estas prioridades:
    - Exploracion para descubrir recursos y ciudades enemigas
    - Asegurar fuentes de ingresos
    - Desarrollo de ciudades para para reclutar unidades
    - Investigación de tecnologías para conseguir la ventaja
    - Regular la economía y la fuerza militar

    3. Genera una lista de acciones que deberás de realizar en este turno.
    Puedes realizar múltiples acciones hasta que se acaben los puntos de movimiento.
    Estas acciones pueden incluir:
    - moveUnit: mover una unidad a una nueva posición
    - attackUnit: atacar una unidad enemiga
    - attackCity: atacar una ciudad enemiga
    - foundCity: fundar una nueva ciudad
    - changeCityPopulationProduction: Elegir si quieres aumentar la población de una ciudad en 1 (si es true) o mantenerla (si es false). 
      Es importante saber que cada ciudadano consume 1 de comida cada turno.
    - collectResource: recolectar un recurso de un tile
    - buildBuilding: construir un edificio en una ciudad.
    - trainUnit: reclutar una nueva unidad en una ciudad. Solo puedes entrenar unidades que sean de tu civilización o que sea null (la civilización)
    - deployUnit: desplegar una unidad en una posición
    - researchTech: investigar una nueva tecnología
    - upgradeCityEra: actualizar la era de una ciudad
    - endTurn: finalizar el turno

    este es el formato que debes de seguir para cada acción:
    {{
      "type": "moveUnit",
      "payload": {{
        "unitId": "string",
        "position": {{
          "x": 0,
          "y": 0
        }}
      }}
    }},
    {{
      "type": "attackUnit",
      "payload": {{
        "attackerId": "string",
        "defenderId": "string"
      }}
    }},
    {{
      "type": "attackCity",
      "payload": {{
        "attackerId": "string",
        "cityId": "string"
      }}
    }},
    {{
      "type": "foundCity",
      "payload": {{
        "name": "string",
        "unitId": "string"
      }}
    }},
    {{
      "type": "changeCityPopulationProduction",
      "payload": {{
        "cityId": "string",
        "change": boolean
      }}
    }},
    {{
      "type": "collectResource",
      "payload": {{
        "unitId": "string",
        "position": {{
          "x": 0,
          "y": 0
        }}
      }}
    }},
    {{
      "type": "buildBuilding",
      "payload": {{
        "cityId": "string",
        "buildingType": "string"
      }}
    }},
    {{
      "type": "trainUnit",
      "payload": {{
        "cityId": "string",
        "unitType": "string"
      }}
    }},
    {{
      "type": "deployUnit",
      "payload": {{
        "cityId": "string",
        "unitType": "string",
        "position": {{
          "x": 0,
          "y": 0
        }}
      }}
    }},
    {{
      "type": "researchTech",
      "payload":{{
        "techId": "string"
      }}
    }},
    {{
      "type": "upgradeCityEra",
      "payload": {{
        "cityId": "string"
      }}
    }},
    {{
      "type": "endTurn",
      "payload": {{}}
    }}

    Tu respuesta debe ser un JSON que contenga una lista de acciones, de esta manera:
    {{
        "actions": [
            {{
                "type": "tipo de acción",
                "payload": {{
                  //dependiendo del tipo de acción
                }}
            }},
            //...mas acciones...
            {{
                "type": "endTurn",
                "payload": {{}}
            }}
        ],
        "reasoning": "Explicacion detallada de la estrategia y de los planes para siguientes turnos",
        "analysis": "Analisis del estado del juego y de la posicion del contrincante"
    }}

    He aquí un ejemplo de respuesta:
    {{
        "actions": [
            {{
                "type": "moveUnit",
                "payload": {{
                    "unitId": "string",
                    "position": {{
                        "x": 0,
                        "y": 0
                    }}
                }}
            }},
            {{
                "type": "attackUnit",
                "payload": {{
                    "attackerId": "string",
                    "defenderId": "string"
                }}
            }},
            {{
                "type": "foundCity",
                "payload": {{
                    "name": "string",
                    "unitId": "string"
                }}
            }},
            {{
                "type": "endTurn",
                "payload": {{}}
            }}
        ],
        "reasoning": "Explicacion detallada de la estrategia y de los planes para siguientes turnos",
        "analysis": "Analisis del estado del juego y de la posicion del contrincante"
    }}

    Ten en cuenta:
    - Piensa de manera estratégica y a largo plazo
    - Gestiona los recursos de manera eficiente
    - Adecúa tus acciones a la situación del juego
    - Busca un equilibrio entre la fuerza militar y el desarrollo económico
    - Aprovecha tus fortalezas y explota las debilidades del enemigo
    - Siempre termina el turno con la acción endTurn
    - Da un razonamiento detallado de tus acciones
    - Respeta las reglas y mecanicas del juego
        -He aquí un todas los objetos, unidades, edificios y recursos que hay en el juego:
        {{
            "map_elements": [
                {{"id": "arbola", "name": "Arbola", "bonus": {{"food": 1, "natural_resources": 1}}}},
                {{"id": "harria", "name": "Harria", "bonus": {{"natural_resources": 2}}}},
                {{"id": "urrea", "name": "Urrea", "bonus": {{"gold": 3}}}},
                {{"id": "ganadua", "name": "Ganadua", "bonus": {{"food": 2}}}},
                {{"id": "burdina", "name": "Burdina", "bonus": {{"natural_resources": 2, "gold": 1}}}},
                {{"id": "egurra", "name": "Egurra", "bonus": {{"natural_resources": 1}}}}
            ],
            "city_eras": [
                {{"id": "Antzinaroa", "name": "Antzinaroa", "next_era": "Erdi Aroa", "upgrade_cost": {{"gold": 200, "natural_resources": 100}}, "base_production": {{"food": 2, "gold": 1, "culture": 0, "science": 0, "natural_resources": 1}}, "building_limit": 5}},
                {{"id": "Erdi Aroa", "name": "Erdi Aroa", "next_era": "Aro Modernoa", "upgrade_cost": {{"gold": 400, "natural_resources": 200}}, "base_production": {{"food": 4, "gold": 3, "culture": 1, "science": 1, "natural_resources": 2}}, "building_limit": 6}},
                {{"id": "Aro Modernoa", "name": "Aro Modernoa", "next_era": null, "upgrade_cost": {{"gold": 0, "natural_resources": 0}}, "base_production": {{"food": 6, "gold": 5, "culture": 2, "science": 3, "natural_resources": 3}}, "building_limit": 7}}
            ],
            "units": [
                {{"id": "militar", "type": "Militar", "health": 75, "strength": 15, "movement_points": 3, "range": 1, "civilization": null, "cost": {{"food": 10, "gold": 5}}}},
                {{"id": "kolono", "type": "Kolono", "health": 50, "strength": 5, "movement_points": 4, "range": 1, "civilization": null, "cost": {{"food": 20, "gold": 15}}}},
                {{"id": "langile", "type": "Langile", "health": 50, "strength": 5, "movement_points": 3, "range": 1, "civilization": null, "cost": {{"food": 15, "gold": 8}}}},
                {{"id": "gudaria", "type": "Gudaria", "health": 150, "strength": 20, "movement_points": 3, "range": 1, "civilization": "euskaldunak", "cost": {{"food": 25, "gold": 20}}}},
                {{"id": "arkari_zalduna", "type": "Arkari zalduna", "health": 125, "strength": 15, "movement_points": 4, "range": 3, "civilization": "mongolak", "cost": {{"food": 30, "gold": 20}}}},
                {{"id": "atlatl_erabiltzailea", "type": "Atlatl erabiltzailea", "health": 100, "strength": 20, "movement_points": 2, "range": 3, "civilization": "mayak", "cost": {{"food": 18, "gold": 12}}}},
                {{"id": "piromanoa", "type": "Piromanoa", "health": 80, "strength": 40, "movement_points": 2, "range": 1, "civilization": "bizantziarrak", "cost": {{"food": 22, "gold": 25}}}},
                {{"id": "arkeroa", "type": "Arkeroa", "health": 60, "strength": 15, "movement_points": 2, "range": 4, "civilization": null, "cost": {{"food": 12, "gold": 10}}}},
                {{"id": "tankea", "type": "Tankea", "health": 200, "strength": 50, "movement_points": 3, "range": 3, "civilization": null, "cost": {{"natural_resources": 50, "gold": 60}}}},
                {{"id": "itsasontzia", "type": "Itsasontzia", "health": 200, "strength": 50, "movement_points": 3, "range": 3, "civilization": null, "cost": {{"natural_resources": 30, "gold": 50}}}}
            ],
            "resources": [
                {{"id": "food", "name": "Janaria", "description": "Hiriko biztanleria hazten du"}},
                {{"id": "gold", "name": "Urrea", "description": "Eraikinak erosteko"}},
                {{"id": "natural_resources", "name": "Baliabide Naturalak", "description": "Eraikuntzarako"}},
                {{"id": "science", "name": "Zientzia", "description": "Teknologia berriak garatzeko"}},
                {{"id": "culture", "name": "Kultura", "description": "Garaipen baldintzetarako"}}
            ],
            "buildings": [
                {{"id": "aletegia", "name": "Aletegia", "bonus": "+2 food", "requirement": "buztingintza", "cost": {{"gold": 5, "natural_resources": 3, "culture": 0}}}},
                {{"id": "kuartela", "name": "Kuartela", "bonus": "Unitate militarren ekoizpena", "requirement": "burdina", "cost": {{"gold": 10, "natural_resources": 5, "culture": 2}}}},
                {{"id": "eskola", "name": "Eskola", "bonus": "+1 culture (biztanleko)", "requirement": "idazketa", "cost": {{"gold": 8, "natural_resources": 4, "culture": 4}}}},
                {{"id": "merkatua", "name": "Merkatua", "bonus": "+2 gold", "requirement": "merkataritza", "cost": {{"gold": 15, "natural_resources": 6, "culture": 3}}}},
                {{"id": "harresia", "name": "Harresia", "bonus": "Hiriaren defentsa + 50", "requirement": null, "cost": {{"gold": 6, "natural_resources": 10, "culture": 1}}}},
                {{"id": "unibertsitatea", "name": "Unibertsitatea", "bonus": "+2 culture (biztanleko)", "requirement": "ingeniaritza", "cost": {{"gold": 20, "natural_resources": 8, "culture": 8}}}}
            ],
            "technologies": [
                {{"id": "nekazaritza", "name": "Nekazaritza", "bonus": "Janaria +100 eta baliabide naturalak lortu ahal", "cost": 3, "era": "Antzinaroa", "dependencies": [], "x": 100, "y": 100}},
                {{"id": "idazketa", "name": "Idazketa", "bonus": "Eskolak desblokeatu", "cost": 8, "era": "Antzinaroa", "dependencies": ["nekazaritza"], "x": 300, "y": 100}},
                {{"id": "penizilina", "name": "Penizilina", "bonus": "Unitate guztien bizitza +30", "cost": 15, "era": "Aro Modernoa", "dependencies": ["idazketa"], "x": 500, "y": 50}},
                {{"id": "ekonomia", "name": "Ekonomia", "bonus": "Txanda bakoitzeko hirietatik lortzen en urre kopurua +5", "cost": 14, "era": "Erdi Aroa", "dependencies": ["idazketa"], "x": 500, "y": 170}},
                {{"id": "merkataritza", "name": "Merkataritza", "bonus": "Merkatuak desblokeatu", "cost": 12, "era": "Aro Modernoa", "dependencies": ["ekonomia"], "x": 700, "y": 130}},
                {{"id": "burdina", "name": "Burdina", "bonus": "+5 eraso zibilizazioaren unitate bakoitzeko eta kuartelak desblokeatu", "cost": 8, "era": "Antzinaroa", "dependencies": ["nekazaritza"], "x": 300, "y": 300}},
                {{"id": "meatzaritza", "name": "Meatzaritza", "bonus": "Natural_resources +100", "cost": 4, "era": "Antzinaroa", "dependencies": ["burdina"], "x": 500, "y": 300}},
                {{"id": "ingeniaritza", "name": "Ingeniaritza", "bonus": "Unibertsitateak desblokeatzen ditu", "cost": 12, "era": "Erdi Aroa", "dependencies": ["meatzaritza"], "x": 700, "y": 250}},
                {{"id": "artilleria", "name": "Artilleria", "bonus": "Unitate militar hobeak (+10 eraso zibilizazioaren unitate bakoitzeko) eta tankeak desblokeatu", "cost": 16, "era": "Aro Modernoa", "dependencies": ["ingeniaritza"], "x": 900, "y": 250}},
                {{"id": "espaziontzia", "name": "Espaziontzia", "bonus": "Espaziontzia eraiki eta partida irabazi", "cost": 1000, "era": "Aro Modernoa", "dependencies": [], "x": 1100, "y": 250}},
                {{"id": "arkitektura", "name": "Arkitektura", "bonus": "Produkzio guztien txanda kopurua murriztu", "cost": 14, "era": "Erdi Aroa", "dependencies": ["meatzaritza"], "x": 700, "y": 370}},
                {{"id": "buztingintza", "name": "Buztingintza", "bonus": "Aletegia desblokeatu", "cost": 5, "era": "Antzinaroa", "dependencies": [], "x": 100, "y": 400}},
                {{"id": "industria", "name": "Industria", "bonus": "Produkzio guztien txanda kopurua murriztu", "cost": 14, "era": "Aro Modernoa", "dependencies": ["buztingintza"], "x": 300, "y": 420}},
                {{"id": "arku_tiroa", "name": "Arku Tiroa", "bonus": "Distantziako oinarrizko unitatea desblokeatu", "cost": 15, "era": "Antzinaroa", "dependencies": [], "x": 100, "y": 520}},
                {{"id": "gurpila", "name": "Gurpila", "bonus": "Unitate guztien mugimenduak +3", "cost": 10, "era": "Antzinaroa", "dependencies": [], "x": 100, "y": 640}},
                {{"id": "nabigazioa", "name": "Nabigazioa", "bonus": "Ura zeharkatzea ahalbidetzen duen itsasontzia desblokeatzen du", "cost": 6, "era": "Erdi Aroa", "dependencies": [], "x": 100, "y": 760}}
            ]
        }}

        Detalles a tener en cuenta:
        - Solo los kolonos pueden fundar ciudades
        - Solo los langiles pueden recolectar recursos y solo cuando la tecnnoloía neazaritza esta investigada
        - Los barcos solo se pueden mover por tiles de 3 (Ura) y 6 (Itsasoa)
        - Solo se pueden entrenar unidades en ciudades que tengan un kuartela y una unidad por cuartel. Si en una ciudad hay 2 cuarteles, puedes entrenar 2 unidades a la vez.
        - Depsués de atacar una ciudad o unidad enemiga, la unidad atacante no puede moverse
        - Para recolectar recursos a partir de los map_elements el langile tiene que estar a un tile de distancia
        - Para atacar tienes que respetar el rango de ataque de la unidad
        - Para poder investigar la tecnología del cohete espacial tienes que haber investigado antes
        todas las tecnologías anteriores
        - El coste de tecnologías se mide en puntos de ciencia
        - Empizas la partida en la era Antzinaroa, cuando investigas 5 tecnologías pasas a la era Erdi Aroa y
        cuando investigas 5 tecnologías mas pasas a la era Aro Modernoa
        - Cada ciudadano consume 1 de comida por turno, así que tienes que asegurarte de tener comida suficiente porque sino
        si no hay suficiente comida, se perdera un ciudadano por ciudad cada turno hasta que haya comida suficiente
        - Ciertas unidades y edificios requieren haber investigado ciertas tecnologías para poder ser construidos o entrenados, esas dependencias
        se encuentran en el campo dependencies de cada unidad y edificio
        - Ten en cuenta los puntos de movimiento tuyos, de tus unidades y de los tiles
        - Ten en cuenta que a medida que avanzas de era, las ciudades pueden tener un edificio mas

    Ahora, basandote en el estado del juego que te he dado, analiza la situación, formula una estrategia,
    y genera tus acciones, razonamiento y análisis para este turno. Evita el uso de las tildes.
    """

    try:
        # Usar el cliente directo de Groq para enviar el prompt
        completion = groq_client.chat.completions.create(
            model=current_model,
            messages=[
                {"role": "system", "content": "Eres un generador de acciones para un agente IA en un juego de estrategia por turnos."},
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
            # Buscar el bloque JSON en el texto
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
            if json_match:
                json_text = json_match.group(1)
                actions_data = json.loads(json_text)

                # Validar que los datos contengan "actions"
                if "actions" in actions_data and isinstance(actions_data["actions"], list):
                    # Devolver un único JSON con las acciones
                    return jsonify(actions_data)
                else:
                    return jsonify({"error": "La respuesta del modelo no contiene el objeto esperado 'actions'"}), 500
            else:
                return jsonify({"error": "No se encontró un bloque JSON válido en la respuesta del modelo"}), 500
        except json.JSONDecodeError:
            return jsonify({"error": "La respuesta del modelo no es un JSON válido"}), 500

    except Exception as e:
        error_str = str(e)
        print(f"Error al generar acciones: {error_str}")
        
        # Manejar el error 429 (Rate limit exceeded)
        if "429" in error_str or "rate limit" in error_str.lower():
            previous_model = current_model
            current_model = get_next_model(current_model)
            model_switch_count += 1
            last_error_time = time.time()
            
            return jsonify({
                "actions": [],
                "model_switched": True,
                "previous_model": previous_model,
                "current_model": current_model,
                "error_type": "rate_limit"
            }), 429
        
        # Para otros errores, devolver un mensaje de error
        return jsonify({"error": error_str}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
