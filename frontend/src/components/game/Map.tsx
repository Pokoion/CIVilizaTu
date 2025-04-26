import React, { useState, useEffect } from 'react';
import '../../styles/Map.css';
import { findShortestPath } from '../../utils/Pathfinding';

const mapSize = 50;
const terrainTypes = [0, 1, 2];

const generateMap = () => {
  return Array.from({ length: mapSize }, () =>
    Array.from({ length: mapSize }, () =>
      terrainTypes[Math.floor(Math.random() * terrainTypes.length)]
    )
  );
};

const initialMap = generateMap();

const getTileColor = (tile: number) => {
  switch (tile) {
    case 0:
      return 'rgb(89, 201, 238)';
    case 1:
      return 'lightgreen';
    case 2:
      return 'gray';
    default:
      return 'rgb(89, 201, 238)';
  }
};

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

  useEffect(() => {
    if (path.length > 0) {
      const [nextStep, ...remainingPath] = path;

      const timeout = setTimeout(() => {
        setPersonPosition(nextStep);
        setPath(remainingPath);
      }, 300); // Tiempo entre pasos (300ms)

      return () => clearTimeout(timeout);
    }
  }, [path]);

  return (
    <div className="map-wrapper">
      <div className="map-grid">
        {initialMap.map((row, rowIndex) =>
          row.map((tile, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`map-tile ${discoveredTiles[rowIndex][colIndex] ? '' : 'fog'}`} // Añadir clase 'fog' si no está descubierto
              style={{
                backgroundColor: getTileColor(tile),
                position: 'relative',
              }}
              onClick={() => handleTileClick(rowIndex, colIndex)} // Detectar clic en el tile
            >
              {personPosition.row === rowIndex && personPosition.col === colIndex && (
                <div className="person" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Map;