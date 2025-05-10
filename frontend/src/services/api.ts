import { TILE_TYPES } from '../utils/Constants';
import { TerrainType, Unit, City, MapState } from '../types';

// Mapa 50x50 con sentido: bordes de agua, interior variado
const size = 50;
const customTiles: TerrainType[][] = Array.from({ length: size }, (_, y) =>
  Array.from({ length: size }, (_, x) => {
    if (x === 0 || y === 0 || x === size - 1 || y === size - 1) return 'itsasoa'; // Bordes de agua (mar)
    if ((x + y) % 15 === 0) return 'pantano'; // Pantanos
    if ((x + y) % 13 === 0) return 'mendia'; // Montañas
    if ((x * y) % 17 === 0) return 'basoa'; // Bosques
    if ((x + y) % 19 === 0) return 'desertua'; // Desiertos
    if ((x + y) % 23 === 0) return 'ura'; // Agua
    return 'lautada'; // Terreno predeterminado (llanura)
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
  map: MapState;
  units: Unit[];
  cities: City[];
  unlockedTechs: string[];
  turn: number;
  currentPlayer: string;
  playerEra: string;
  civilization: string;
  resources: {
    food: number;
    gold: number;
    culture: number;
    science: number;
    natural_resources: number;
  };
  visibleObjects: {
    type: string;
    position: { x: number; y: number };
  }[];
}> => {
  const fakeGameState = {
    user_id: "665f1a2b3c4d5e6f7a8b9c0d",
    name: "Nire partida IA-ren aurka",
    scenario_id: "665f1a2b3c4d5e6f7a8b9c0e",
    created_at: "2025-04-01T18:30:22.123Z",
    last_saved: "2025-04-01T19:45:33.456Z",
    cheats_used: ["mapa_agertu", "maila_igo"],
    game_state: {
      turn: 12,
      current_player: "player",
      cheats_used: ["mapa_agertu", "maila_igo"],
      player: {
        civilization: "euskaldunak",
        era: "Erdi Aroa",
        leader_name: "Iker",
        resources: {
          food: 35,
          culture: 28,
          science: 15,
          gold: 420,
          natural_resources: 200
        },
        cities: [
          {
            id: "city1",
            name: "Bilbo",
            position: { x: 13, y: 18 },
            population: 5,
            buildings: ["aletegia", "unibertsitatea", "kuartela"],
            production: {
              food: 10,
              gold: 5,
              culture: 2,
              science: 3,
              natural_resources: 1
            },
            owner: "player",
            defense: 100,
            health: 100,
            era: "Antzinaroa",
            training: [
              {
                id: "city1-training",
                type: "kolono",
                turnsLeft: 3
              },
              {
                id: "city1-training2",
                type: "militar",
                turnsLeft: 5
              }
            ]
          }
        ],
        units: [
          {
            id: "langile1",
            type: "langile",
            position: { x: 12, y: 18 },
            movement_points: 2,
            movement_points_left: 1,
            strength: 30,
            health: 100,
            visible: true
          },
          {
            id: "militar2",
            type: "militar",
            position: { x: 14, y: 18 },
            movement_points: 1000,
            movement_points_left: 1000,
            strength: 30,
            health: 100,
            visible: true
          },
          {
            id: "kolono1",
            type: "kolono",
            position: { x: 11, y: 18 },
            movement_points: 1000,
            movement_points_left: 1000,
            strength: 30,
            health: 100,
            visible: true
          },
          {
            id: "gudaria1",
            type: "gudaria",
            position: { x: 15, y: 19 },
            movement_points: 1000,
            movement_points_left: 1000,
            strength: 30,
            health: 100,
            visible: true
          }
        ],
        technologies: ["nekazaritza", "idazketa", "burdina"]
      },
      ai: {
        civilization: "Romans",
        era: "Ancient",
        leader_name: "Caesar",
        resources: {
          food: 35,
          culture: 28,
          science: 15,
          gold: 420,
          natural_resources: 30
        },
        cities: [
          {
            id: "city2",
            name: "EnemyCity",
            position: { x: 13, y: 17 },
            population: 5,
            buildings: ["aletegia", "unibertsitatea", "kuartela"],
            production: {
              food: 10,
              gold: 5,
              culture: 2,
              science: 3,
              natural_resources: 1
            },
            owner: "ai",
            defense: 0,
            health: 50,
            era: "Antzinaroa",
            training: [
              {
                id: "city1-training",
                type: "kolono",
                turnsLeft: 3
              },
              {
                id: "city1-training2",
                type: "militar",
                turnsLeft: 5
              }
            ]
          }
        ],
        units: [
          {
            id: "militar3",
            type: "militar",
            position: { x: 15, y: 18 },
            movement_points: 2,
            movement_points_left: 2,
            strength: 5,
            health: 100,
            visible: false
          }
        ],
        technologies: []
      },
      map: {
        size: { width: size, height: size },
        tiles: customTiles,
        visible_objects: [
          {
            type: "arbola",
            position: { x: 14, y: 25 },
          },
          {
            type: "urrea",
            position: { x: 18, y: 22 },
          },
          {
            type: "ganadua",
            position: { x: 10, y: 18 },
          },
          {
            type: "harria",
            position: { x: 20, y: 15 },
          }
        ],
        fog_of_war_player: [] as boolean[][],
        fog_of_war_ai: [] as boolean[][]
      }
    }
  };

  // --- Generar fog_of_war_player dinámicamente según las unidades del jugador ---
  const fog_of_war_player: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  const playerUnits = fakeGameState.game_state.player.units;
  playerUnits.forEach(unit => {
    const { x, y } = unit.position;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          fog_of_war_player[ny][nx] = true;
        }
      }
    }
  });

  // Asigna el fog generado al fakeGameState
  fakeGameState.game_state.map.fog_of_war_player = fog_of_war_player;

  // Extrae los datos para el estado del juego
  const map = {
    size: fakeGameState.game_state.map.size,
    tiles: fakeGameState.game_state.map.tiles,
    fog_of_war: fakeGameState.game_state.map.fog_of_war_player,
  };

  const units = [
    ...fakeGameState.game_state.player.units.map((u: any) => ({
      id: u.id,
      type: u.type,
      position: u.position,
      movement_points: u.movement_points,
      movement_points_left: u.movement_points_left,
      strength: u.strength,
      health: u.health,
      visible: u.visible,
      owner: 'player' as 'player', // <-- type assertion
    })),
    ...fakeGameState.game_state.ai.units.map((u: any) => ({
      id: u.id,
      type: u.type,
      position: u.position,
      movement_points: u.movement_points,
      movement_points_left: u.movement_points_left,
      strength: u.strength,
      health: u.health,
      visible: u.visible,
      owner: 'ai' as 'ai', // <-- type assertion
    })),
  ];

  const cities = [
    ...fakeGameState.game_state.player.cities.map((c: any) => ({
      id: c.id,
      name: c.name,
      position: c.position,
      population: c.population,
      buildings: c.buildings,
      production: c.production,
      owner: 'player' as 'player',
      defense: c.defense,
      health: c.health,
      era: c.era ?? fakeGameState.game_state.player.era, // Usa la era de la ciudad o la del jugador
      training: Array.isArray(c.training)
        ? c.training
        : c.training
          ? [c.training]
          : (
            c.production?.current_item
              ? [{
                id: `${c.id}-training`,
                type: c.production.current_item,
                name: c.production.current_item,
                turnsLeft: c.production.turns_remaining,
              }]
              : []
          ),
    })),
    ...fakeGameState.game_state.ai.cities.map((c: any) => ({
      id: c.id,
      name: c.name,
      position: c.position,
      population: c.population,
      buildings: c.buildings,
      production: c.production,
      owner: 'ai' as 'ai',
      defense: c.defense,
      health: c.health,
      era: c.era ?? fakeGameState.game_state.ai.era,
      training: c.training ?? (
        c.production?.current_item
          ? {
            id: `${c.id}-training`,
            type: c.production.current_item,
            name: c.production.current_item,
            turnsLeft: c.production.turns_remaining,
          }
          : null
      ),
    })),
  ];

  const visibleObjects = fakeGameState.game_state.map.visible_objects.map((obj: any) => ({
    type: obj.type,
    position: obj.position
  }));

  const resources = fakeGameState.game_state.player.resources;
  const unlockedTechs = fakeGameState.game_state.player.technologies;
  const playerEra = fakeGameState.game_state.player.era;
  const turn = fakeGameState.game_state.turn;
  const currentPlayer = fakeGameState.game_state.current_player;
  const civilization = fakeGameState.game_state.player.civilization;

  return {
    map,
    units,
    cities,
    unlockedTechs,
    turn,
    currentPlayer,
    playerEra,
    civilization,
    resources,
    visibleObjects
  };
};

export const saveGame = async (gameState: any): Promise<void> => {
  return new Promise((resolve) => {
    resolve();
  });
};

export default {};