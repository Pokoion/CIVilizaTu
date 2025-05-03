import { TILE_TYPES } from './utils/Constants';

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
}

export interface Unit {
  id: string;
  type: string;
  position: { x: number; y: number };
  movement_points: number;
  movement_points_left: number;
}

export interface UnitProps extends Unit {
  selected?: boolean;
  onClick?: () => void;
}

export interface City {
  id: string;
  name: string;
  position: { x: number; y: number };
  population: number;
  onClick?: () => void;
  onEnter?: () => void;
}

export interface CityProps extends City {
  selected?: boolean;
  onClick?: () => void;
}

export interface MapState {
  map: {
    size: { width: number; height: number };
    tiles: TerrainType[][];
    fog_of_war: boolean[][];
  };
}

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