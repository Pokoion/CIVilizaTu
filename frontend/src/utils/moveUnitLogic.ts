import { Unit } from '../types';
import { TILE_TYPES } from './Constants';

interface MoveUnitOptions {
    units: Unit[];
    unitId: string;
    to: { x: number; y: number };
    mapTiles: string[][];
    cities: { position: { x: number; y: number } }[];
    visibleObjects?: { type: string; position: { x: number; y: number } }[];
    movementPointsLeft?: number;
    unitType?: string;
    discoveredTiles: boolean[][];
}

const getDirection = (from: { x: number, y: number }, to: { x: number, y: number }) => {
    if (to.x > from.x) return 'default';
    if (to.x < from.x) return 'atzera';
    if (to.y > from.y) return 'eskubi';
    if (to.y < from.y) return 'ezkerra';
    return 'default';
};

export function moveUnitLogic({
    units,
    unitId,
    to,
    mapTiles,
    cities,
    visibleObjects = [],
    movementPointsLeft,
    unitType,
    discoveredTiles,
}: MoveUnitOptions): { updatedUnits: Unit[]; path?: { row: number; col: number }[]; error?: string } {
    if (!Array.isArray(mapTiles) || !Array.isArray(mapTiles[0])) {
        return { updatedUnits: units, error: "Mapa de tiles no válido" };
    }
    const unit = units.find(u => u.id === unitId);
    if (!unit) return { updatedUnits: units, error: "Unidad no encontrada" };

    // Solo permite moverse a tiles adyacentes (8 direcciones)
    const dx = Math.abs(unit.position.x - to.x);
    const dy = Math.abs(unit.position.y - to.y);
    if ((dx === 0 && dy === 0) || dx > 1 || dy > 1) {
        return { updatedUnits: units, error: "Solo puedes moverte a un tile adyacente" };
    }

    // Comprueba fog
    if (!discoveredTiles?.[to.y]?.[to.x]) {
        return { updatedUnits: units, error: "Ezin zara lurralde ezkutatura mugitu" };
    }

    // Colisiones
    if (units.some(u => u.position.x === to.x && u.position.y === to.y)) {
        return { updatedUnits: units, error: "Ya hay una unidad en esa casilla" };
    }
    if (cities.some(c => c.position.x === to.x && c.position.y === to.y)) {
        return { updatedUnits: units, error: "Ya hay una ciudad en esa casilla" };
    }
    if (visibleObjects.some(obj => obj.position.x === to.x && obj.position.y === to.y)) {
        return { updatedUnits: units, error: "Ya hay un objeto visible en esa casilla" };
    }

    // Terreno
    const terrainId = mapTiles[to.y]?.[to.x];
    const tile = TILE_TYPES[terrainId];
    if (!tile) {
        return { updatedUnits: units, error: "Terreno no válido" };
    }
    if (tile.requiresBoat && unitType !== 'itsasontzia') {
        return { updatedUnits: units, error: "Ezin zara lurralde honetara mugitu, beharrezkoa da itsasontzi bat" };
    }
    if (unitType === 'itsasontzia' && !tile.requiresBoat) {
        return { updatedUnits: units, error: "Itsasontzia ezin da lurrean mugitu" };
    }

    // Coste de movimiento
    const moveCost = tile.movementCost ?? 1;
    const mpLeft = movementPointsLeft ?? unit.movement_points_left;
    if (moveCost > mpLeft) {
        return { updatedUnits: units, error: "Unitateak ez ditu beharrezko mugimendu puntuak" };
    }

    // Cambia la dirección según el movimiento
    const direction = getDirection(unit.position, to);

    // Actualiza la posición, puntos de movimiento y dirección
    const updatedUnits = units.map(u =>
        u.id === unitId
            ? {
                ...u,
                position: { x: to.x, y: to.y },
                movement_points_left: mpLeft - moveCost,
                direction
            }
            : u
    );

    // Devuelve el path (solo el paso actual)
    return { updatedUnits, path: [{ row: to.y, col: to.x }] };
}