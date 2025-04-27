import { useCallback } from 'react';
import { TILE_TYPES } from '../../../utils/Constants';
import Pathfinding2 from '../../../utils/Pathfinding2';
import { Unit as UnitState } from '../../../managers/MapManager';
import GameManager from '../../../managers/GameManager';
import { MapState } from '../../../managers/MapManager';

export function useUnitMovement(
  gameManager: GameManager,
  mapState: MapState,
  units: UnitState[],
  setUnits: (units: UnitState[]) => void,
  setMapState: (map: MapState) => void,
  setSelectedUnitId: (id: string | null) => void
) {
  return useCallback(
    async (row: number, col: number, selectedUnitId: string | null) => {
      if (
        selectedUnitId &&
        mapState.map.fog_of_war[row]?.[col]
      ) {
        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit) return;

        const destTerrain = mapState.map.tiles[row][col];
        const destMoveCost = TILE_TYPES[destTerrain].movementCost;
        if (destMoveCost === Infinity) {
          console.warn('No puedes mover a un tile inaccesible.');
          return;
        }

        const path = Pathfinding2.findPath(
          mapState.map.tiles,
          { row: unit.position.y, col: unit.position.x },
          { row, col },
          unit.movement_points_left,
          mapState.map.fog_of_war
        );

        if (
          path.length > 1 &&
          path[path.length - 1].row === row &&
          path[path.length - 1].col === col
        ) {
          let currentUnit = { ...unit };
          let movementLeft = currentUnit.movement_points_left;

          for (let i = 1; i < path.length; i++) {
            const step = path[i];
            const terrain = mapState.map.tiles[step.row][step.col];
            const moveCost = TILE_TYPES[terrain].movementCost;

            if (moveCost === Infinity) {
              console.warn('No puedes mover a un tile inaccesible.');
              break;
            }

            if (movementLeft < moveCost) break;

            movementLeft -= moveCost;
            currentUnit.position = { x: step.col, y: step.row };
            currentUnit.movement_points_left = movementLeft;

            gameManager.getMapManager().moveUnit(selectedUnitId, currentUnit.position);
            const updatedUnit = gameManager.getMapManager().getUnits().find(u => u.id === selectedUnitId);
            if (updatedUnit) {
              updatedUnit.movement_points_left = currentUnit.movement_points_left;
              console.log(
                `Unidad ${updatedUnit.id} (${updatedUnit.type}) - Movimiento total: ${updatedUnit.movement_points}, Restante: ${updatedUnit.movement_points_left}`
              );
            }
            setUnits([...gameManager.getMapManager().getUnits()]);
            setMapState({ ...gameManager.getMapManager().getMap() });

            // eslint-disable-next-line no-await-in-loop
            await new Promise(res => setTimeout(res, 120));
          }
          setSelectedUnitId(null);
        }
      }
    },
    [gameManager, mapState, units, setUnits, setMapState, setSelectedUnitId]
  );
}