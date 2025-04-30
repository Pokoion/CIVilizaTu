import React, { useState } from 'react';
import GameManager from '../../managers/GameManager';
import Tile2 from './Tile2';
import Unit from './Unit';
import '../../styles/Map2.css';
import { TerrainType, UnitProps } from '../../types';
import { useUnitMovement } from './hooks/useUnitMovement';
import { useGameInit } from './hooks/useGameInit';
import { useCameraDrag } from './hooks/useCameraDrag';
import { useGame } from '../../context/GameContext'; // <-- Nuevo

const gameManager = new GameManager();

type Map2Props = {
  setSelectedUnit: (unit: UnitProps | null) => void;
  setSelectedTile: (tile: { row: number; col: number; type: TerrainType; isDiscovered?: boolean } | null) => void;
};

const Map2: React.FC<Map2Props> = ({ setSelectedUnit, setSelectedTile }) => {
  const { mapState, setMapState, units, setUnits, selectedUnitId, setSelectedUnitId, setMessage } = useGame();

  // Camera offset state
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  // Camera drag handlers
  useCameraDrag(setCameraOffset);

  // Inicialización del juego
  useGameInit(gameManager, setMapState, setUnits, setCameraOffset);

  const moveUnit = useUnitMovement(
    gameManager,
    mapState,
    units,
    setUnits,
    setMapState,
    setSelectedUnitId
  );

  // Movimiento de unidades (mantén la lógica original)
  const handleTileClick = async (rowIndex: number, colIndex: number, selectedUnitId: string | null) => {
    setSelectedTile({
      row: rowIndex,
      col: colIndex,
      type: mapState.map.tiles[rowIndex][colIndex],
      isDiscovered: !!mapState.map.fog_of_war[rowIndex]?.[colIndex],
    });
    setSelectedUnit(null);
  
    // Solo intenta mover si hay unidad seleccionada
    if (!selectedUnitId) {
      return; // No mostrar mensaje, solo seleccionar tile
    }
  
    const result = await moveUnit(rowIndex, colIndex, selectedUnitId);
    if (result !== true) {
      setMessage(result); // El mensaje será el string devuelto
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleUnitClick = (unitId: string) => {
    const unit = units.find(u => u.id === unitId) || null;
    setSelectedUnit(unit); // Selecciona la unidad para el InfoPanel
    setSelectedTile(null); // Deselecciona tile en el InfoPanel
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

            let fogStatus: 'undiscovered' | 'visible';
            if (!mapState.map.fog_of_war[rowIndex]?.[colIndex]) {
              fogStatus = 'undiscovered';
            } else {
              fogStatus = 'visible';
            }

            return (
              <Tile2
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                tileType={tileType}
                isDiscovered={mapState.map.fog_of_war[rowIndex]?.[colIndex] || false}
                fogStatus={fogStatus}
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