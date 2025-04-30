import { Unit } from '../types';

class TurnManager {
  private currentPlayer: 'player' | 'ai' = 'player';

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  nextTurn(gameManager: any) {
    // Cambia de jugador (por ahora, simula que la IA ya ha jugado)
    this.currentPlayer = this.currentPlayer === 'player' ? 'ai' : 'player';
  
    // Si es el turno del jugador, recarga los movement_points_left
    if (this.currentPlayer === 'player') {
      const units = gameManager.getMapManager().getUnits();
      units.forEach((unit: Unit) => {
        unit.movement_points_left = unit.movement_points;
      });
      // Si usas estado React, recuerda actualizarlo también
    }
  
    // Si es el turno de la IA, muestra un alert y pasa al siguiente turno (simulación)
    if (this.currentPlayer === 'ai') {
      alert('Turno de la IA (simulado)');
      this.nextTurn(gameManager);
    }
  }
}

export default TurnManager;