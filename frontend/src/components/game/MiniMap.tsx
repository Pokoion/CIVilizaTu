import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { TILE_TYPES } from '../../utils/Constants';

const MINIMAP_SIZE = 200; // px
const TILE_PIXELS = 4; // Cada tile será 3x3 px (para 50x50 cabe en 150x150)

const MiniMap: React.FC = () => {
  const { mapState, units, cities } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { tiles, fog_of_war, size } = mapState;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Dibuja el terreno y la niebla
    for (let y = 0; y < size.height; y++) {
      for (let x = 0; x < size.width; x++) {
        const tileType = tiles[y][x];
        const color = fog_of_war[y][x]
          ? TILE_TYPES[tileType]?.color || '#888'
          : '#222'; // Niebla: negro
        ctx.fillStyle = color;
        ctx.fillRect(x * TILE_PIXELS, y * TILE_PIXELS, TILE_PIXELS, TILE_PIXELS);
      }
    }

    // Dibuja las ciudades (azul)
    cities.forEach(city => {
      ctx.fillStyle = '#2196f3';
      ctx.fillRect(
        city.position.x * TILE_PIXELS,
        city.position.y * TILE_PIXELS,
        TILE_PIXELS,
        TILE_PIXELS
      );
    });

    // Dibuja las unidades (rojo)
    units.forEach(unit => {
      ctx.fillStyle = '#e53935';
      ctx.fillRect(
        unit.position.x * TILE_PIXELS,
        unit.position.y * TILE_PIXELS,
        TILE_PIXELS,
        TILE_PIXELS
      );
    });
  }, [mapState, units, cities]);

  return (
    <canvas
      ref={canvasRef}
      width={MINIMAP_SIZE}
      height={MINIMAP_SIZE}
      style={{
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        border: '2px solid #444',
        background: '#111',
        display: 'block',
      }}
    />
  );
};

export default MiniMap;