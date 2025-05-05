import { useEffect } from 'react';
import { TILE_SIZE } from '../../../utils/Constants';
import GameManager from '../../../managers/GameManager';
import { City, MapState, Unit } from '../../../types';

export function useGameInit(
  gameManager: GameManager,
  setMapState: (map: MapState) => void,
  setUnits: (units: Unit[]) => void,
  setCities: (cities: City[]) => void,
  setCameraOffset: (offset: { x: number; y: number }) => void,
  setInitialCameraOffset: (offset: { x: number; y: number }) => void
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
      const initialCameraOffset = {
        x: (window.innerWidth / 2) - (mapWidthPx / 2),
        y: (window.innerHeight / 2) - (mapHeightPx / 2),
      };
      setCameraOffset(initialCameraOffset);
      setInitialCameraOffset(initialCameraOffset); // ahora sí existe
    });
  }, [gameManager, setMapState, setUnits, setCameraOffset, setInitialCameraOffset]);
}