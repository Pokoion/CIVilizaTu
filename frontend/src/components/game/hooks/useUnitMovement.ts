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
  visibleObjects: { type: string; position: { x: number; y: number } }[],
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>,
  setMapState: (map: MapState) => void,
  setSelectedUnitId: (id: string | null) => void,
  setVisibleTiles?: (tiles: boolean[][]) => void
) {
  return useCallback(
    async (row: number, col: number, selectedUnitId: string | null) => {
      if (!mapState.fog_of_war[row]?.[col]) {
        return "Ezin zara lurralde ezkutatura mugitu";
      }

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

        if (destTile.requiresBoat && unit.type !== 'itsasontzia') {
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
          // Inicializa el fog acumulado con el actual
          let fogAcumulado = mapState.fog_of_war.map(row => [...row]);
          let currentUnit = { ...unit };
          let movementLeft = currentUnit.movement_points_left;

          for (let i = 1; i < path.length; i++) {
            const step = path[i];
            const terrain = mapState.tiles[step.row][step.col];
            const tile = TILE_TYPES[terrain];

            if (unit.type === 'itsasontzia' && !tile.requiresBoat) {
              return "Itsasontzia ezin da lurrean mugitu";
            }
            if (tile.requiresBoat && unit.type !== 'itsasontzia') {
              return "Ezin zara lurralde honetara mugitu, beharrezkoa da itsasontzi bat";
            }

            const moveCost = tile.movementCost;
            if (moveCost === Infinity) {
              return "Ezin zara lurralde iritsezin batera mugitu";
            }

            if (movementLeft < moveCost) {
              return "Unitateak ez ditu beharrezko mugimendu puntuak";
            }

            const prevStep = path[i - 1];
            const direction = getDirection(
              { x: prevStep.col, y: prevStep.row },
              { x: step.col, y: step.row }
            );

            movementLeft -= moveCost;

            gameManager.getMapManager().moveUnit(selectedUnitId, { x: step.col, y: step.row });

            setUnits((prevUnits: Unit[]) => {
              const updatedUnits = prevUnits.map(u =>
                u.id === selectedUnitId
                  ? {
                    ...u,
                    position: { x: step.col, y: step.row },
                    movement_points_left: movementLeft,
                    direction
                  }
                  : u
              );

              // Calcula la visibilidad con las unidades actualizadas del contexto
              const mapRows = mapState.tiles.length;
              const mapCols = mapState.tiles[0].length;
              const nuevosVisibles = getVisibleTiles(
                updatedUnits.filter(u => u.owner === 'player'),
                mapRows,
                mapCols,
                1
              );

              // Acumula el fog en todo el recorrido
              fogAcumulado = fogAcumulado.map((row, y) =>
                row.map((cell, x) => cell || nuevosVisibles[y][x])
              );

              return updatedUnits;
            });

            // ACTUALIZA EL MAPA EN CADA PASO PARA DESCUBRIMIENTO INSTANTÁNEO
            setMapState({
              ...mapState,
              fog_of_war: fogAcumulado,
            });

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

        return "Unitateak ez ditu beharrezko mugimendu puntuak";
      }
      return "Mugimendua ez da baliozkoa";
    },
    [gameManager, mapState, units, cities, visibleObjects, setUnits, setMapState, setSelectedUnitId, setVisibleTiles]
  );
}