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
  cost: unit.cost,
  image: unit.image
}));

// Buildings (BUILDINGS)
export const BUILDINGS = GameInfo.buildings.map(building => ({
  id: building.id,
  name: building.name,
  bonus: building.bonus,
  requirement: building.requirement,
  cost: building.cost,
}));

// Resources (RESOURCES)
export const RESOURCES = GameInfo.resources.map(resource => ({
  id: resource.id,
  name: resource.name,
  description: resource.description,
  image: `/images/resources/${resource.id}.png` // Ruta predeterminada si no está en GameInfo
}));

export const VISIBLE_OBJECTS = GameInfo.map_elements.map(obj => ({
  id: obj.id,
  name: obj.name,
  bonus: obj.bonus
}));

// Acceso rápido por id:
export const VISIBLE_OBJECTS_BY_ID: Record<string, typeof VISIBLE_OBJECTS[0]> = Object.fromEntries(
  VISIBLE_OBJECTS.map(obj => [obj.id, obj])
);

// Exportar las claves de TILE_TYPES como TerrainType
export const TERRAIN_TYPES = Object.keys(TILE_TYPES) as TerrainType[];

export type CityEra = {
  id: string;
  name: string;
  next_era: string | null;
  upgrade_cost: { gold: number; natural_resources: number };
  base_production: {
    food: number;
    gold: number;
    culture: number;
    science: number;
    natural_resources: number;
  };
  building_limit: number;
};

// Constante para acceder a las eras de ciudad
export const CITY_ERAS: CityEra[] = GameInfo.city_eras;

// Si quieres acceso rápido por id:
export const CITY_ERAS_BY_ID: Record<string, CityEra> = Object.fromEntries(
  CITY_ERAS.map(era => [era.id, era])
);