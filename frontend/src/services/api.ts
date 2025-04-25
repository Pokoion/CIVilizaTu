import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchCivilizations = async (): Promise<{ name: string; attack: number; defense: number }[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'rome', attack: 1, defense: 2 },
        { name: 'greece', attack: 2, defense: 3 },
        { name: 'egypt', attack: 3, defense: 1 }
      ]); // Civilizaciones simuladas con atributos
    }, 1000); // Simula un retraso de 1 segundo
  });
};

export default api;
