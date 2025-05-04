import React, { useState } from 'react';
import GameManager from '../../managers/GameManager';
import Tile2 from './Tile2';
import Unit from './Unit';
import City from './City';
import '../../styles/Map2.css';
import { TerrainType, UnitProps, CityProps } from '../../types';
import { useUnitMovement } from './hooks/useUnitMovement';
import { useGameInit } from './hooks/useGameInit';
import { useCameraDrag } from './hooks/useCameraDrag';
import { useGame } from '../../context/GameContext';

const gameManager = new GameManager();

type Map2Props = {
  setSelectedUnit: (unit: UnitProps | null) => void;
  setSelectedTile: (tile: { row: number; col: number; type: TerrainType; isDiscovered?: boolean } | null) => void;
};

const Map2: React.FC<Map2Props> = ({ setSelectedUnit, setSelectedTile }) => {
  const { mapState, setMapState, units, setUnits, cities, setCities, setSelectedCity, selectedUnitId, setSelectedUnitId, setMessage } = useGame();

  // Camera offset state
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  // Camera drag handlers
  useCameraDrag(setCameraOffset);

  // Inicialización del juego
  useGameInit(gameManager, setMapState, setUnits, setCities, setCameraOffset);

  const moveUnit = useUnitMovement(
    gameManager,
    mapState,
    units,
    setUnits,
    setMapState,
    setSelectedUnitId
  );

  const handleTileClick = async (rowIndex: number, colIndex: number, selectedUnitId: string | null) => {
    setSelectedTile({
      row: rowIndex,
      col: colIndex,
      type: mapState.tiles[rowIndex][colIndex],
      isDiscovered: !!mapState.fog_of_war[rowIndex]?.[colIndex],
    });
    setSelectedUnit(null);
    setSelectedCity(null);

    // Solo intenta mover si hay unidad seleccionada
    if (!selectedUnitId) {
      return;
    }

    const result = await moveUnit(rowIndex, colIndex, selectedUnitId);
    if (result !== true) {
      setMessage(result);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleUnitClick = (unitId: string) => {
    const unit = units.find(u => u.id === unitId) || null;
    setSelectedUnit(unit);
    setSelectedTile(null);
    setSelectedUnitId(prev => prev === unitId ? null : unitId);
    setSelectedCity(null);
  };

  const handleCityClick = (city: CityProps) => {
    setSelectedCity(city);
    setSelectedUnit(null);
    setSelectedTile(null);
  };

  return (
    <div className="map-wrapper" style={{ userSelect: 'none' }}>
      <div
        className="map-grid"
        style={{
          gridTemplateColumns: `repeat(${mapState.size.width}, 1fr)`,
          gridTemplateRows: `repeat(${mapState.size.height}, 1fr)`,
          transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px) rotateX(60deg) rotateZ(45deg)`,
        }}
      >
        {mapState.tiles.map((row, rowIndex) =>
          row.map((tileType, colIndex) => {
            const unit = units.find(
              (u) => u.position.x === colIndex && u.position.y === rowIndex
            );
            const city = cities?.find(
              (c) => c.position.x === colIndex && c.position.y === rowIndex
            );

            let fogStatus: 'undiscovered' | 'visible';
            if (!mapState.fog_of_war[rowIndex]?.[colIndex]) {
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
                isDiscovered={mapState.fog_of_war[rowIndex]?.[colIndex] || false}
                fogStatus={fogStatus}
                onClick={() => handleTileClick(rowIndex, colIndex, selectedUnitId)}
              >
                {city && (
                  <City
                    id={city.id}
                    name={city.name}
                    position={city.position}
                    population={city.population}
                    onClick={() => handleCityClick(city)}
                  />
                )}
                {unit && (
                  <Unit
                    id={unit.id}
                    type={unit.type}
                    position={unit.position}
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