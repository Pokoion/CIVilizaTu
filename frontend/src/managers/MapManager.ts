import { City, MapState, Unit } from '../types';

class MapManager {
  private map: MapState;
  private units: Unit[] = [];
  private cities: City[] = [];

  constructor(map: MapState) {
    this.map = map;
  }

  public setMap(map: MapState): void {
    this.map = map;
  }

  public getMap(): MapState {
    return {
      ...this.map,
      fog_of_war: this.map.fog_of_war.map(row => [...row]),
    };
  }

  public setUnits(units: Unit[]): void {
    this.units = units;
  }

  public getUnits(): Unit[] {
    return this.units;
  }

  public setCities(cities: City[]): void {
    this.cities = cities;
  }

  public getCities(): City[] {
    return this.cities;
  }

  // Descubre los tiles alrededor de una posición
  public discoverTiles(row: number, col: number): void {
    const { width, height } = this.map.size;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
          this.map.fog_of_war[newRow][newCol] = true;
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