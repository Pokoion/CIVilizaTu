import { AiAction } from '../types';

export function applyAiAction(gameState: any, action: AiAction): any {
  switch (action.type) {
    case "moveUnit": {
      const pos = action.payload.position;
      alert(
        `AI mueve la unidad ${action.payload.unitId} a (${pos?.x ?? "?"}, ${pos?.y ?? "?"})`
      );
      return gameState;
    }
    case "attackUnit": {
      alert(
        `AI ataca con la unidad ${action.payload.attackerId} a la unidad ${action.payload.defenderId}`
      );
      return gameState;
    }
    case "attackCity": {
      alert(
        `AI ataca la ciudad ${action.payload.cityId} con la unidad ${action.payload.attackerId}`
      );
      return gameState;
    }
    case "foundCity": {
      const pos = action.payload.position;
      alert(
        `AI funda la ciudad ${action.payload.name} en (${pos?.x ?? "?"}, ${pos?.y ?? "?"})`
      );
      return gameState;
    }
    case "changeCityPopulationProduction": {
      alert(
        `AI cambia la producción/población de la ciudad ${action.payload.cityId} en ${action.payload.change}`
      );
      return gameState;
    }
    case "collectResource": {
      const pos = action.payload.position;
      alert(
        `AI recolecta recurso con unidad ${action.payload.unitId} en (${pos?.x ?? "?"}, ${pos?.y ?? "?"})`
      );
      return gameState;
    }
    case "buildBuilding": {
      alert(
        `AI construye el edificio ${action.payload.buildingType} en la ciudad ${action.payload.cityId}`
      );
      return gameState;
    }
    case "trainUnit": {
      alert(
        `AI entrena la unidad ${action.payload.unitType} en la ciudad ${action.payload.cityId}`
      );
      return gameState;
    }
    case "deployUnit": {
      const pos = action.payload.position;
      alert(
        `AI despliega la unidad ${action.payload.unitType} de la ciudad ${action.payload.cityId} en (${pos?.x ?? "?"}, ${pos?.y ?? "?"})`
      );
      return gameState;
    }
    case "researchTech": {
      alert(`AI investiga la tecnología ${action.payload.techId}`);
      return gameState;
    }
    case "upgradeCityEra": {
      alert(`AI mejora la era de la ciudad ${action.payload.cityId}`);
      return gameState;
    }
    case "endTurn": {
      alert("AI termina su turno");
      return gameState;
    }
    default:
      alert(`AI realiza acción desconocida: ${action.type}`);
      return gameState;
  }
}