import { useEffect } from 'react';
import { TILE_SIZE } from '../../../utils/Constants';
import GameManager from '../../../managers/GameManager';
import { City, MapState, Unit } from '../../../types';

export function useGameInit(
  gameManager: GameManager,
  setMapState: (map: MapState) => void,
  setUnits: (units: Unit[]) => void,
  setCities: (cities: City[]) => void,
  setCameraOffset: (offset: { x: number; y: number }) => void
) {
  useEffect(() => {
    gameManager.initializeGame().then(() => {
      const map = gameManager.getMapManager().getMap();
      setMapState(map);

      const gameUnits = gameManager.getMapManager().getUnits();
      setUnits(gameUnits);

      const gameCities = gameManager.getMapManager().getCities();
      setCities(gameCities);

      const mapWidthPx = map.size.width * TILE_SIZE;
      const mapHeightPx = map.size.height * TILE_SIZE;
      const offsetX = (window.innerWidth - mapWidthPx) / 2;
      const offsetY = (window.innerHeight - mapHeightPx) / 2;
      setCameraOffset({ x: offsetX, y: offsetY });
    });
  }, [gameManager, setMapState, setUnits, setCameraOffset]);
}