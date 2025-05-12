import { useCallback, useRef } from 'react';
import { TILE_TYPES } from '../../../utils/Constants';
import Pathfinding2 from '../../../utils/Pathfinding2';
import GameManager from '../../../managers/GameManager';
import { MapState, Unit, City } from '../../../types';
import { useGame } from '../../../context/GameContext';

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
  setMapState: React.Dispatch<React.SetStateAction<MapState>>,
  setSelectedUnitId: (id: string | null) => void,
  setVisibleTiles?: (tiles: boolean[][]) => void
) {
  // Obtén el bando actual del contexto
  const { currentSide } = useGame();
  const isMovingRef = useRef(false);

  return useCallback(
    async (row: number, col: number, selectedUnitId: string | null) => {
      if (isMovingRef.current) {
        return "Unitatea mugimenduan dago!";
      }

      // Selecciona el fog correcto según el bando
      const fog =
        currentSide === 'player'
          ? mapState.fog_of_war_player
          : mapState.fog_of_war_ai;

      if (!fog?.[row]?.[col]) {
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

        if (unit.owner !== currentSide) {
          return "Ezin duzu beste bando baten unitatea mugitu";
        }

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
          fog
        );

        if (path) {
          isMovingRef.current = true;

          // Copia el fog adecuado
          let fogAcumulado = fog.map(row => [...row]);
          let currentUnit = { ...unit };
          let movementLeft = currentUnit.movement_points_left;

          for (let i = 1; i < path.length; i++) {
            const step = path[i];
            const terrain = mapState.tiles[step.row][step.col];
            const tile = TILE_TYPES[terrain];

            if (unit.type === 'itsasontzia' && !tile.requiresBoat) {
              isMovingRef.current = false;
              return "Itsasontzia ezin da lurrean mugitu";
            }
            if (tile.requiresBoat && unit.type !== 'itsasontzia') {
              isMovingRef.current = false;
              return "Ezin zara lurralde honetara mugitu, beharrezkoa da itsasontzi bat";
            }

            const moveCost = tile.movementCost;
            if (moveCost === Infinity) {
              isMovingRef.current = false;
              return "Ezin zara lurralde iritsezin batera mugitu";
            }

            if (movementLeft < moveCost) {
              isMovingRef.current = false;
              return "Unitateak ez ditu beharrezko mugimendu puntuak";
            }

            const prevStep = path[i - 1];
            const direction = getDirection(
              { x: prevStep.col, y: prevStep.row },
              { x: step.col, y: step.row }
            );

            movementLeft -= moveCost;

            gameManager.getMapManager().moveUnit(selectedUnitId, { x: step.col, y: step.row }, currentSide);

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

              const mapRows = mapState.tiles.length;
              const mapCols = mapState.tiles[0].length;
              // Solo unidades del bando activo
              const nuevosVisibles = getVisibleTiles(
                updatedUnits.filter(u => u.owner === currentSide),
                mapRows,
                mapCols,
                1
              );

              fogAcumulado = fogAcumulado.map((row, y) =>
                row.map((cell, x) => cell || nuevosVisibles[y][x])
              );

              return updatedUnits;
            });

            // Actualiza el fog correcto según el bando
setMapState((prevMap: MapState) => ({
  ...prevMap,
  fog_of_war_player: currentSide === 'player' ? fogAcumulado : prevMap.fog_of_war_player,
  fog_of_war_ai: currentSide === 'ai' ? fogAcumulado : prevMap.fog_of_war_ai,
}));

            if (setVisibleTiles) {
              const mapRows = mapState.tiles.length;
              const mapCols = mapState.tiles[0].length;
              const visibles = getVisibleTiles(
                gameManager.getMapManager().getUnits().filter(u => u.owner === currentSide),
                mapRows,
                mapCols,
                1
              );
              setVisibleTiles(visibles);
            }

            await new Promise(res => setTimeout(res, 750));
          }

          isMovingRef.current = false;
          return true;
        }

        return "Unitateak ez ditu beharrezko mugimendu puntuak";
      }
      return "Mugimendua ez da baliozkoa";
    },
    [gameManager, mapState, units, cities, visibleObjects, setUnits, setMapState, setSelectedUnitId, setVisibleTiles, currentSide]
  );
}