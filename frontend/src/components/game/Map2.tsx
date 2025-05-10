import React, { useState, useRef, useEffect } from 'react';
import GameManager from '../../managers/GameManager';
import Tile2 from './Tile2';
import Unit from './Unit';
import City from './City';
import VisibleObject from './VisibleObject';
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
  setSelectedEnemyUnit: (unit: UnitProps | null) => void;
  setSelectedVisibleObject: (obj: { type: string; position: { x: number; y: number } } | null) => void;
};

const Map2: React.FC<Map2Props> = ({
  setSelectedUnit,
  setSelectedTile,
  setSelectedEnemyUnit,
  setSelectedVisibleObject,
}) => {
  const {
    mapState, setMapState, units, setUnits, cities, setCities,
    setSelectedCity, selectedUnitId, setSelectedUnitId, setMessage, setCamera,
    setInitialCameraOffset, visibleObjects, setVisibleObjects,
  } = useGame();

  const gridRef = useRef<HTMLDivElement>(null);

  // Camera offset state
  const [cameraOffset, setCameraOffset] = useState(() => {
    console.log('Estado inicial cámara:', { x: 0, y: 0 });
    return { x: 0, y: 0 };
  });

  // Actualiza el contexto global de la cámara
  useEffect(() => {
    setCamera({ offset: cameraOffset });
  }, [cameraOffset, setCamera]);

  useEffect(() => {
    console.log('Cámara actualizada:', cameraOffset);
  }, [cameraOffset]);

  useEffect(() => {
  if (selectedUnitId) {
    const updatedUnit = units.find(u => u.id === selectedUnitId) || null;
    setSelectedUnit(updatedUnit);
  }
}, [units, selectedUnitId, setSelectedUnit]);

  // Camera drag handlers
  useCameraDrag(setCameraOffset);

  // Inicialización del juego
  useGameInit(gameManager, setMapState, setUnits, setCities, setCameraOffset, setInitialCameraOffset);

  const moveUnit = useUnitMovement(
    gameManager,
    mapState,
    units,
    cities,
    visibleObjects,
    setUnits,
    setMapState,
    setSelectedUnitId
  );

  const handleTileClick = async (rowIndex: number, colIndex: number, selectedUnitId: string | null) => {
    // Si hay unidad seleccionada, intenta mover
    if (selectedUnitId) {
      const result = await moveUnit(rowIndex, colIndex, selectedUnitId);
      if (result !== true) {
        setMessage(result);
        setTimeout(() => setMessage(null), 2000);
      } else {
        // Mantén la unidad seleccionada tras mover si quieres
        // O vuelve a seleccionarla por su id si su posición ha cambiado
        const movedUnit = units.find(u => u.id === selectedUnitId);
        if (movedUnit) setSelectedUnit(movedUnit);
      }
      setSelectedTile(null); // No muestres info del tile al mover
      setSelectedCity(null);
      setSelectedEnemyUnit(null);
      setSelectedVisibleObject(null);
    } else {
      // Si no hay unidad seleccionada, muestra info del tile
      setSelectedTile({
        row: rowIndex,
        col: colIndex,
        type: mapState.tiles[rowIndex][colIndex],
        isDiscovered: !!mapState.fog_of_war[rowIndex]?.[colIndex],
      });
      setSelectedUnit(null);
      setSelectedCity(null);
      setSelectedEnemyUnit(null);
      setSelectedVisibleObject(null);
    }
  };

  const handleUnitClick = (unitId: string) => {
    const unit = units.find(u => u.id === unitId) || null;
    if (selectedUnitId && unit && unit.owner === 'ai') {
      setSelectedEnemyUnit(unit);
      setSelectedTile(null);
      setSelectedCity(null);
      setSelectedVisibleObject(null);
      return;
    }
    if (unit && unit.owner === 'player') {
      setSelectedUnit(unit);
      setSelectedEnemyUnit(null);
      setSelectedTile(null);
      setSelectedUnitId(prev => prev === unitId ? null : unitId);
      setSelectedCity(null);
      setSelectedVisibleObject(null);
    }
  };

  const handleCityClick = (city: CityProps) => {
    setSelectedCity(city);
    setSelectedTile(null);
    setSelectedEnemyUnit(null);
    setSelectedVisibleObject(null);
  };

  const handleVisibleObjectClick = (obj: { type: string; position: { x: number; y: number } }) => {
    console.log('Seleccionando visibleObject:', obj);
    setSelectedVisibleObject(obj);
    setSelectedTile(null);
    setSelectedCity(null);
    setSelectedEnemyUnit(null);
  };

  return (
    <div className="map-wrapper" style={{ userSelect: 'none' }}>
      <div
        ref={gridRef}
        className="map-grid"
        style={{
          width: `${mapState.size.width * 140}px`,
          height: `${mapState.size.height * 140}px`,
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
            const isDiscovered = !!mapState.fog_of_war[rowIndex]?.[colIndex];
            if (!isDiscovered) {
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
                isDiscovered={isDiscovered}
                fogStatus={fogStatus}
                onClick={() => handleTileClick(rowIndex, colIndex, selectedUnitId)}
              >
                {isDiscovered && visibleObjects &&
                  visibleObjects
                    .filter(obj => obj.position.x === colIndex && obj.position.y === rowIndex)
                    .map(obj => (
                      <VisibleObject
                        key={`${obj.type}-${obj.position.x}-${obj.position.y}`}
                        type={obj.type}
                        position={obj.position}
                        onClick={() => handleVisibleObjectClick(obj)}
                      />
                    ))
                }
                {city && isDiscovered && (
                  <City
                    id={city.id}
                    name={city.name}
                    position={city.position}
                    population={city.population}
                    owner={city.owner}
                    onClick={() => handleCityClick(city)}
                    buildings={city.buildings}
                    production={city.production}
                    defense={city.defense}
                    health={city.health}
                    era={city.era}
                    training={city.training}
                  />
                )}
                {unit && isDiscovered && (
                  <Unit
                    id={unit.id}
                    type={unit.type}
                    position={unit.position}
                    movement_points={unit.movement_points}
                    movement_points_left={unit.movement_points_left}
                    health={unit.health}
                    strength={unit.strength}
                    owner={unit.owner}
                    selected={selectedUnitId === unit.id}
                    onClick={() => handleUnitClick(unit.id)}
                    disabled={unit.owner !== 'player'}
                    direction={unit.direction || 'default'} // <-- AÑADE ESTA LÍNEA
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