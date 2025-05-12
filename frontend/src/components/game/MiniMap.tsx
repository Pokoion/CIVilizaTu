import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { TILE_TYPES } from '../../utils/Constants';

const MINIMAP_SIZE = 200; // px
const TILE_PIXELS = 4;

const MiniMap: React.FC = () => {
  const { mapState, units, cities, currentSide } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Selecciona el fog según el bando activo
    const fog_of_war =
      currentSide === 'player'
        ? mapState.fog_of_war_player
        : mapState.fog_of_war_ai;

    const { tiles, size } = mapState;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Dibuja terreno y niebla
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        const tileType = tiles[y][x];
        const color = fog_of_war?.[y]?.[x]
          ? TILE_TYPES[tileType]?.color || '#888'
          : '#222';
        ctx.fillStyle = color;
        ctx.fillRect(x * TILE_PIXELS, y * TILE_PIXELS, TILE_PIXELS, TILE_PIXELS);
      }
    }

    // Dibuja ciudades solo si el tile es visible para el bando activo
    cities.forEach(city => {
      if (fog_of_war?.[city.position.y]?.[city.position.x]) {
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(
          city.position.x * TILE_PIXELS,
          city.position.y * TILE_PIXELS,
          TILE_PIXELS,
          TILE_PIXELS
        );
      }
    });

    // Dibuja unidades solo si el tile es visible para el bando activo
    units.forEach(unit => {
      if (fog_of_war?.[unit.position.y]?.[unit.position.x]) {
        ctx.fillStyle = '#e53935';
        ctx.fillRect(
          unit.position.x * TILE_PIXELS,
          unit.position.y * TILE_PIXELS,
          TILE_PIXELS,
          TILE_PIXELS
        );
      }
    });

  }, [mapState, units, cities, currentSide]);

  return (
    <canvas
      ref={canvasRef}
      width={MINIMAP_SIZE}
      height={MINIMAP_SIZE}
      style={{
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        background: 'transparent',
      }}
    />
  );
};

export default MiniMap;