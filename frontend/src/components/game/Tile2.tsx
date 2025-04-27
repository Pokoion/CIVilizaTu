import React from 'react';
import { TILE_TYPES } from '../../utils/Constants';

interface TileProps {
  row: number;
  col: number;
  tileType: keyof typeof TILE_TYPES;
  isDiscovered: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const Tile: React.FC<TileProps> = ({ row, col, tileType, isDiscovered, onClick, children }) => {
  const tile = TILE_TYPES[tileType];

  return (
    <div
      className={`map-tile ${isDiscovered ? '' : 'fog'}`}
      style={{
        backgroundColor: isDiscovered ? tile.color : 'black',
        position: 'relative',
      }}
      onClick={onClick}
    >
      {isDiscovered && <span className="movement-cost">{tile.movementCost}</span>}
      {children}
    </div>
  );
};

export default Tile;