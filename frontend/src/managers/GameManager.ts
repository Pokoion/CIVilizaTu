import MapManager from './MapManager';
import { loadMap } from '../services/api';

class GameManager {
  private mapManager: MapManager;

  constructor() {
    // Inicializa con un mapa vacío temporalmente; se sobrescribirá en initializeGame
    this.mapManager = new MapManager({
      map: {
        size: { width: 0, height: 0 },
        tiles: [],
        fog_of_war: [],
      },
    });
  }

  public async initializeGame(): Promise<void> {
    console.log('Initializing game...');
    try {
      // Cargar el mapa desde la API
      const apiResponse = await loadMap();

      const mapState = {
        map: {
          size: apiResponse.map.size,
          tiles: apiResponse.map.tiles,
          fog_of_war: apiResponse.map.fog_of_war,
        },
      };

      const units = apiResponse.units.map((unit: any) => ({
        id: unit.id,
        type: unit.type,
        position: unit.position,
        visible: true, // Inicialmente todas las unidades son visibles
        movement_points: unit.movement_points,
        movement_points_left: unit.movement_points_left,
      }));

      this.mapManager.setMap(mapState); // Pasar el objeto MapState al MapManager
      this.mapManager.setUnits(units); // Establecer las unidades
      console.log('Game initialized with map from API.');
    } catch (error) {
      console.error('Error loading map from API:', error);
    }
  }

  public getMapManager(): MapManager {
    return this.mapManager;
  }
}

export default GameManager;