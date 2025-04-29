import React from 'react';
import { TileProps } from '../../types';
import { TILE_TYPES } from '../../utils/Constants';

const Tile2: React.FC<TileProps> = ({
  row,
  col,
  tileType,
  isDiscovered,
  fogStatus,
  onClick,
  children,
}) => {
  const tile = TILE_TYPES[tileType];

  let backgroundColor = tile.color;
  let className = 'map-tile';
  let showCost = false;

  if (fogStatus === 'undiscovered') {
    backgroundColor = '#222';
    className += ' fog-undiscovered';
  } else if (fogStatus === 'fog') {
    backgroundColor = tile.color;
    className += ' fog-fog';
    showCost = false;
  } else if (fogStatus === 'visible') {
    className += ' fog-visible';
    showCost = true;
  }

  return (
    <div
      className={className}
      style={{
        backgroundColor,
        position: 'relative',
      }}
      onClick={onClick}
    >
      {showCost && <span className="movement-cost">{tile.movementCost}</span>}
      {children}
    </div>
  );
};

export default Tile2;