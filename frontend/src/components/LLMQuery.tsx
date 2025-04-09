import React, { useState, useEffect } from 'react';
import { sendQueryToLLM, getLLMStatus, LLMResponse } from '../services/api';
import Notification from './Notification';
import '../styles/LLMQuery.css';

interface QueryHistory {
  query: string;
  response: string;
  model?: string;
  timestamp: Date;
}

const LLMQuery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<LLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [notification, setNotification] = useState<{
    visible: boolean;
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  }>({ visible: false, type: 'info', message: '' });
  const [modelInfo, setModelInfo] = useState<{
    currentModel: string;
    switchCount: number;
  }>({ currentModel: '', switchCount: 0 });

  // Cargar historial del almacenamiento local al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('llmQueryHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setHistory(parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error('Error parsing history from localStorage', e);
      }
    }
    
    // Cargar información del modelo actual
    getModelStatus();
  }, []);

  // Obtener el estado del modelo
  const getModelStatus = async () => {
    try {
      const status = await getLLMStatus();
      setModelInfo({
        currentModel: status.current_model,
        switchCount: status.model_switch_count
      });
    } catch (err) {
      console.error('Error al obtener el estado del modelo:', err);
    }
  };

  // Guardar historial en almacenamiento local cuando cambie
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('llmQueryHistory', JSON.stringify(history));
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent, forceError: boolean = false) => {
    e.preventDefault();
    if (!query.trim() && !forceError) return;

    setIsLoading(true);
    setError('');
    setResponse(null);
    
    try {
      // Si es prueba de carga y no hay consulta, usar un mensaje predeterminado
      const queryText = forceError && !query.trim()
        ? "Esta es una prueba de límite de tokens para probar el cambio de modelo."
        : query;
      
      const llmResponse = await sendQueryToLLM(queryText, forceError);
      setResponse(llmResponse);
      
      // Verificar si hubo un cambio de modelo
      if (llmResponse.model_switched) {
        setNotification({
          visible: true,
          type: 'warning',
          message: `Se ha cambiado al modelo ${llmResponse.model} debido a límites de tokens en ${llmResponse.previous_model}.`
        });
        
        // Actualizar información del modelo
        await getModelStatus();
      }
      
      // Añadir al historial
      const newHistoryItem: QueryHistory = {
        query: queryText,
        response: llmResponse.response,
        model: llmResponse.model,
        timestamp: new Date()
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Mantener solo los últimos 10
    } catch (err) {
      setError('Error al comunicarse con el LLM. Por favor, inténtalo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: QueryHistory) => {
    setQuery(item.query);
    setResponse(item.response ? { response: item.response, model: item.model || '' } : null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('llmQueryHistory');
  };

  const closeNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  return (
    <div className="game-container">
      {notification.visible && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.visible}
          onClose={closeNotification}
          duration={7000}
        />
      )}
      
      <div className="llm-query-container">
        <div className="llm-header">
          <h2>Consulta al Asistente IA de CIVilizaTu</h2>
          <div className="model-badge">
            Modelo actual: <span>{modelInfo.currentModel}</span>
            {modelInfo.switchCount > 0 && (
              <span className="model-switches"> (Cambios: {modelInfo.switchCount})</span>
            )}
          </div>
        </div>
        
        <form className="llm-query-form" onSubmit={(e) => handleSubmit(e, false)}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu pregunta sobre CIVilizaTu aquí..."
            rows={4}
            disabled={isLoading}
          />
          <div className="button-group">
            <button 
              type="button" 
              className="test-button"
              disabled={isLoading}
              onClick={(e) => handleSubmit(e, true)}
            >
              Probar límite de tokens
            </button>
            <button type="submit" disabled={isLoading || (!query.trim())}>
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Enviando...
                </>
              ) : 'Enviar Consulta'}
            </button>
          </div>
        </form>
        
        {error && <div className="error-message">{error}</div>}
        
        {response && (
          <div className="response-container">
            <h3>Respuesta del Asistente:</h3>
            <div className="response-content">{response.response}</div>
            {response.model && (
              <div className="response-model">
                Modelo utilizado: {response.model}
              </div>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-container">
          <div className="history-title">
            <h3>Historial de Consultas</h3>
            <button className="clear-history" onClick={clearHistory}>
              Borrar historial
            </button>
          </div>
          <ul className="history-list">
            {history.map((item, index) => (
              <li 
                key={index} 
                className="history-item"
                onClick={() => loadFromHistory(item)}
              >
                <div className="history-query">{item.query}</div>
                <div className="history-response">
                  {item.response.substring(0, 100)}...
                  {item.model && <span className="history-model">{item.model}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LLMQuery;
