import MapManager from './MapManager';
import { Unit, City, MapState } from '../types';

class GameManager {
  private mapManager: MapManager;

  constructor(initialState?: { map: MapState; units: Unit[]; cities: City[] }) {
    if (initialState) {
      this.mapManager = new MapManager(initialState.map);
      this.mapManager.setUnits(initialState.units);
      this.mapManager.setCities(initialState.cities);
    } else {
      this.mapManager = new MapManager({
        size: { width: 0, height: 0 },
        tiles: [],
        fog_of_war_player: [],
        fog_of_war_ai: [],
      });
    }
  }

  public buildGameState(params: {
    turn: number;
    currentSide: 'player' | 'ai';
    unlockedTechs: string[];
    aiUnlockedTechs: string[];
    civilization: string;
    aiCivilization: string;
    playerEra: string;
    aiEra: string;
    resources: any;
    aiResources: any;
    cities: City[];
    units: Unit[];
    mapState: MapState;
    visibleObjects: { type: string; position: { x: number; y: number } }[];
    cheatsUsed: string[];
    playerLeaderName: string;
    aiLeaderName: string;
  }) {
    function cleanUnit(u: Unit) {
      return {
        id: u.id,
        type: u.type,
        position: u.position,
        movement_points: u.movement_points,
        movement_points_left: u.movement_points_left,
        strength: u.strength,
        health: u.health,
        range: u.range
      };
    }
    function cleanCity(c: City) {
      return {
        id: c.id,
        name: c.name,
        position: c.position,
        population: c.population,
        buildings: c.buildings,
        production: c.production,
        defense: c.defense,
        health: c.health,
        era: c.era,
        training: c.training,
        allowPopulationGrowth: c.allowPopulationGrowth,
        owner: c.owner,
      };
    }
    function cleanVisibleObject(obj: { type: string; position: { x: number; y: number } }) {
      return {
        type: obj.type,
        position: obj.position,
      };
    }
    const {
      turn,
      currentSide,
      unlockedTechs,
      aiUnlockedTechs,
      civilization,
      aiCivilization,
      playerEra,
      aiEra,
      resources,
      aiResources,
      cities,
      units,
      mapState,
      visibleObjects,
    } = params;
    return {
      turn,
      current_player: currentSide,
      cheats_used: params.cheatsUsed,
      player: {
        civilization,
        era: playerEra,
        leader_name: params.playerLeaderName,
        resources,
        cities: cities.filter(c => c.owner === "player").map(cleanCity),
        units: units.filter(u => u.owner === "player").map(cleanUnit),
        technologies: unlockedTechs,
      },
      ai: {
        civilization: aiCivilization,
        era: aiEra,
        leader_name: params.aiLeaderName,
        resources: aiResources,
        cities: cities.filter(c => c.owner === "ai").map(cleanCity),
        units: units.filter(u => u.owner === "ai").map(cleanUnit),
        technologies: aiUnlockedTechs,
      },
      map: {
        size: mapState.size,
        tiles: mapState.tiles,
        visible_objects: (visibleObjects || []).map(cleanVisibleObject),
        fog_of_war_player: mapState.fog_of_war_player,
        fog_of_war_ai: mapState.fog_of_war_ai,
      }
    };
  }

  public async initializeGame(initialState?: { map: MapState; units: Unit[]; cities: City[] }): Promise<void> {
    if (initialState) {
      this.mapManager.setMap(initialState.map);
      this.mapManager.setUnits(initialState.units);
      this.mapManager.setCities(initialState.cities);
      console.log('Game initialized with provided state.');
      return;
    }
    // Solo para debug/sandbox:
    console.log('Initializing game...');
    try {
      console.log('Loading map from MOCK...');
    } catch (error) {
      console.error('Error loading map from MOCK:', error);
    }
  }

  reloadUnitsMovement(units: Unit[]): Unit[] {
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