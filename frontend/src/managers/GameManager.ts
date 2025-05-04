import MapManager from './MapManager';
import { UnitProps } from '../types';
import { loadMap } from '../services/api';

class GameManager {
  private mapManager: MapManager;

  constructor() {
    // Inicializa con un mapa vacío temporalmente; se sobrescribirá en initializeGame
    this.mapManager = new MapManager({
      size: { width: 0, height: 0 },
      tiles: [],
      fog_of_war: [],
    });
  }

  public async initializeGame(): Promise<void> {
    console.log('Initializing game...');
    try {
      const apiResponse = await loadMap();

      const mapState = {
        size: apiResponse.map.size,
        tiles: apiResponse.map.tiles,
        fog_of_war: apiResponse.map.fog_of_war,
      };

      const units = apiResponse.units.map((unit: any) => ({
        id: unit.id,
        type: unit.type,
        position: unit.position,
        movement_points: unit.movement_points,
        movement_points_left: unit.movement_points_left,
      }));

      const cities = apiResponse.cities.map((city: any) => ({
        id: city.id,
        name: city.name,
        position: city.position,
        population: city.population,
      }));

      this.mapManager.setMap(mapState);
      this.mapManager.setUnits(units);
      this.mapManager.setCities(cities);
      console.log('Game initialized with map from API.');
    } catch (error) {
      console.error('Error loading map from API:', error);
    }
  }

  reloadUnitsMovement(units: UnitProps[]): UnitProps[] {
    return units.map(unit => ({
      ...unit,
      movement_points_left: unit.movement_points,
    }));
  }

  public getMapManager(): MapManager {
    return this.mapManager;
  }
}

export default GameManager;