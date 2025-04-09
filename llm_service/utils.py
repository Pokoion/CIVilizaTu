import json
import os
import logging
from typing import Dict, List, Any, Optional

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("llm_service.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("llm_service")

def validate_json_response(json_str: str) -> Dict[str, Any]:
    """
    Valida y limpia una respuesta JSON del LLM
    
    Args:
        json_str: String que debería contener JSON
        
    Returns:
        Un diccionario parseado del JSON
        
    Raises:
        ValueError: Si el JSON no puede ser parseado
    """
    try:
        # Intentar parsear directamente
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Si falla, intentar extraer el JSON de la respuesta
        logger.warning("Error al parsear JSON directamente, intentando extraer de la respuesta")
        try:
            # Buscar el primer { y el último }
            start_idx = json_str.find('{')
            end_idx = json_str.rfind('}')
            
            if (start_idx != -1 and end_idx != -1 and end_idx > start_idx):
                json_portion = json_str[start_idx:end_idx+1]
                return json.loads(json_portion)
            else:
                raise ValueError("No se encontró un objeto JSON válido en la respuesta")
        except Exception as e:
            logger.error(f"Error al extraer JSON de la respuesta: {e}")
            raise ValueError(f"No se pudo parsear la respuesta como JSON: {e}")

def format_ai_actions(actions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Formatea y valida las acciones de la IA antes de ejecutarlas
    
    Args:
        actions: Lista de acciones proporcionadas por el LLM
        
    Returns:
        Lista de acciones validada y formateada
    """
    formatted_actions = []
    
    for action in actions:
        action_type = action.get('type', '').lower()
        
        # Validación básica para cada tipo de acción
        if action_type == 'moveunit':
            if 'details' in action and 'unitId' in action['details'] and 'destination' in action['details']:
                formatted_actions.append(action)
            else:
                logger.warning(f"Acción de movimiento descartada por falta de detalles: {action}")
        
        elif action_type == 'buildstructure':
            if 'details' in action and 'cityId' in action['details'] and 'structureType' in action['details']:
                formatted_actions.append(action)
            else:
                logger.warning(f"Acción de construcción descartada por falta de detalles: {action}")
        
        elif action_type == 'trainunit':
            if 'details' in action and 'cityId' in action['details'] and 'unitType' in action['details']:
                formatted_actions.append(action)
            else:
                logger.warning(f"Acción de entrenamiento descartada por falta de detalles: {action}")
        
        elif action_type == 'endturn':
            formatted_actions.append(action)
        
        else:
            logger.warning(f"Tipo de acción desconocido: {action_type}")
    
    return formatted_actions

def get_fallback_model(current_model: str) -> str:
    """
    Determina un modelo alternativo si el actual no está disponible
    
    Args:
        current_model: El modelo que está fallando
        
    Returns:
        Un modelo alternativo para probar
    """
    models_hierarchy = [
        "llama3-8b-8192",
        "gemma-7b-it",
        "mixtral-8x7b-32768",
        "llama3-70b-8192"
    ]
    
    try:
        # Encontrar el índice del modelo actual
        current_index = models_hierarchy.index(current_model)
        
        # Probar con el siguiente modelo en la jerarquía
        next_index = (current_index + 1) % len(models_hierarchy)
        return models_hierarchy[next_index]
    except ValueError:
        # Si el modelo actual no está en la jerarquía, usar el predeterminado
        logger.warning(f"Modelo {current_model} no encontrado en la jerarquía. Usando el modelo predeterminado.")
        return models_hierarchy[0]

def parse_model_config_from_env() -> List[Dict[str, Any]]:
    """
    Lee la configuración de modelos desde las variables de entorno
    
    Returns:
        Lista de configuraciones de modelos
    """
    model_list = []
    
    # Leer la lista de IDs de modelos
    model_ids_str = os.environ.get('GROQ_MODEL_IDS', 'llama3-8b-8192,llama3-70b-8192,mixtral-8x7b-32768,gemma-7b-it')
    model_ids = [model_id.strip() for model_id in model_ids_str.split(',')]
    
    # Leer el modelo predeterminado
    default_model = os.environ.get('GROQ_DEFAULT_MODEL', 'llama3-8b-8192')
    
    # Crear la configuración de cada modelo
    for model_id in model_ids:
        is_default = model_id == default_model
        name_key = f"GROQ_MODEL_{model_id.replace('-', '_')}_NAME"
        desc_key = f"GROQ_MODEL_{model_id.replace('-', '_')}_DESC"
        ctx_key = f"GROQ_MODEL_{model_id.replace('-', '_')}_CTX"
        
        name = os.environ.get(name_key, model_id)
        description = os.environ.get(desc_key, f"Modelo {model_id}")
        context_length = int(os.environ.get(ctx_key, "8192"))
        
        model_list.append({
            "id": model_id,
            "name": name,
            "description": description,
            "context_length": context_length,
            "is_default": is_default
        })
    
    return model_list

def handle_groq_error(error: Exception, model_id: str) -> Dict[str, Any]:
    """
    Maneja errores de la API de Groq y genera una respuesta apropiada
    
    Args:
        error: La excepción capturada
        model_id: El ID del modelo que falló
        
    Returns:
        Diccionario con información sobre el error
    """
    error_str = str(error)
    logger.error(f"Error en la consulta a Groq: {error_str}")
    
    if "429" in error_str:
        # Error de límite de tasa
        return {
            'error': 'Límite de consultas alcanzado para este modelo',
            'error_type': 'rate_limit',
            'current_model': model_id,
            'fallback_model': get_fallback_model(model_id),
            'retry_after': 60  # Sugerir esperar 60 segundos
        }
    elif "401" in error_str or "403" in error_str:
        # Error de autenticación
        return {
            'error': 'Error de autenticación con la API de Groq',
            'error_type': 'authentication',
            'details': 'Verifica la clave API en el archivo .env'
        }
    elif "404" in error_str:
        # Modelo no encontrado
        return {
            'error': f'El modelo {model_id} no está disponible',
            'error_type': 'model_not_found',
            'fallback_model': get_fallback_model(model_id)
        }
    else:
        # Otros errores
        return {
            'error': 'Error al procesar la consulta',
            'error_type': 'general',
            'details': error_str,
            'fallback_model': get_fallback_model(model_id)
        }