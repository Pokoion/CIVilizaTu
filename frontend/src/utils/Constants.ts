import GameInfo from './GameInfo.json';
import { TerrainType } from '../types';

export const TILE_SIZE = 140;

export const MAP_DEFAULT_SIZE = 50;

// Terrains (TILE_TYPES)
export const TILE_TYPES: Record<string, { movementCost: number; requiresBoat: boolean; image: string; color: string; boat: boolean }> = GameInfo.terrains.reduce(
  (acc, terrain) => {
    acc[terrain.id] = {
      movementCost: terrain.movement_cost,
      requiresBoat: terrain.requires_boat,
      image: `/images/tiles/${terrain.id}.png`, // Ruta predeterminada si no está en GameInfo
      color: terrain.color, // Usar el color directamente desde GameInfo
      boat: terrain.requires_boat // Añadido para indicar si requiere barco
    };
    return acc;
  },
  {} as Record<string, { movementCost: number; requiresBoat: boolean; image: string; color: string; boat: boolean }>
);

// Technologies (TECHS)
export const TECHS = GameInfo.technologies.map(tech => ({
  id: tech.id,
  name: tech.name,
  description: tech.bonus,
  parents: tech.dependencies,
  x: tech.x,
  y: tech.y,
  era: tech.era,
  cost: { science: tech.cost }
}));

// Units (UNITS)
export const UNITS = GameInfo.units.map(unit => ({
  id: unit.id,
  type: unit.type,
  health: unit.health,
  strength: unit.strength,
  movementPoints: unit.movement_points,
  range: unit.range,
  civilization: unit.civilization,
  image: unit.image
}));

// Buildings (BUILDINGS)
export const BUILDINGS = GameInfo.buildings.map(building => ({
  id: building.id,
  name: building.name,
  bonus: building.bonus,
  requirement: building.requirement,
  image: `/images/buildings/${building.id}.png` // Ruta predeterminada si no está en GameInfo
}));

// Resources (RESOURCES)
export const RESOURCES = GameInfo.resources.map(resource => ({
  id: resource.id,
  name: resource.name,
  description: resource.description,
  image: `/images/resources/${resource.id}.png` // Ruta predeterminada si no está en GameInfo
}));

// Exportar las claves de TILE_TYPES como TerrainType
export const TERRAIN_TYPES = Object.keys(TILE_TYPES) as TerrainType[];