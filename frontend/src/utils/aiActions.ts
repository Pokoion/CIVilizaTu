import { AiAction } from '../types';
import { moveUnitLogic } from './moveUnitLogic';

export function applyAiAction(
    gameState: any,
    action: AiAction,
): any {
    switch (action.type) {
        case "moveUnit": {
            const pos = action.payload.position;
            const unitId = action.payload.unitId;
            if (!unitId) {
                console.error("[AI ACTION] ERROR: unitId indefinido en moveUnit");
                return gameState;
            }
            if (!pos) {
                console.error("[AI ACTION] ERROR: position indefinida en moveUnit");
                return gameState;
            }
            console.log(`[AI ACTION] moveUnit: unitId=${unitId}, destino=(${pos.x},${pos.y})`);
            const unit = gameState.units.find((u: any) => u.id === unitId);
            const { updatedUnits, path, error } = moveUnitLogic({
                units: gameState.units,
                unitId,
                to: pos,
                mapTiles: gameState.mapState?.tiles,
                cities: gameState.cities,
                visibleObjects: gameState.visibleObjects,
                movementPointsLeft: unit?.movement_points_left,
                unitType: unit?.type,
                discoveredTiles: gameState.mapState?.fog_of_war_ai,
            });
            if (error) {
                console.log(`[AI ACTION] ERROR: ${error}`);
                alert(`AI NO puede mover la unidad: ${error}`);
                return gameState;
            }
            console.log("[AI ACTION] Unidades tras moveUnitLogic:", JSON.stringify(updatedUnits.map(u => ({
                id: u.id,
                owner: u.owner,
                pos: u.position
            })), null, 2));
            return {
                ...gameState,
                units: updatedUnits,
                aiMovePath: path,
            };
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