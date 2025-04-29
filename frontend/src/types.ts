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
  visible: boolean;
  movement_points: number;
  movement_points_left: number;
}

export interface UnitProps extends Unit {
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