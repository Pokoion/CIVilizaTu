import React, { useState } from 'react';
import { UnitProps, TerrainType, CityProps } from '../../types';
import { TILE_TYPES, VISIBLE_OBJECTS_BY_ID } from '../../utils/Constants';
import { useGame } from '../../context/GameContext';
import BattleView from './BattleView';
import CityBattleView from './CityBattleView';

export interface InfoPanelProps {
  selectedUnit?: UnitProps | null;
  selectedEnemyUnit?: UnitProps | null;
  selectedTile?: { row: number; col: number; type: TerrainType; isDiscovered?: boolean } | null;
  selectedCity?: CityProps | null;
  onEnterCity?: (city: any) => void;
  onAttackEnemy?: (attacker: any, defender: any) => void;
  onFoundCity?: (kolono: any) => void;
  selectedVisibleObject?: { type: string; position: { x: number; y: number } } | null;
  setSelectedVisibleObject?: (obj: { type: string; position: { x: number; y: number } } | null) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedUnit,
  selectedTile,
  selectedCity,
  selectedEnemyUnit,
  onEnterCity,
  onAttackEnemy,
  onFoundCity,
  selectedVisibleObject,
  setSelectedVisibleObject,
}) => {
  const { setResources, setVisibleObjects, setUnits, units, setCities } = useGame();
  const [showCityBattle, setShowCityBattle] = useState(false);

  // PRIORIDAD: Mostrar información del objeto visible seleccionado
  if (selectedVisibleObject) {
    const objInfo = VISIBLE_OBJECTS_BY_ID[selectedVisibleObject.type];
    if (!objInfo) return null;

    // Solo mostrar botón si hay unidad seleccionada y está adyacente y es langile
    const isAdjacent = (unit: UnitProps, obj: { position: { x: number; y: number } }) => {
      const dx = Math.abs(unit.position.x - obj.position.x);
      const dy = Math.abs(unit.position.y - obj.position.y);
      return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
    };
    const puedeRecolectar =
      selectedUnit &&
      selectedUnit.type === 'langile' &&
      isAdjacent(selectedUnit, selectedVisibleObject);

    return (
      <div className="visible-object-info-panel">
        <h3>{objInfo.name}</h3>
        <img
          src={`/images/visibleObjects/${objInfo.name}.png`}
          alt={objInfo.name}
          style={{ width: 80, height: 80, margin: '8px auto', display: 'block' }}
        />
        <div>
          {Object.entries(objInfo.bonus || {}).map(([k, v]) => (
            <div key={k}>{k}: {v}</div>
          ))}
        </div>
        {puedeRecolectar && (
          <button
            style={{ marginTop: 12 }}
            onClick={() => {
              // Suma bonus
              setResources(prev => {
                const updated = { ...prev };
                (Object.entries(objInfo.bonus || {}) as [keyof typeof updated, number][]).forEach(([k, v]) => {
                  if (k in updated) updated[k] += v;
                });
                return updated;
              });
              // Quita el recurso del mapa
              setVisibleObjects(prev => prev.filter(
                obj => !(obj.type === selectedVisibleObject.type &&
                  obj.position.x === selectedVisibleObject.position.x &&
                  obj.position.y === selectedVisibleObject.position.y)
              ));
              // Pone los movimientos de la unidad seleccionada a 0
              if (selectedUnit) {
                setUnits(prev =>
                  prev.map(u =>
                    u.id === selectedUnit.id
                      ? { ...u, movement_points_left: 0 }
                      : u
                  )
                );
              }
              setSelectedVisibleObject && setSelectedVisibleObject(null);
            }}
          >
            Recolectar
          </button>
        )}
      </div>
    );
  }

  // Priorizar el caso de ataque enemigo
  if (selectedUnit && selectedEnemyUnit) {
    return (
      <div>
        <h3>Atakar enemigo</h3>
        <p>Atacante: {selectedUnit.type} - {selectedUnit.id}</p>
        <p>Enemigo: {selectedEnemyUnit.type} - {selectedEnemyUnit.id}</p>
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => onAttackEnemy && onAttackEnemy(selectedUnit, selectedEnemyUnit)}>
            Atakar enemigo
          </button>
        </div>
      </div>
    );
  }

  // Mostrar información de la ciudad seleccionada
  if (selectedCity) {
    const isEnemyCity = selectedCity.owner === 'ai';

    // Detectar si hay una unidad militar adyacente a la ciudad enemiga
    const isAdjacent = (unit: UnitProps, city: CityProps) => {
      const dx = Math.abs(unit.position.x - city.position.x);
      const dy = Math.abs(unit.position.y - city.position.y);
      return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
    };

    // Solo puede atacar si no ha atacado ya este turno
    const puedeAtacarCiudad =
      selectedUnit &&
      selectedUnit.owner === 'player' &&
      isEnemyCity &&
      isAdjacent(selectedUnit, selectedCity) &&
      !selectedUnit?.hasAttackedCityThisTurn;

    // Lógica de ataque: primero defensa, luego vida y elimina ciudad si health <= 0
    const handleAtacarCiudad = () => {
      setShowCityBattle(true);
    };

    // Nuevo onCityBattleEnd que recibe la defensa y vida final de la ciudad
    const onCityBattleEnd = (finalDefense: number, finalHealth: number) => {
      setShowCityBattle(false);

      setCities &&
        setCities(prev =>
          prev
            .map(city =>
              city.id === selectedCity.id
                ? { ...city, defense: finalDefense, health: finalHealth }
                : city
            )
            .filter(city =>
              // Si la ciudad atacada tiene vida 0, la eliminamos
              !(city.id === selectedCity.id && finalHealth <= 0)
            )
        );

      // Marca la unidad como que ya ha atacado a ciudad este turno
      setUnits &&
        setUnits(prev =>
          prev.map(u =>
            u.id === selectedUnit?.id
              ? { ...u, hasAttackedCityThisTurn: true }
              : u
          )
        );
    };

    return (
      <div>
        <h3>Hiria</h3>
        <p>Izena: {selectedCity.name}</p>
        <p>Populazioa: {selectedCity.population} </p>
        <p>Defentsa: {selectedCity.defense}</p>
        <p>Osasuna: {selectedCity.health}</p>
        <div style={{ textAlign: 'right' }}>
          {puedeAtacarCiudad ? (
            <>
              <button onClick={handleAtacarCiudad}>
                Hiria erasotu
              </button>
              {showCityBattle && (
                <CityBattleView
                  attacker={selectedUnit}
                  city={selectedCity}
                  onClose={onCityBattleEnd}
                />
              )}
            </>
          ) : (
            !isEnemyCity && (
              <button onClick={() => onEnterCity && onEnterCity(selectedCity)}>
                Sartu hirian
              </button>
            )
          )}
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
              Hiria sortu
            </button>
          </div>
        )}
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