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
  difficulty,
  map_size,
}: {
  name: string;
  scenario_id: string;
  playerCiv: string;
  aiCiv: string;
  playerName: string;
  aiName: string;
  difficulty: string;
  map_size: { width: number; height: number };
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
  };

  const response = await axios.post(`${API_URL}/api/games`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Extrae posiciones del backend
  const { game, player_positions, ai_positions } = response.data;

  console.log("Respuesta del backend:", response.data);

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

  console.log("playerUnits creados:", playerUnits);

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

  console.log("aiUnits creados:", aiUnits);

  // Inserta las unidades en el game_state antes de guardar, LIMPIANDO los campos extra
  game.game_state.player.units = playerUnits.map(cleanUnit);
  game.game_state.ai.units = aiUnits.map(cleanUnit);

  console.log("game.game_state.player.units FINAL:", game.game_state.player.units);
  console.log("game.game_state.ai.units FINAL:", game.game_state.ai.units);

  try {
    await saveGame(game.game_id || game._id, game.game_state);
    console.log("Partida guardada automáticamente tras crearla.");
  } catch (err) {
    console.error("Error al guardar la partida automáticamente:", err);
  }

  // Devuelve el objeto game modificado
  return game;
};

export const getSavedGames = async () => {
  const token = localStorage.getItem('jwt_token');
  const response = await axios.get(`${API_URL}/api/games`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Saved games response:", response.data);
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

let aiActionStep = 0;
const aiActionSequence: AiAction[] = [
  //{ type: "foundCity", payload: { name: "CityEnemy", unitId: "kolono-start-ai" } },
  //{ type: "trainUnit", payload: { cityId: "city-1747307085315", unitType: "militar" } },
  { type: "endTurn", payload: {} }
];

export const fetchNextAiAction = async (gameState: any): Promise<AiAction> => {

  const token = localStorage.getItem("jwt_token");
  console.log("Estado del juego enviado a la IA:", gameState);
  const response = await axios.post(
    `${API_URL}/api/games/getIAAction`,
    { game_state: gameState },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log("Respuesta del backend para IA:", response.data);
  
  const action = aiActionSequence[aiActionStep] || { type: "endTurn", payload: {} };
  aiActionStep++;
  if (action.type === "endTurn") aiActionStep = 0;
  return new Promise(resolve => setTimeout(() => resolve(action), 2000));
};