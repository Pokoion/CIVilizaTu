import axios from "axios";

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
  // Estructura GameState compatible con tu schema y fakeGameState
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