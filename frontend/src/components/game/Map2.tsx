import React, { useState, useRef } from 'react';
import GameManager from '../../managers/GameManager';
import Tile2 from './Tile2';
import Unit from './Unit';
import '../../styles/Map2.css';
import { MapState } from '../../managers/MapManager';
import { Unit as UnitState } from '../../managers/MapManager';
import { TerrainType, TILE_SIZE } from '../../utils/Constants';
import { useUnitMovement } from './hooks/useUnitMovement';
import { useGameInit } from './hooks/useGameInit';

const gameManager = new GameManager();

const Map2 = () => {
  const [mapState, setMapState] = useState<MapState>({
    map: {
      size: { width: 0, height: 0 },
      tiles: [] as TerrainType[][],
      fog_of_war: [],
    },
  });

  const [units, setUnits] = useState<UnitState[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Camera offset state
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Camera drag handlers
  React.useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        dragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (dragging.current) {
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setCameraOffset(prev => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        lastPos.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', e => e.preventDefault());
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, []);

  // Inicialización del juego
  useGameInit(gameManager, setMapState, setUnits, setCameraOffset);

  // Movimiento de unidades
  const handleTileClick = useUnitMovement(
    gameManager,
    mapState,
    units,
    setUnits,
    setMapState,
    setSelectedUnitId
  );

  const handleUnitClick = (unitId: string) => {
    setSelectedUnitId(prev => prev === unitId ? null : unitId);
  };

  return (
    <div className="map-wrapper" style={{ userSelect: 'none' }}>
      <div
        className="map-grid"
        style={{
          gridTemplateColumns: `repeat(${mapState.map.size.width}, 1fr)`,
          gridTemplateRows: `repeat(${mapState.map.size.height}, 1fr)`,
          transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px) rotateX(60deg) rotateZ(45deg)`,
        }}
      >
        {mapState.map.tiles.map((row, rowIndex) =>
          row.map((tileType, colIndex) => {
            const unit = units.find(
              (u) => u.position.x === colIndex && u.position.y === rowIndex
            );
            return (
              <Tile2
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                tileType={tileType}
                isDiscovered={mapState.map.fog_of_war[rowIndex]?.[colIndex] || false}
                onClick={() => handleTileClick(rowIndex, colIndex, selectedUnitId)}
              >
                {unit && (
                  <Unit
                    id={unit.id}
                    type={unit.type}
                    position={unit.position}
                    visible={unit.visible}
                    selected={selectedUnitId === unit.id}
                    onClick={() => handleUnitClick(unit.id)}
                  />
                )}
              </Tile2>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Map2;