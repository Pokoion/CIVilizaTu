import axios from "axios";
import { AiAction } from '../types';
import { CIVILIZATIONS_BY_ID, UNITS } from '../utils/Constants';
import { Unit } from '../types';
import { cleanUnit } from '../utils/Cleaner';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const createGame = async ({
  name,
  scenario_id,
  playerCiv,
  aiCiv,
  playerName,
  aiName,
  map_size,
  map_type
}: {
  name: string;
  scenario_id: string;
  playerCiv: string;
  aiCiv: string;
  playerName: string;
  aiName: string;
  map_size: { width: number; height: number };
  map_type: number;
}) => {
  const token = localStorage.getItem("jwt_token");

  const playerInitialResources = CIVILIZATIONS_BY_ID[playerCiv]?.initial_resources || { food: 0, natural_resources: 0, science: 0, gold: 0, culture: 0 };
  const aiInitialResources = CIVILIZATIONS_BY_ID[aiCiv]?.initial_resources || { food: 0, natural_resources: 0, science: 0, gold: 0, culture: 0 };

  const game_state = {
    turn: 1,
    current_player: "player",
    cheats_used: [],
    player: {
      civilization: playerCiv,
      era: "Antzinaroa",
      leader_name: playerName,
      resources: { ...playerInitialResources },
      cities: [],
      units: [],
      technologies: [],
    },
    ai: {
      civilization: aiCiv,
      era: "Antzinaroa",
      leader_name: aiName,
      resources: { ...aiInitialResources },
      cities: [],
      units: [],
      technologies: [],
    },
    map: {
      size: { width: map_size.width, height: map_size.height },
      visible_objects: [],
      fog_of_war_player: [],
      fog_of_war_ai: [],
      tiles: [],
    },
  };

  const body = {
    name,
    scenario_id,
    game_state,
    map_width: map_size.width,
    map_height: map_size.height,
    map_type,
  };

  let response;
  try {
    response = await axios.post(`${API_URL}/api/games`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err: any) {
    throw err; // Deja que el frontend gestione el error recibido del backend
  }


  const { game, player_positions, ai_positions } = response.data;

  // --- AJUSTE DE MAPA ---
  // Asegura que el mapa sea 50x50 (recorta o rellena si es necesario)
  const TARGET_SIZE = 50;
  let tiles = game.game_state.map.tiles;

  if (!Array.isArray(tiles)) tiles = [];
  // Ajusta filas
  if (tiles.length > TARGET_SIZE) {
    tiles = tiles.slice(0, TARGET_SIZE);
  } else if (tiles.length < TARGET_SIZE) {
    const emptyRow = new Array(TARGET_SIZE).fill(0);
    while (tiles.length < TARGET_SIZE) {
      tiles.push([...emptyRow]);
    }
  }
  // Ajusta columnas en cada fila
  tiles = tiles.map((row: number[] = []) => {
    if (!Array.isArray(row)) row = [];
    if (row.length > TARGET_SIZE) {
      return row.slice(0, TARGET_SIZE);
    } else if (row.length < TARGET_SIZE) {
      return [...row, ...new Array(TARGET_SIZE - row.length).fill(0)];
    }
    return row;
  });

  game.game_state.map.tiles = tiles;

  // Busca los datos base de las unidades
  const kolonoBase = UNITS.find(u => u.id === "kolono");
  const militarBase = UNITS.find(u => u.id === "militar");

  // Crea las unidades iniciales con owner para el frontend
  const playerUnits: Unit[] = [];
  if (player_positions && player_positions.length >= 2 && kolonoBase && militarBase) {
    playerUnits.push({
      ...kolonoBase,
      type: kolonoBase.id.toLowerCase(),
      movement_points: kolonoBase.movementPoints,
      id: "kolono-start-player",
      position: player_positions[0],
      movement_points_left: kolonoBase.movementPoints,
      owner: "player"
    });
    playerUnits.push({
      ...militarBase,
      type: militarBase.id.toLowerCase(),
      movement_points: militarBase.movementPoints,
      id: "militar-start-player",
      position: player_positions[1],
      movement_points_left: militarBase.movementPoints,
      owner: "player"
    });
  }

  const aiUnits: Unit[] = [];
  if (ai_positions && ai_positions.length >= 2 && kolonoBase && militarBase) {
    aiUnits.push({
      ...kolonoBase,
      type: kolonoBase.id.toLowerCase(),
      movement_points: kolonoBase.movementPoints,
      id: "kolono-start-ai",
      position: ai_positions[0],
      movement_points_left: kolonoBase.movementPoints,
      owner: "ai"
    });
    aiUnits.push({
      ...militarBase,
      type: militarBase.id.toLowerCase(),
      movement_points: militarBase.movementPoints,
      id: "militar-start-ai",
      position: ai_positions[1],
      movement_points_left: militarBase.movementPoints,
      owner: "ai"
    });
  }

  // Inserta las unidades en el game_state antes de guardar, LIMPIANDO los campos extra
  game.game_state.player.units = playerUnits.map(cleanUnit);
  game.game_state.ai.units = aiUnits.map(cleanUnit);

  await saveGame(game.game_id || game._id, game.game_state);

  return game;
};

export const getSavedGames = async () => {
  const token = localStorage.getItem('jwt_token');
  const response = await axios.get(`${API_URL}/api/games`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getGameById = async (gameId: string) => {
  const token = localStorage.getItem('jwt_token');
  const response = await axios.get(`${API_URL}/api/games/${gameId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const saveGame = async (gameId: string, game_state: any) => {
  const token = localStorage.getItem("jwt_token");
  return axios.post(`${API_URL}/api/games/${gameId}/save`, { game_state }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteGame = async (gameId: string) => {
  const token = localStorage.getItem("jwt_token");
  return axios.delete(`${API_URL}/api/games/${gameId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const fetchNextAiAction = async (gameState: any): Promise<{ action: AiAction; reasoning?: string; analysis?: string }> => {
  const token = localStorage.getItem("jwt_token");
  try {
    const response = await axios.post(
      `${API_URL}/api/games/getIAAction`,
      { game_state: gameState },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (err) {
    console.error("Error obteniendo acción de la IA:", err);
    return {
      action: { type: "endTurn", payload: {} },
      reasoning: "No valid response.",
      analysis: "No valid response."
    };
  }
};