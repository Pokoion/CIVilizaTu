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
  let className = `map-tile ${tileType}`;
  let showCost = false;
  let style: React.CSSProperties = { position: 'relative' };

  if (fogStatus === 'undiscovered') {
    style.background = '#222'; // Fondo negro, sin imagen
    className += ' fog-undiscovered';
  } else {
    style.backgroundImage = `url(${tile.image})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    if (fogStatus === 'fog') {
      className += ' fog-fog';
      showCost = false;
    } else if (fogStatus === 'visible') {
      className += ' fog-visible';
      showCost = true;
    }
  }

  return (
    <div className={className} style={style} onClick={onClick}>
      {showCost && <span className="movement-cost">{tile.movementCost}</span>}
      {children}
    </div>
  );
};

export default Tile2;