import React from 'react';

// Definir los tipos de tile y sus propiedades
const tileTypes = {
  water: { color: 'rgb(89, 201, 238)', movementCost: Infinity }, // Inaccesible
  grass: { color: 'lightgreen', movementCost: 1 },
  mountain: { color: 'gray', movementCost: 3 },
  forest: { color: 'darkgreen', movementCost: 2 },
  desert: { color: 'goldenrod', movementCost: 2 },
};

interface TileProps {
  row: number;
  col: number;
  tileType: keyof typeof tileTypes;
  isDiscovered: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const Tile: React.FC<TileProps> = ({ row, col, tileType, isDiscovered, onClick, children }) => {
  const tile = tileTypes[tileType]; // Obtener las propiedades del tipo de tile

  return (
    <div
      className={`map-tile ${isDiscovered ? '' : 'fog'}`}
      style={{
        backgroundColor: isDiscovered ? tile.color : 'black',
        position: 'relative',
      }}
      onClick={onClick}
    >
      {isDiscovered && <span className="movement-cost">{tile.movementCost}</span>} {/* Mostrar el coste de movimiento */}
      {children}
    </div>
  );
};

export default Tile;