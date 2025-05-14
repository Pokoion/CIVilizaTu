import axios from "axios";
import { AiAction } from '../types';

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
  const game_state = {
    turn: 1,
    current_player: "player",
    cheats_used: [],
    player: {
      civilization: playerCiv,
      era: "Antzinaroa",
      leader_name: playerName,
      resources: { food: 0, natural_resources: 0, science: 0, gold: 0, culture: 0 },
      cities: [],
      units: [],
      technologies: [],
    },
    ai: {
      civilization: aiCiv,
      era: "Antzinaroa",
      leader_name: aiName,
      resources: { food: 0, natural_resources: 0, science: 0, gold: 0, culture: 0 },
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
  return response.data;
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
  { type: "foundCity", payload: { name: "CityEnemy", unitId:"kolono-start-ai" } },
  { type: "trainUnit", payload: { cityId: "CityEnemy", unitType:"militar" } },
  { type: "endTurn", payload: {} }
];

export const fetchNextAiAction = async (gameState: any): Promise<AiAction> => {
  const action = aiActionSequence[aiActionStep] || { type: "endTurn", payload: {} };
  aiActionStep++;
  if (action.type === "endTurn") aiActionStep = 0;
  return new Promise(resolve => setTimeout(() => resolve(action), 2000));
};