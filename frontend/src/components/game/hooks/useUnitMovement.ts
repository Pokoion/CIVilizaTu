import { useCallback } from 'react';
import { TILE_TYPES } from '../../../utils/Constants';
import Pathfinding2 from '../../../utils/Pathfinding2';
import GameManager from '../../../managers/GameManager';
import { MapState, Unit } from '../../../types';

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

export function useUnitMovement(
  gameManager: GameManager,
  mapState: MapState,
  units: Unit[],
  setUnits: (units: Unit[]) => void,
  setMapState: (map: MapState) => void,
  setSelectedUnitId: (id: string | null) => void,
  setVisibleTiles?: (tiles: boolean[][]) => void
) {
  return useCallback(
    async (row: number, col: number, selectedUnitId: string | null) => {
      // Nuevo: comprobar si el tile está descubierto
      if (!mapState.map.fog_of_war[row]?.[col]) {
        return "Ezin zara lurralde ezkutatura mugitu";
      }

      if (selectedUnitId) {
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit) return "Unitatea ez da aurkitu";

        const destTerrain = mapState.map.tiles[row][col];
        const destMoveCost = TILE_TYPES[destTerrain].movementCost;
        if (destMoveCost === Infinity) {
          return "Ezin zara lurralde iritsezin batera mugitu";
        }

        const path = Pathfinding2.findPath(
          mapState.map.tiles,
          { row: unit.position.y, col: unit.position.x },
          { row, col },
          unit.movement_points_left,
          mapState.map.fog_of_war
        );
        
        // Si el path no llega al destino, probablemente es por falta de puntos
        if (
          !path ||
          path.length <= 1 ||
          path[path.length - 1].row !== row ||
          path[path.length - 1].col !== col
        ) {
          return "Unitateak ez ditu beharrezko mugimendu puntuak";
        } {
          let currentUnit = { ...unit };
          let movementLeft = currentUnit.movement_points_left;

          for (let i = 1; i < path.length; i++) {
            const step = path[i];
            const terrain = mapState.map.tiles[step.row][step.col];
            const moveCost = TILE_TYPES[terrain].movementCost;

            if (moveCost === Infinity) {
              return "Ezin zara lurralde iritsezin batera mugitu";
            }

            if (movementLeft < moveCost) {
              return "Unitateak ez ditu beharrezko mugimendu puntuak";
            }

            movementLeft -= moveCost;
            currentUnit.position = { x: step.col, y: step.row };
            currentUnit.movement_points_left = movementLeft;

            gameManager.getMapManager().moveUnit(selectedUnitId, currentUnit.position);
            const updatedUnit = gameManager.getMapManager().getUnits().find(u => u.id === selectedUnitId);
            if (updatedUnit) {
              updatedUnit.movement_points_left = currentUnit.movement_points_left;
            }
            setUnits([...gameManager.getMapManager().getUnits()]);
            setMapState({ ...gameManager.getMapManager().getMap() });

            if (setVisibleTiles) {
              const mapRows = mapState.map.tiles.length;
              const mapCols = mapState.map.tiles[0].length;
              const visibles = getVisibleTiles(gameManager.getMapManager().getUnits(), mapRows, mapCols, 1);
              setVisibleTiles(visibles);
            }

            await new Promise(res => setTimeout(res, 120));
          }
          setSelectedUnitId(null);
          return true;
        }
      }
      return "Mugimendua ez da balioazkoa";
    },
    [gameManager, mapState, units, setUnits, setMapState, setSelectedUnitId, setVisibleTiles]
  );
}