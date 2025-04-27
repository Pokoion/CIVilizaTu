export const TILE_SIZE = 140;

export const MAP_DEFAULT_SIZE = 50;

export const TILE_TYPES = {
  water: { color: 'rgb(89, 201, 238)', movementCost: Infinity },
  grass: { color: 'lightgreen', movementCost: 1 },
  mountain: { color: 'gray', movementCost: 3 },
  forest: { color: 'darkgreen', movementCost: 2 },
  desert: { color: 'goldenrod', movementCost: 2 },
};

export type TerrainType = keyof typeof TILE_TYPES;

export const TERRAIN_TYPES: TerrainType[] = Object.keys(TILE_TYPES) as TerrainType[];