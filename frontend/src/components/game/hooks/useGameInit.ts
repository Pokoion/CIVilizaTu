import { useEffect } from 'react';
import { TILE_SIZE } from '../../../utils/Constants';
import GameManager from '../../../managers/GameManager';
import { MapState, Unit } from '../../../types';

export function useGameInit(
  gameManager: GameManager,
  setMapState: (map: MapState) => void,
  setUnits: (units: Unit[]) => void,
  setCameraOffset: (offset: { x: number; y: number }) => void
) {
  useEffect(() => {
    gameManager.initializeGame().then(() => {
      const map = gameManager.getMapManager().getMap();
      setMapState(map);

      const gameUnits = gameManager.getMapManager().getUnits();
      setUnits(gameUnits);

      const mapWidthPx = map.map.size.width * TILE_SIZE;
      const mapHeightPx = map.map.size.height * TILE_SIZE;
      const offsetX = (window.innerWidth - mapWidthPx) / 2;
      const offsetY = (window.innerHeight - mapHeightPx * 0.5) / 2;
      setCameraOffset({ x: offsetX, y: offsetY });
    });
  }, [gameManager, setMapState, setUnits, setCameraOffset]);
}