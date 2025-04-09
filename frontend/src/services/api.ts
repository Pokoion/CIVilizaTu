import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface LLMResponse {
  response: string;
  model: string;
  model_switched?: boolean;
  previous_model?: string;
  error_type?: string;
  switch_count?: number;
}

export interface LLMStatus {
  current_model: string;
  available_models: string[];
  model_switch_count: number;
  last_error_time: number;
}

export const sendQueryToLLM = async (query: string, forceError: boolean = false): Promise<LLMResponse> => {
  try {
    const response = await api.post('/api/llm/query', { query, force_error: forceError });
    return response.data;
  } catch (error) {
    console.error('Error sending query to LLM:', error);
    throw error;
  }
};

export const getLLMStatus = async (): Promise<LLMStatus> => {
  try {
    const response = await api.get('/api/llm/status');
    return response.data;
  } catch (error) {
    console.error('Error getting LLM status:', error);
    throw error;
  }
};

export default api;
