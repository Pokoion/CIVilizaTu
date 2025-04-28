import React, { useState } from 'react';
import GameManager from '../../managers/GameManager';
import Tile2 from './Tile2';
import Unit from './Unit';
import '../../styles/Map2.css';
import { MapState, TerrainType, UnitProps } from '../../types';
import { useUnitMovement } from './hooks/useUnitMovement';
import { useGameInit } from './hooks/useGameInit';
import { useCameraDrag } from './hooks/useCameraDrag';

const gameManager = new GameManager();

const Map2 = () => {
  const [mapState, setMapState] = useState<MapState>({
    map: {
      size: { width: 0, height: 0 },
      tiles: [] as TerrainType[][],
      fog_of_war: [],
    },
  });

  const [units, setUnits] = useState<UnitProps[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Camera offset state
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  // Camera drag handlers
  useCameraDrag(setCameraOffset);

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
                    movement_points={unit.movement_points}
                    movement_points_left={unit.movement_points_left}
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