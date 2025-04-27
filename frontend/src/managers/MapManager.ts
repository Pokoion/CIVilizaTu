import { TerrainType } from '../utils/Constants';

export interface MapState {
  map: {
    size: { width: number; height: number };
    tiles: TerrainType[][];
    fog_of_war: boolean[][];
  };
}

export interface Unit {
  id: string;
  type: string;
  position: { x: number; y: number };
  visible: boolean;
  movement_points: number;
  movement_points_left: number;
}

class MapManager {
  private map: MapState;
  private units: Unit[] = [];

  constructor(map: MapState) {
    this.map = map;
  }

  // Establece un nuevo mapa
  public setMap(map: MapState): void {
    this.map = map;
  }

  // Devuelve el estado actual del mapa
  public getMap(): MapState {
    return this.map;
  }

  // Establece las unidades en el mapa
  public setUnits(units: Unit[]): void {
    this.units = units;
    this.updateFogOfWar();
  }

  // Devuelve las unidades actuales
  public getUnits(): Unit[] {
    return this.units;
  }

  // Actualiza la niebla de guerra en función de las posiciones de las unidades
  private updateFogOfWar(): void {
    const { width, height } = this.map.map.size;
    this.map.map.fog_of_war = this.generateFogOfWar(width, height);
    this.units.forEach((unit) => {
      const { x, y } = unit.position;
      this.discoverTiles(y, x);
    });
  }

  // Genera la niebla de guerra inicial
  private generateFogOfWar(width: number, height: number): boolean[][] {
    return Array.from({ length: height }, () => Array(width).fill(false));
  }

  // Descubre los tiles alrededor de una posición
  private discoverTiles(row: number, col: number): void {
    const { width, height } = this.map.map.size;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
          this.map.map.fog_of_war[newRow][newCol] = true;
        }
      }
    }
  }

  public moveUnit(unitId: string, newPosition: { x: number; y: number }): boolean {
    const unit = this.units.find(u => u.id === unitId);
    if (!unit) return false;
    unit.position = newPosition;
    this.discoverTiles(newPosition.y, newPosition.x);
    return true;
  }
}

export default MapManager;