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

  // 1. LOG: Parámetros recibidos
  console.log("===> [createGame] Parámetros recibidos:", {
    name, playerCiv, aiCiv, playerName, aiName, map_size, map_type
  });

  const playerInitialResources = CIVILIZATIONS_BY_ID[playerCiv]?.initial_resources || { food: 0, natural_resources: 0, science: 0, gold: 0, culture: 0 };
  const aiInitialResources = CIVILIZATIONS_BY_ID[aiCiv]?.initial_resources || { food: 0, natural_resources: 0, science: 0, gold: 0, culture: 0 };

  // 2. LOG: Recursos iniciales
  console.log("===> [createGame] playerInitialResources:", playerInitialResources);
  console.log("===> [createGame] aiInitialResources:", aiInitialResources);

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

  // 3. LOG: Estado inicial del juego
  console.log("===> [createGame] game_state inicial:", JSON.stringify(game_state, null, 2));

  const body = {
    name,
    scenario_id,
    game_state,
    map_width: map_size.width,
    map_height: map_size.height,
    map_type,
  };

  // 4. LOG: Body enviado al backend
  console.log("===> [createGame] Body enviado al backend:", JSON.stringify(body, null, 2));

  let response;
  try {
    response = await axios.post(`${API_URL}/api/games`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err: any) {
    throw err; // Deja que el frontend gestione el error recibido del backend
  }

  // 5. LOG: Respuesta del backend
  console.log("===> [createGame] Respuesta del backend:", response.data);

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

  // LOG: Mapa ajustado
  console.log("===> [createGame] tiles ajustados a 50x50:", tiles);

  game.game_state.map.tiles = tiles;

  // 6. LOG: Posiciones iniciales recibidas
  console.log("===> [createGame] player_positions:", player_positions);
  console.log("===> [createGame] ai_positions:", ai_positions);

  // Busca los datos base de las unidades
  const kolonoBase = UNITS.find(u => u.id === "kolono");
  const militarBase = UNITS.find(u => u.id === "militar");

  // 7. LOG: Datos base de unidades
  console.log("===> [createGame] kolonoBase:", kolonoBase);
  console.log("===> [createGame] militarBase:", militarBase);

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

  // 8. LOG: Unidades jugador creadas
  console.log("===> [createGame] playerUnits creados:", playerUnits);

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

  // 9. LOG: Unidades IA creadas
  console.log("===> [createGame] aiUnits creados:", aiUnits);

  // Inserta las unidades en el game_state antes de guardar, LIMPIANDO los campos extra
  game.game_state.player.units = playerUnits.map(cleanUnit);
  game.game_state.ai.units = aiUnits.map(cleanUnit);

  // 10. LOG: Unidades finales en game_state
  console.log("===> [createGame] game.game_state.player.units FINAL:", game.game_state.player.units);
  console.log("===> [createGame] game.game_state.ai.units FINAL:", game.game_state.ai.units);

  try {
    await saveGame(game.game_id || game._id, game.game_state);
    console.log("===> [createGame] Partida guardada automáticamente tras crearla.");
  } catch (err) {
    console.error("===> [createGame] Error al guardar la partida automáticamente:", err);
  }

  // 11. LOG: Devuelve el objeto game modificado
  console.log("===> [createGame] Objeto game devuelto:", game);

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