import { TERRAIN_TYPES } from "../utils/Constants";
type TerrainType = keyof typeof TERRAIN_TYPES;

class TileManager {
  private terrainType: TerrainType;
  private isDiscovered: boolean;

  constructor(terrainType: TerrainType) {
    this.terrainType = terrainType;
    this.isDiscovered = false;
  }

  // Devuelve el tipo de terreno
  public getTerrainType(): TerrainType {
    return this.terrainType;
  }

  // Marca el tile como descubierto
  public discover(): void {
    this.isDiscovered = true;
  }

  // Verifica si el tile está descubierto
  public isTileDiscovered(): boolean {
    return this.isDiscovered;
  }
}

export default TileManager;