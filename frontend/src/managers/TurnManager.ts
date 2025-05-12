import { Unit } from '../types';

class TurnManager {
  private currentSide: 'player' | 'ai' = 'player';

  getCurrentSide() {
    return this.currentSide;
  }

  nextTurn(gameManager: any) {
    // Cambia de bando
    this.currentSide = this.currentSide === 'player' ? 'ai' : 'player';

    // Si es el turno del jugador, recarga los movement_points_left
    if (this.currentSide === 'player') {
      const units = gameManager.getMapManager().getUnits();
      units.forEach((unit: Unit) => {
        unit.movement_points_left = unit.movement_points;
      });
    }

  }
}

export default TurnManager;