import { TILE_TYPES } from '../utils/Constants';
import { TerrainType, Unit, City, MapState } from '../types';

// Mapa 50x50 con sentido: bordes de agua, interior variado
const size = 50;
const customTiles: TerrainType[][] = Array.from({ length: size }, (_, y) =>
  Array.from({ length: size }, (_, x) => {
    if (x === 0 || y === 0 || x === size - 1 || y === size - 1) return 'water';
    if (x < 5 || y < 5 || x > size - 6 || y > size - 6) return 'grass';
    if ((x + y) % 13 === 0) return 'mountain';
    if ((x * y) % 17 === 0) return 'forest';
    if ((x + y) % 19 === 0) return 'desert';
    return 'grass';
  })
);

export const fetchCivilizations = async (): Promise<{ name: string; attack: number; defense: number }[]> => {
  return new Promise((resolve) => {
      resolve([
        { name: 'rome', attack: 1, defense: 2 },
        { name: 'greece', attack: 2, defense: 3 },
        { name: 'egypt', attack: 3, defense: 1 }
      ]);
  });
};

export const fetchUnits = async (): Promise<{ name: string; attack: number; defense: number }[]> => {
  return new Promise((resolve) => {
      resolve([
        { name: 'swordsman', attack: 5, defense: 3 },
        { name: 'archer', attack: 3, defense: 2 },
        { name: 'cavalry', attack: 4, defense: 4 }
      ]);
  });
};

export const loadMap = async (): Promise<{
  map: MapState['map'];
  units: Unit[];
  cities: City[];
  unlockedTechs: string[];
  turn: number;
  currentPlayer: string;
}> => {
  // Simula que recibes este JSON del backend:
  const fakeGameState = {
    user_id: "665f1a2b3c4d5e6f7a8b9c0d",
    name: "Nire partida IA-ren aurka",
    scenario_id: "665f1a2b3c4d5e6f7a8b9c0e",
    created_at: "2025-04-01T18:30:22.123Z",
    last_saved: "2025-04-01T19:45:33.456Z",
    is_autosave: false,
    cheats_used: ["mapa_agertu", "maila_igo"],
    game_state: {
      turn: 12,
      current_player: "player",
      cheats_used: ["mapa_agertu", "maila_igo"],
      player: {
        resources: {
          food: 35,
          production: 28,
          science: 15,
          gold: 420
        },
        cities: [
          {
            id: "city1",
            name: "Bilbo",
            position: { x: 25, y: 25 },
            population: 5,
            buildings: [
              { id: "granary", type: "food_building" },
              { id: "library", type: "science_building" },
              { id: "barracks", type: "military_building" }
            ],
            production: {
              current_item: "warrior",
              turns_remaining: 3
            }
          }
        ],
        units: [
          {
            id: "unit1",
            type: "settler",
            position: { x: 26, y: 25 },
            movement_points: 1000,
            movement_points_left: 1000
          },
          {
            id: "unit2",
            type: "warrior",
            position: { x: 24, y: 25 },
            movement_points: 1000,
            movement_points_left: 1000,
            strength: 5,
            health: 100
          }
        ],
        technologies: [
          { id: "agriculture", completed: true },
          { id: "pottery", completed: true },
          { id: "animal_husbandry", in_progress: true, turns_remaining: 4 }
        ]
      },
      ai: {
        resources: {
          food: 40,
          production: 22,
          science: 10,
          gold: 380
        },
        cities: [
          {
            id: "ai_city1",
            name: "Erroma",
            position: { x: 40, y: 40 },
            visible: false
          }
        ],
        units: [
          {
            id: "ai_unit1",
            type: "unknown",
            position: { x: 41, y: 41 },
            visible: false
          }
        ],
        technologies: []
      },
      map: {
        size: { width: size, height: size },
        tiles: customTiles,
        fog_of_war: Array.from({ length: size }, () =>
          Array.from({ length: size }, () => false)
        ),
      }
    }
  };

  // Extrae los datos para el estado del juego
  const map = {
    size: fakeGameState.game_state.map.size,
    tiles: fakeGameState.game_state.map.tiles,
    fog_of_war: fakeGameState.game_state.map.fog_of_war,
  };

  const units = fakeGameState.game_state.player.units.map((u: any) => ({
    id: u.id,
    type: u.type,
    position: u.position,
    movement_points: u.movement_points,
    movement_points_left: u.movement_points_left,
    strength: u.strength,
    health: u.health,
  }));

  const cities = fakeGameState.game_state.player.cities.map((c: any) => ({
    id: c.id,
    name: c.name,
    position: c.position,
    population: c.population,
  }));

  const unlockedTechs = fakeGameState.game_state.player.technologies
    .filter((t: any) => t.completed)
    .map((t: any) => t.id);

  const turn = fakeGameState.game_state.turn;
  const currentPlayer = fakeGameState.game_state.current_player;

  return {
    map,
    units,
    cities,
    unlockedTechs,
    turn,
    currentPlayer,
  };
};

export const saveGame = async (gameState: any): Promise<void> => {
  return new Promise((resolve) => {
      resolve();
  });
};

export default {};