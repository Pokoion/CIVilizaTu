import React from 'react';
import { UnitProps, TerrainType, CityProps } from '../../types';
import { TILE_TYPES } from '../../utils/Constants';

type InfoPanelProps = {
  selectedUnit: UnitProps | null;
  selectedTile: { row: number; col: number; type: TerrainType; isDiscovered?: boolean } | null;
  selectedCity: CityProps | null;
  selectedEnemyUnit: UnitProps | null;
  onEnterCity?: (city: CityProps) => void;
  onAttackEnemy?: (attacker: UnitProps, defender: UnitProps) => void;
};

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedUnit,
  selectedTile,
  selectedCity,
  selectedEnemyUnit,
  onEnterCity,
  onAttackEnemy,
}) => {
  if (selectedUnit && selectedEnemyUnit) {
    return (
      <div>
        <h3>Enemigo</h3>
        <p>Tipo: {selectedEnemyUnit.type}</p>
        <p>Vida: {selectedEnemyUnit.health}</p>
        <p>Fuerza: {selectedEnemyUnit.strength}</p>
        <button
          onClick={() => onAttackEnemy && onAttackEnemy(selectedUnit, selectedEnemyUnit)}
        >
          Atacar
        </button>
      </div>
    );
  }
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
  if (selectedCity) {
    return (
      <div>
        <h3>Hiria</h3>
        <p>Izena: {selectedCity.name}</p>
        <p>Populazioa: {selectedCity.population} </p>
        <button onClick={() => onEnterCity && onEnterCity(selectedCity)}>
          Sartu hirian
        </button>
      </div>
    );
  }
  if (selectedTile) {
    if (!selectedTile.isDiscovered) {
      return (
        <div>
          <h3>Lurraldea</h3>
          <p>Ezagutu gabea</p>
        </div>
      );
    }
    return (
      <div>
        <h3>Lurraldea</h3>
        <p>Mota: {selectedTile.type}</p>
        <p>Mugimendu kostua: {TILE_TYPES[selectedTile.type].movementCost}</p>
        {/* Más info del tile */}
      </div>
    );
  }
  return <div>Egin ezazu klik unitate edo lurralde batean informazioa ikusteko.</div>;
};

export default InfoPanel;