import { TerrainType, Unit, City, MapState, AiAction } from '../types';
import fakeGameState from '../utils/fakeGameState.json';

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

let aiActionStep = 0;
const aiActionSequence: AiAction[] = [
  { type: "moveUnit", payload: { unitId: "militar3", position: { x: 15, y: 19 } } },
  { type: "attackUnit", payload: { attackerId: "militar3", defenderId: "langile1" } },
  { type: "attackCity", payload: { attackerId: "militar3", cityId: "city1" } },
  { type: "endTurn", payload: {} }
];

export const fetchNextAiAction = async (gameState: any): Promise<AiAction> => {
  const action = aiActionSequence[aiActionStep] || { type: "endTurn", payload: {} };
  aiActionStep++;
  if (action.type === "endTurn") aiActionStep = 0;
  return new Promise(resolve => setTimeout(() => resolve(action), 2000));
};

export const loadMap = async (): Promise<{
  map: MapState;
  units: Unit[];
  cities: City[];
  unlockedTechs: string[];
  aiUnlockedTechs: string[];
  turn: number;
  currentSide: 'player' | 'ai';
  playerEra: string;
  aiEra: string;
  civilization: string;
  aiCivilization: string;
  resources: {
    food: number;
    gold: number;
    culture: number;
    science: number;
    natural_resources: number;
  };
  aiResources: {
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

  // --- Generar fog_of_war_player dinámicamente según las unidades del jugador ---
  const fog_of_war_player: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  const fog_of_war_ai: boolean[][] = Array.from({ length: size }, () =>
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

  const aiUnits = fakeGameState.game_state.ai.units;
  aiUnits.forEach(unit => {
    const { x, y } = unit.position;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
          fog_of_war_ai[ny][nx] = true;
        }
      }
    }
  });

  // Asigna el fog generado al fakeGameState
  fakeGameState.game_state.map.fog_of_war_player = fog_of_war_player;
  fakeGameState.game_state.map.fog_of_war_ai = fog_of_war_ai;

  // ...dentro de loadMap, antes de usar fakeGameState.game_state.map.tiles...
  if (
    !fakeGameState.game_state.map.tiles ||
    !Array.isArray(fakeGameState.game_state.map.tiles) ||
    fakeGameState.game_state.map.tiles.length < size
  ) {
    fakeGameState.game_state.map.tiles = customTiles;
  }

  // Extrae los datos para el estado del juego
  const map = {
    size: fakeGameState.game_state.map.size,
    tiles: fakeGameState.game_state.map.tiles,
    fog_of_war_player: fakeGameState.game_state.map.fog_of_war_player,
    fog_of_war_ai: fakeGameState.game_state.map.fog_of_war_ai,
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
      range: u.range,
      visible: u.visible,
      owner: 'player' as 'player',
    })),
    ...fakeGameState.game_state.ai.units.map((u: any) => ({
      id: u.id,
      type: u.type,
      position: u.position,
      movement_points: u.movement_points,
      movement_points_left: u.movement_points_left,
      strength: u.strength,
      health: u.health,
      range: u.range,
      visible: u.visible,
      owner: 'ai' as 'ai',
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
      era: c.era ?? fakeGameState.game_state.player.era,
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
  ];

  const visibleObjects = fakeGameState.game_state.map.visible_objects.map((obj: any) => ({
    type: obj.type,
    position: obj.position
  }));

  const resources = fakeGameState.game_state.player.resources;
  const aiResources = fakeGameState.game_state.ai.resources;
  const unlockedTechs = fakeGameState.game_state.player.technologies;
  const aiUnlockedTechs = fakeGameState.game_state.ai.technologies;
  const playerEra = fakeGameState.game_state.player.era;
  const aiEra = fakeGameState.game_state.ai.era;
  const turn = fakeGameState.game_state.turn;
  const currentSide = fakeGameState.game_state.current_player as 'player' | 'ai';
  const civilization = fakeGameState.game_state.player.civilization;
  const aiCivilization = fakeGameState.game_state.ai.civilization;

  return {
    map,
    units,
    cities,
    unlockedTechs,
    aiUnlockedTechs,
    turn,
    currentSide,
    playerEra,
    aiEra,
    civilization,
    aiCivilization,
    resources,
    aiResources,
    visibleObjects
  };
};

export const saveGame = async (gameState: any): Promise<void> => {
  return new Promise((resolve) => {
    resolve();
  });
};

export default {};