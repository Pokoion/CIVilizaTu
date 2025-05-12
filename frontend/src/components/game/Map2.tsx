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
import { UNITS, TILE_TYPES } from '../../utils/Constants';
import { getVisibleTiles } from './hooks/useUnitMovement';

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
    setInitialCameraOffset, visibleObjects, setVisibleObjects, deployingUnit, setDeployingUnit, unlockedTechs,
    currentSide
  } = useGame();

  const gridRef = useRef<HTMLDivElement>(null);

  // Camera offset state
  const [cameraOffset, setCameraOffset] = useState(() => {
    return { x: 0, y: 0 };
  });

  // Actualiza el contexto global de la cámara
  useEffect(() => {
    setCamera({ offset: cameraOffset });
  }, [cameraOffset, setCamera]);

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

  // --- NUEVO: Selecciona el fog según el bando activo ---
  const fog =
    currentSide === 'player'
      ? mapState.fog_of_war_player
      : mapState.fog_of_war_ai;

  // --- NUEVO: Tiles válidos para desplegar unidad ---
  let deployableTiles: { x: number; y: number }[] = [];
  if (deployingUnit) {
    const { city } = deployingUnit;
    const isBoat = deployingUnit.unit.type === "itsasontzia";
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const x = city.position.x + dx;
        const y = city.position.y + dy;
        if (
          x >= 0 && x < mapState.size.width &&
          y >= 0 && y < mapState.size.height
        ) {
          const isDiscovered = !!fog?.[y]?.[x];
          const isEmpty =
            !units.some(u => u.position.x === x && u.position.y === y) &&
            !cities.some(c => c.position.x === x && c.position.y === y);

          const tileType = mapState.tiles[y][x];
          const requiresBoat = TILE_TYPES[tileType]?.requiresBoat;

          if (
            isEmpty &&
            isDiscovered &&
            (
              (isBoat && requiresBoat) ||
              (!isBoat && !requiresBoat)
            )
          ) {
            deployableTiles.push({ x, y });
          }
        }
      }
    }
  }

  // --- NUEVO: Permitir ataque según rango ---
  const canAttack = (attacker: UnitProps, target: UnitProps) => {
    const dx = Math.abs(attacker.position.x - target.position.x);
    const dy = Math.abs(attacker.position.y - target.position.y);
    const distance = dx + dy;
    return distance <= (attacker.range ?? 1);
  };

  // --- NUEVO: Deshabilitar acciones si es turno de la IA ---
  const isPlayerTurn = currentSide === 'player';

  const handleTileClick = async (rowIndex: number, colIndex: number, selectedUnitId: string | null) => {
    if (!isPlayerTurn) return; // No permitir acciones en turno de la IA

    // --- NUEVO: Despliegue de unidad ---
    if (deployingUnit) {
      const isDeployable = deployableTiles.some(t => t.x === colIndex && t.y === rowIndex);
      if (isDeployable) {
        const unitDef = UNITS.find(u => u.id === deployingUnit.unit.type);
        if (!unitDef) {
          setMessage('Errorea: unitate mota ez da aurkitu.');
          return;
        }
        setUnits(prev => {
          const penizilinaBonus = unlockedTechs.includes("penizilina") ? 30 : 0;

          const hasBurdina = unlockedTechs.includes("burdina");
          const hasArtilleria = unlockedTechs.includes("artilleria");
          const baseStrength = unitDef.strength ?? 0;
          const strength = baseStrength + (hasBurdina ? 5 : 0) + (hasArtilleria ? 10 : 0);

          const hasGurpila = unlockedTechs.includes("gurpila");
          const baseMovement = unitDef.movementPoints ?? 1;
          const movement_points = baseMovement + (hasGurpila ? 3 : 0);

          const newUnits: UnitProps[] = [
            ...prev,
            {
              id: `unit_${Date.now()}`,
              type: deployingUnit.unit.type,
              position: { x: colIndex, y: rowIndex },
              owner: currentSide, // <-- Cambia el owner según el bando activo
              movement_points: movement_points,
              movement_points_left: movement_points,
              health: unitDef.health + penizilinaBonus,
              range: unitDef.range,
              strength: strength,
              direction: "default",
            }
          ];
          const mapRows = mapState.tiles.length;
          const mapCols = mapState.tiles[0].length;
          const nuevosVisibles = getVisibleTiles(
            newUnits.filter(u => u.owner === currentSide),
            mapRows,
            mapCols,
            1
          );
          // Actualiza el fog correcto según el bando
          if (currentSide === 'player') {
            setMapState(prevMap => ({
              ...prevMap,
              fog_of_war_player: prevMap.fog_of_war_player.map((row, y) =>
                row.map((cell, x) => cell || nuevosVisibles[y][x])
              ),
            }));
          } else {
            setMapState(prevMap => ({
              ...prevMap,
              fog_of_war_ai: prevMap.fog_of_war_ai.map((row, y) =>
                row.map((cell, x) => cell || nuevosVisibles[y][x])
              ),
            }));
          }
          return newUnits;
        });
        setCities(prev =>
          prev.map(c =>
            c.id === deployingUnit.city.id
              ? { ...c, training: c.training.filter(u => u.id !== deployingUnit.unit.id) }
              : c
          )
        );
        setDeployingUnit(null);
        setMessage('Unitatea mapan kokatu da!');
        return;
      } else {
        return;
      }
    }

    // Si hay unidad seleccionada, intenta mover
    if (selectedUnitId) {
      const result = await moveUnit(rowIndex, colIndex, selectedUnitId);
      if (result !== true) {
        setMessage(result);
      } else {
        const movedUnit = units.find(u => u.id === selectedUnitId);
        if (movedUnit) setSelectedUnit(movedUnit);
      }
      setSelectedTile(null);
      setSelectedCity(null);
      setSelectedEnemyUnit(null);
      setSelectedVisibleObject(null);
    } else {
      setSelectedTile({
        row: rowIndex,
        col: colIndex,
        type: mapState.tiles[rowIndex][colIndex],
        isDiscovered: !!fog?.[rowIndex]?.[colIndex],
      });
      setSelectedUnit(null);
      setSelectedCity(null);
      setSelectedEnemyUnit(null);
      setSelectedVisibleObject(null);
    }
  };

  const handleUnitClick = (unitId: string) => {
    if (!isPlayerTurn) return; // No permitir acciones en turno de la IA

    const unit = units.find(u => u.id === unitId) || null;
    // Si tienes una unidad seleccionada y haces click en una enemiga
    if (selectedUnitId && unit && unit.owner !== currentSide) {
      const selectedUnit = units.find(u => u.id === selectedUnitId);
      if (selectedUnit && canAttack(selectedUnit, unit)) {
        setSelectedEnemyUnit(unit);
        setSelectedTile(null);
        setSelectedCity(null);
        setSelectedVisibleObject(null);
        return;
      } else {
        setMessage('Unitatea ez dago zure eremuan (rango barne)!');
        return;
      }
    }
    // Si haces click en una unidad tuya
    if (unit && unit.owner === currentSide) {
      setSelectedUnit(unit);
      setSelectedEnemyUnit(null);
      setSelectedTile(null);
      setSelectedUnitId(prev => prev === unitId ? null : unitId);
      setSelectedCity(null);
      setSelectedVisibleObject(null);
    }
  };

  const handleCityClick = (city: CityProps) => {
    if (!isPlayerTurn) return; // No permitir acciones en turno de la IA

    setSelectedCity(city);
    setSelectedTile(null);
    setSelectedEnemyUnit(null);
    setSelectedVisibleObject(null);
  };

  const handleVisibleObjectClick = (obj: { type: string; position: { x: number; y: number } }) => {
    if (!isPlayerTurn) return; // No permitir acciones en turno de la IA

    setSelectedVisibleObject(obj);
    setSelectedTile(null);
    setSelectedCity(null);
    setSelectedEnemyUnit(null);
  };

  // --- NUEVO: Solo muestra ciudades/unidades del bando activo ---
  const visibleCities = cities.filter(c => fog?.[c.position.y]?.[c.position.x]);
  const visibleUnits = units.filter(u => fog?.[u.position.y]?.[u.position.x]);

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
            const unit = visibleUnits.find(
              (u) => u.position.x === colIndex && u.position.y === rowIndex
            );
            const city = visibleCities?.find(
              (c) => c.position.x === colIndex && c.position.y === rowIndex
            );

            let fogStatus: 'undiscovered' | 'visible';
            const isDiscovered = !!fog?.[rowIndex]?.[colIndex];
            if (!isDiscovered) {
              fogStatus = 'undiscovered';
            } else {
              fogStatus = 'visible';
            }

            const isDeployableTile = deployingUnit
              ? deployableTiles.some(t => t.x === colIndex && t.y === rowIndex)
              : false;

            return (
              <Tile2
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                tileType={tileType}
                isDiscovered={isDiscovered}
                fogStatus={fogStatus}
                onClick={() => handleTileClick(rowIndex, colIndex, selectedUnitId)}
                className={isDeployableTile ? 'deployable-tile' : ''}
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
                    range={unit.range}
                    strength={unit.strength}
                    owner={unit.owner}
                    selected={selectedUnitId === unit.id}
                    onClick={() => handleUnitClick(unit.id)}
                    disabled={unit.owner !== currentSide || !isPlayerTurn}
                    direction={unit.direction || 'default'}
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