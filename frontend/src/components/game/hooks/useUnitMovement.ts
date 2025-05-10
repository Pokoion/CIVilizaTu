import { useCallback } from 'react';
import { TILE_TYPES } from '../../../utils/Constants';
import Pathfinding2 from '../../../utils/Pathfinding2';
import GameManager from '../../../managers/GameManager';
import { MapState, Unit, City } from '../../../types';

export function getVisibleTiles(units: Unit[], mapRows: number, mapCols: number, visionRange = 1) {
  const visible: boolean[][] = Array.from({ length: mapRows }, () => Array(mapCols).fill(false));
  units.forEach(unit => {
    for (let dr = -visionRange; dr <= visionRange; dr++) {
      for (let dc = -visionRange; dc <= visionRange; dc++) {
        const nr = unit.position.y + dr;
        const nc = unit.position.x + dc;
        if (
          nr >= 0 && nr < mapRows &&
          nc >= 0 && nc < mapCols
        ) {
          visible[nr][nc] = true;
        }
      }
    }
  });
  return visible;
}

// --- NUEVO: función para calcular la dirección ---
const getDirection = (from: { x: number, y: number }, to: { x: number, y: number }) => {
  if (to.x > from.x) return 'default';
  if (to.x < from.x) return 'atzera';
  if (to.y > from.y) return 'eskubi';
  if (to.y < from.y) return 'ezkerra';
  return 'default';
};

export function useUnitMovement(
  gameManager: GameManager,
  mapState: MapState,
  units: Unit[],
  cities: City[],
  visibleObjects: { type: string; position: { x: number; y: number } }[], // <-- añade esto
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>,
  setMapState: (map: MapState) => void,
  setSelectedUnitId: (id: string | null) => void,
  setVisibleTiles?: (tiles: boolean[][]) => void
) {
  return useCallback(
    async (row: number, col: number, selectedUnitId: string | null) => {
      // Comprobar si el tile está descubierto
      if (!mapState.fog_of_war[row]?.[col]) {
        return "Ezin zara lurralde ezkutatura mugitu";
      }

      // Comprobar si hay unidad, ciudad o visibleObject en el destino
      const unitOnTile = units.some(u => u.position.x === col && u.position.y === row);
      const cityOnTile = cities.some(c => c.position.x === col && c.position.y === row);
      const visibleObjectOnTile = visibleObjects?.some(obj => obj.position.x === col && obj.position.y === row);
      if (unitOnTile || cityOnTile || visibleObjectOnTile) {
        return "Ezin zara beste unitate, hiri edo baliabide batera mugitu";
      }

      if (selectedUnitId) {
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit) return "Unitatea ez da aurkitu";

        if (unit.position.x === col && unit.position.y === row) {
          return "Unitatea dagoen tilean zaude jada";
        }

        const destTerrain = mapState.tiles[row][col];
        const destTile = TILE_TYPES[destTerrain];

        if (destTile.requiresBoat && unit.type !== 'boat') {
          return "Ezin zara lurralde honetara mugitu, beharrezkoa da itsasontzi bat";
        }

        const path = Pathfinding2.findPath(
          mapState.tiles,
          { row: unit.position.y, col: unit.position.x },
          { row, col },
          unit.movement_points_left,
          mapState.fog_of_war
        );

        if (path) {
          for (let i = 1; i < path.length; i++) {
            const step = path[i];
            // ¿Hay unidad en este paso?
            if (units.some(u => u.position.x === step.col && u.position.y === step.row)) {
              return "Ezin zara beste unitate baten gainetik pasa";
            }
            // ¿Hay ciudad en este paso?
            if (cities.some(c => c.position.x === step.col && c.position.y === step.row)) {
              return "Ezin zara hiri baten gainetik pasa";
            }
            // ¿Hay visibleObject en este paso?
            if (visibleObjects?.some(obj => obj.position.x === step.col && obj.position.y === step.row)) {
              return "Ezin zara baliabide baten gainetik pasa";
            }
          }
        }

        // Si el path no llega al destino, probablemente es por falta de puntos
        if (
          !path ||
          path.length <= 1 ||
          path[path.length - 1].row !== row ||
          path[path.length - 1].col !== col
        ) {
          return "Unitateak ez ditu beharrezko mugimendu puntuak";
        } else {
          let currentUnit = { ...unit };
          let movementLeft = currentUnit.movement_points_left;

          for (let i = 1; i < path.length; i++) {
            const step = path[i];
            const terrain = mapState.tiles[step.row][step.col];
            const tile = TILE_TYPES[terrain];

            // Comprobar si el tile requiere barco
            if (tile.requiresBoat && unit.type !== 'boat') {
              return "Ezin zara lurralde honetara mugitu, beharrezkoa da itsasontzi bat";
            }

            const moveCost = tile.movementCost;
            if (moveCost === Infinity) {
              return "Ezin zara lurralde iritsezin batera mugitu";
            }

            if (movementLeft < moveCost) {
              return "Unitateak ez ditu beharrezko mugimendu puntuak";
            }

            // --- NUEVO: calcula dirección respecto al paso anterior ---
            const prevStep = path[i - 1];
            const direction = getDirection(
              { x: prevStep.col, y: prevStep.row },
              { x: step.col, y: step.row }
            );

            movementLeft -= moveCost;
            currentUnit.position = { x: step.col, y: step.row };
            currentUnit.movement_points_left = movementLeft;

            gameManager.getMapManager().moveUnit(selectedUnitId, currentUnit.position);
            const updatedUnit = gameManager.getMapManager().getUnits().find(u => u.id === selectedUnitId);
            if (updatedUnit) {
              updatedUnit.movement_points_left = currentUnit.movement_points_left;
            }
            setUnits((prevUnits: Unit[]) =>
              prevUnits.map(u =>
                u.id === selectedUnitId ? { ...u, ...currentUnit, direction } : u
              )
            );
            setMapState({ ...gameManager.getMapManager().getMap() });

            if (setVisibleTiles) {
              const mapRows = mapState.tiles.length;
              const mapCols = mapState.tiles[0].length;
              const visibles = getVisibleTiles(gameManager.getMapManager().getUnits(), mapRows, mapCols, 1);
              setVisibleTiles(visibles);
            }

            await new Promise(res => setTimeout(res, 750));
          }

          return true;
        }
      }
      return "Mugimendua ez da baliozkoa";
    },
    [gameManager, mapState, units, cities, visibleObjects, setUnits, setMapState, setSelectedUnitId, setVisibleTiles]
  );
}