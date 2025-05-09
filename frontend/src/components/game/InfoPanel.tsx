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
  onFoundCity?: (unit: UnitProps) => void;
};

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedUnit,
  selectedTile,
  selectedCity,
  selectedEnemyUnit,
  onEnterCity,
  onAttackEnemy,
  onFoundCity,
}) => {
  console.log('Selected unit InfoPanel:', selectedUnit);
  console.log('Selected enemy unit InfoPanel:', selectedEnemyUnit);

  // Priorizar el caso de ataque enemigo
  if (selectedUnit && selectedEnemyUnit) {
    console.log('Mostrando botón de atacar enemigo');
    return (
      <div>
        <h3>Atacar enemigo</h3>
        <p>Atacante: {selectedUnit.type} - {selectedUnit.id}</p>
        <p>Enemigo: {selectedEnemyUnit.type} - {selectedEnemyUnit.id}</p>
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => onAttackEnemy && onAttackEnemy(selectedUnit, selectedEnemyUnit)}>
            Atacar enemigo
          </button>
        </div>
      </div>
    );
  }

  // Mostrar información de la unidad seleccionada
  if (selectedUnit) {
    return (
      <div>
        <h3>Unitatea</h3>
        <p>Nombre: {selectedUnit.type} - {selectedUnit.id}</p>
        <p>Movimiento: {selectedUnit.movement_points_left}/{selectedUnit.movement_points}</p>
        {selectedUnit.type === 'kolono' && (
          <div style={{ textAlign: 'right' }}>
            <button onClick={() => onFoundCity && onFoundCity(selectedUnit)}>
              Fundar Ciudad
            </button>
          </div>
        )}
      </div>
    );
  }

  // Mostrar información de la ciudad seleccionada
  if (selectedCity) {
    return (
      <div>
        <h3>Hiria</h3>
        <p>Izena: {selectedCity.name}</p>
        <p>Populazioa: {selectedCity.population} </p>
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => onEnterCity && onEnterCity(selectedCity)}>
            Sartu hirian
          </button>
        </div>
      </div>
    );
  }

  // Mostrar información del tile seleccionado
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
      </div>
    );
  }

  // Mensaje por defecto
  return <div>Egin ezazu klik unitate edo lurralde batean informazioa ikusteko.</div>;
};

export default InfoPanel;