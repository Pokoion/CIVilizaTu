import { TILE_TYPES, ACTIONS } from './utils/Constants';

export type TerrainType = keyof typeof TILE_TYPES;

export interface Tile {
  row: number;
  col: number;
  tileType: TerrainType;
  isDiscovered: boolean;
  fogStatus: 'undiscovered' | 'fog' | 'visible';
}

export interface TileProps extends Tile {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

type ActionType = typeof ACTIONS[number];
export type AiAction = ActionType extends { type: infer T; payload: infer P }
  ? { type: T & string; payload: P }
  : never;

export interface Unit {
  id: string;
  type: string;
  position: { x: number; y: number };
  movement_points: number;
  movement_points_left: number;
  health: number;
  strength: number;
  range: number;
  owner: 'player' | 'ai';
  direction?: string;
  hasAttackedCityThisTurn?: boolean;
  hasAttackedThisTurn?: boolean;
}

export interface UnitProps extends Unit {
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export interface Building {
  id: string; // Identificador único del edificio
  type: string; // Tipo de edificio (por ejemplo, 'granary', 'barracks', etc.)
  name: string; // Nombre del edificio
  description: string; // Descripción del edificio
}

export interface TrainingUnit {
  id: string; // id único de la unidad en entrenamiento
  type: string; // tipo de unidad (por ejemplo, 'gudaria', 'archer', etc.)
  turnsLeft: number; // turnos restantes para completar el entrenamiento
}

export interface City {
  id: string;
  name: string;
  position: { x: number; y: number };
  population: number;
  onClick?: () => void;
  onEnter?: () => void;
  owner: 'player' | 'ai';
  buildings: string[]; // Agregar la propiedad buildings
  production: {
    food: number;
    gold: number;
    culture: number;
    science: number;
    natural_resources: number;
  };
  defense: number;
  health: number;
  era: string;
  training: TrainingUnit[];
  allowPopulationGrowth: boolean;
}

export interface CityProps extends City {
  selected?: boolean;
  onClick?: () => void;
}

export interface VisibleObjectProps {
  type: string;
  position: { x: number; y: number };
}

export class VisibleObject implements VisibleObjectProps {
  type: string;
  position: { x: number; y: number };

  constructor(type: string, position: { x: number; y: number }) {
    this.type = type;
    this.position = position;
  }
}

export type MapState = {
  size: { width: number; height: number };
  tiles: TerrainType[][];
  fog_of_war_player: boolean[][];
  fog_of_war_ai: boolean[][];
};

export interface Tech {
  id: string;
  name: string;
  description: string;
  image: string;
  parents: string[];
  era: string;
  cost: { science: number; gold: number };
}

export interface TechNode extends Tech {
  x: number;
  y: number;
}