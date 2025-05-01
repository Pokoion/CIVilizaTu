import axios from 'axios';
import { TERRAIN_TYPES, MAP_DEFAULT_SIZE } from '../utils/Constants';
import { TerrainType, Unit, City, MapState } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchCivilizations = async (): Promise<{ name: string; attack: number; defense: number }[]> => {
  return new Promise((resolve) => {
      resolve([
        { name: 'rome', attack: 1, defense: 2 },
        { name: 'greece', attack: 2, defense: 3 },
        { name: 'egypt', attack: 3, defense: 1 }
      ]); // Civilizaciones simuladas con atributos
  });
};

export const fetchUnits = async (): Promise<{ name: string; attack: number; defense: number }[]> => {
  return new Promise((resolve) => {
      resolve([
        { name: 'swordsman', attack: 5, defense: 3 },
        { name: 'archer', attack: 3, defense: 2 },
        { name: 'cavalry', attack: 4, defense: 4 }
      ]); // Unidades simuladas con atributos
  });
};

export const loadMap = async (): Promise<{
  map: MapState['map'];
  units: Unit[];
  cities: City[];
}> => {
  return new Promise(async (resolve) => {
    const width = MAP_DEFAULT_SIZE;
    const height = MAP_DEFAULT_SIZE;

    // Obtener los tipos de terreno desde el nuevo constant
    const terrainTypes = TERRAIN_TYPES;

    // Generar tiles aleatorios tipados
    const tiles: TerrainType[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () =>
        terrainTypes[Math.floor(Math.random() * terrainTypes.length)]
      )
    );

    // Generar fog_of_war (todo oculto inicialmente)
    const fog_of_war = Array.from({ length: height }, () =>
      Array(width).fill(false)
    );

    // Crear el objeto MapState
    const map = {
      size: { width, height },
      tiles,
      fog_of_war,
    };

    // Simular una unidad
    const units = [
      {
        id: "unit1",
        type: "settler",
        position: { x: 18, y: 18 },
        movement_points: 5,
        movement_points_left: 5,
      },
      {
        id: "unit2",
        type: "settler",
        position: { x: 10, y: 18 },
        movement_points: 5,
        movement_points_left: 5,
      }
    ];

    const cities = [
      {
        id: "city1",
        name: "Roma",
        position: { x: 11, y: 18 },
      },
      {
        id: "city2",
        name: "Atenas",
        position: { x: 9, y: 18 },
      }
    ];
    resolve({ map, units, cities });
  });
};

export const saveGame = async (gameState: any): Promise<void> => {
  return new Promise((resolve) => {
      resolve(); // Guardar el estado del juego simulado
  });
};  

export default api;