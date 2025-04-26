import { Unit } from './Unit';
import { Building } from './Building';

export type TerrainType = 'grass' | 'water' | 'mountain';

export interface Cell {
  terrain: TerrainType;
  unit?: Unit; // Unidad presente en la celda (opcional)
  building?: Building; // Edificio presente en la celda (opcional)
}