import React, { useState, useEffect } from 'react';
import '../../styles/Map.css';
import { findShortestPath } from '../../utils/Pathfinding';
import Tile from './Tile';

const mapSize = 50;
const terrainTypes = ['water', 'grass', 'mountain', 'forest', 'desert'] as const;

const generateMap = () => {
  return Array.from({ length: mapSize }, () =>
    Array.from({ length: mapSize }, () =>
      terrainTypes[Math.floor(Math.random() * terrainTypes.length)]
    )
  );
};

const initialMap = generateMap();

const Map = () => {
  const [personPosition, setPersonPosition] = useState({ row: Math.floor(mapSize / 2), col: Math.floor(mapSize / 2) }); // Posición inicial
  const [path, setPath] = useState<{ row: number; col: number }[]>([]); // Camino calculado
  const [discoveredTiles, setDiscoveredTiles] = useState<boolean[][]>(
    Array.from({ length: mapSize }, () => Array(mapSize).fill(false))
  ); // Tiles descubiertos

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Descubrir los tiles alrededor del personaje
  const discoverTiles = (row: number, col: number) => {
    const newDiscoveredTiles = [...discoveredTiles];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < mapSize && newCol >= 0 && newCol < mapSize) {
          newDiscoveredTiles[newRow][newCol] = true;
        }
      }
    }
    setDiscoveredTiles(newDiscoveredTiles);
  };

  useEffect(() => {
    discoverTiles(personPosition.row, personPosition.col); // Descubrir tiles al inicio
  }, [personPosition]);

  const handleTileClick = (row: number, col: number) => {
    if (!discoveredTiles[row][col]) return; // No permitir movimiento a tiles no descubiertos

    const shortestPath = findShortestPath(initialMap, personPosition, { row, col }, discoveredTiles);
    setPath(shortestPath); // Guardar el camino calculado
  };

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Esto bloquea el menú contextual
  });

  useEffect(() => {
    if (path.length > 0) {
      const [nextStep, ...remainingPath] = path;

      const timeout = setTimeout(() => {
        setPersonPosition(nextStep);
        setPath(remainingPath);
      }, 100); // Tiempo entre pasos (300ms)

      return () => clearTimeout(timeout);
    }
  }, [path]);

  return (
    <div className="map-wrapper">
      <div className="map-grid">
        {initialMap.map((row, rowIndex) =>
          row.map((tileType, colIndex) => (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              tileType={tileType}
              isDiscovered={discoveredTiles[rowIndex][colIndex]}
              onClick={() => handleTileClick(rowIndex, colIndex)}
            >
              {personPosition.row === rowIndex && personPosition.col === colIndex && (
                <div className="person" />
              )}
            </Tile>
          ))
        )}
      </div>
    </div>
  );
};

export default Map;