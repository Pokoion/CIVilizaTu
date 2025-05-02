import { TerrainType } from '../types';

export const TILE_SIZE = 140;

export const MAP_DEFAULT_SIZE = 50;

export const TILE_TYPES = {
  water: { color: 'rgb(89, 201, 238)', movementCost: Infinity, image: '/images/water.png' },
  grass: { color: 'lightgreen', movementCost: 1, image: '/images/grass.jpg' },
  mountain: { color: 'gray', movementCost: 3, image: '/images/rock.png' },
  forest: { color: 'darkgreen', movementCost: 2, image: '/images/grass.jpg' },
  desert: { color: 'goldenrod', movementCost: 2, image: '/images/ground.jpg' },
};

export const TERRAIN_TYPES: TerrainType[] = Object.keys(TILE_TYPES) as TerrainType[];