import React from 'react';
import { TileProps } from '../../types';
import { TILE_TYPES } from '../../utils/Constants';

// Cambia la definición para aceptar className extra
interface Tile2Props extends TileProps {
  className?: string;
}

const Tile2: React.FC<Tile2Props> = ({
  row,
  col,
  tileType,
  isDiscovered,
  fogStatus,
  onClick,
  children,
  className: extraClassName, // <-- aquí
}) => {
  const tile = TILE_TYPES[tileType];
  let className = `map-tile ${tileType}`;
  let showCost = false;
  let style: React.CSSProperties = { position: 'relative' };

  if (fogStatus === 'undiscovered') {
    style.background = '#222';
    className += ' fog-undiscovered';
  } else {
    style.backgroundImage = `url(${tile.image})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    className += ' fog-visible';

    if (tile.requiresBoat) {
      className += ' requires-boat';
    }

    showCost = true;
  }

  // Añade la clase extra si existe
  if (extraClassName) {
    className += ` ${extraClassName}`;
  }

  return (
    <div className={className} style={style} onClick={onClick}>
      {showCost && <span className="movement-cost">{tile.movementCost}</span>}
      {children}
    </div>
  );
};

export default Tile2;