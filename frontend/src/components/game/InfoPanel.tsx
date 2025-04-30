import React from 'react';
import { UnitProps, TerrainType } from '../../types';
import { TILE_TYPES } from '../../utils/Constants';

type InfoPanelProps = {
  selectedUnit: UnitProps | null;
  selectedTile: { row: number; col: number; type: TerrainType; isDiscovered?: boolean } | null;
};

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedUnit, selectedTile }) => {
  if (selectedUnit) {
    return (
      <div>
        <h3>Unidad</h3>
        <p>Nombre: {selectedUnit.type} - {selectedUnit.id}</p>
        <p>Movimiento: {selectedUnit.movement_points_left}/{selectedUnit.movement_points}</p>
        {/* Más info de la unidad */}
      </div>
    );
  }
  if (selectedTile) {
    if (!selectedTile.isDiscovered) {
      return (
        <div>
          <h3>Tile</h3>
          <p>Sin descubrir</p>
        </div>
      );
    }
    return (
      <div>
        <h3>Tile</h3>
        <p>Tipo: {selectedTile.type}</p>
        <p>Costo de movimiento: {TILE_TYPES[selectedTile.type].movementCost}</p>
        {/* Más info del tile */}
      </div>
    );
  }
  return <div>Haz click en una unidad o tile para ver información.</div>;
};

export default InfoPanel;