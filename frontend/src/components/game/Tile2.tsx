import React from 'react';
import { TileProps } from '../../types';
import { TILE_TYPES } from '../../utils/Constants';

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