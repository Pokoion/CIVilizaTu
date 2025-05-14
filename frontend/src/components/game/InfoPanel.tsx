import React, { useState, useEffect, useRef } from 'react';
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
  onAttackEnemy?: (attacker: any, defender: any, mode: 'full' | 'single') => void;
  onFoundCity?: (kolono: any) => void;
  selectedVisibleObject?: { type: string; position: { x: number; y: number } } | null;
  setSelectedVisibleObject?: (obj: { type: string; position: { x: number; y: number } } | null) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedUnit: selectedUnitProp,
  selectedTile,
  selectedCity,
  selectedEnemyUnit,
  onEnterCity,
  onAttackEnemy,
  onFoundCity,
  selectedVisibleObject,
  setSelectedVisibleObject,
}) => {
  const {
    setResources,
    setVisibleObjects,
    setUnits,
    units,
    setCities,
    unlockedTechs,
    gameManager,
    setSelectedUnitId,
    selectedUnitId,
    checkVictoryOrDefeat,
    currentSide
  } = useGame();

  // Usar la unidad del estado global en lugar de las props
  const selectedUnit = selectedUnitId ? units.find(u => u.id === selectedUnitId) || selectedUnitProp : selectedUnitProp;

  // Usar useRef para mantener el estado aunque cambie la referencia de selectedUnit
  const showCityBattleRef = useRef(false);
  const [showCityBattle, setShowCityBattle] = useState(false);

  // Mantener showCityBattle aunque cambie la referencia de selectedUnit/selectedCity
  useEffect(() => {
    if (!selectedUnit || !selectedCity) {
      setShowCityBattle(false);
      showCityBattleRef.current = false;
    }
  }, [selectedUnit, selectedCity]);

  // --- NUEVO: Solo permitir acciones si es turno del jugador ---
  const isPlayerTurn = currentSide === 'player';

  if (!isPlayerTurn) {
    return <div />; // Panel vacío
  }

  // Mostrar información de objeto visible seleccionado
  if (selectedVisibleObject) {
    const objInfo = VISIBLE_OBJECTS_BY_ID[selectedVisibleObject.type];
    if (!objInfo) return null;

    const isAdjacent = (unit: UnitProps, obj: { position: { x: number; y: number } }) => {
      const dx = Math.abs(unit.position.x - obj.position.x);
      const dy = Math.abs(unit.position.y - obj.position.y);
      return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
    };
    const hasNekazaritza = unlockedTechs?.includes('nekazaritza') || false;

    const puedeRecolectar =
      isPlayerTurn &&
      selectedUnit &&
      selectedUnit.type === 'langile' && hasNekazaritza &&
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
              setResources(prev => {
                const updated = { ...prev };
                (Object.entries(objInfo.bonus || {}) as [keyof typeof updated, number][]).forEach(([k, v]) => {
                  if (k in updated) updated[k] += v;
                });
                return updated;
              });

              setVisibleObjects(prev => prev.filter(
                obj => !(obj.type === selectedVisibleObject.type &&
                  obj.position.x === selectedVisibleObject.position.x &&
                  obj.position.y === selectedVisibleObject.position.y)
              ));

              if (selectedUnit) {
                const unitId = selectedUnit.id;
                setUnits(prev =>
                  prev.map(u =>
                    u.id === unitId
                      ? { ...u, movement_points_left: 0 }
                      : u
                  )
                );
                const unitInGameManager = gameManager.getMapManager().getUnits().find(u => u.id === unitId);
                if (unitInGameManager) {
                  unitInGameManager.movement_points_left = 0;
                }
                setSelectedUnitId(null);
                setTimeout(() => {
                  setSelectedUnitId(unitId);
                }, 50);
              }

              setSelectedVisibleObject && setSelectedVisibleObject(null);
            }}
          >
            Jaso
          </button>
        )}
      </div>
    );
  }

  // Prioridad: ataque a unidad enemiga
  if (selectedUnit && selectedEnemyUnit) {
    const dx = Math.abs(selectedUnit.position.x - selectedEnemyUnit.position.x);
    const dy = Math.abs(selectedUnit.position.y - selectedEnemyUnit.position.y);
    const distance = Math.max(dx, dy); // Chebyshev distance

    const attackerRange = selectedUnit.range ?? 1;
    const defenderRange = selectedEnemyUnit.range ?? 1;

    const inAttackerRange = distance <= attackerRange;
    const inDefenderRange = distance <= defenderRange;

    const puedeAtacarUnidad =
      isPlayerTurn &&
      inAttackerRange &&
      !selectedUnit.hasAttackedThisTurn &&
      selectedUnit.movement_points_left > 0;

    return (
      <div>
        <h3>Etsaia erasotu</h3>
        <p>Erasotzailea: {selectedUnit.type}</p>
        <p>Etsaia: {selectedEnemyUnit.type}</p>
        <div style={{ textAlign: 'right' }}>
          {puedeAtacarUnidad ? (
            <button
              onClick={() => {
                if (onAttackEnemy) {
                  // Marcar la unidad como que ha atacado y sin movimientos
                  setUnits &&
                    setUnits(prev =>
                      prev.map(u =>
                        u.id === selectedUnit.id
                          ? {
                            ...u,
                            hasAttackedThisTurn: true,
                            movement_points_left: 0,
                          }
                          : u
                      )
                    );
                  onAttackEnemy(
                    selectedUnit,
                    selectedEnemyUnit,
                    inDefenderRange ? 'full' : 'single'
                  );
                }
              }}
            >
              Etsaia erasotu
            </button>
          ) : (
            <span>
              {!isPlayerTurn
                ? 'Ez da zure txanda'
                : selectedUnit.hasAttackedThisTurn || selectedUnit.movement_points_left === 0
                  ? 'Ezin du gehiago eraso egin edo mugitu'
                  : 'Ez dago eraso distantzian'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Mostrar información de la ciudad seleccionada
  if (selectedCity) {
    const isEnemyCity = selectedCity.owner === 'ai';

    const isInRange = (unit: UnitProps, city: CityProps) => {
      const dx = Math.abs(unit.position.x - city.position.x);
      const dy = Math.abs(unit.position.y - city.position.y);
      const distance = Math.max(dx, dy); // Chebyshev distance
      return distance <= (unit.range ?? 1);
    };

    const puedeAtacarCiudad =
      isPlayerTurn &&
      selectedUnit &&
      selectedUnit.owner === 'player' &&
      isEnemyCity &&
      isInRange(selectedUnit, selectedCity) &&
      !selectedUnit?.hasAttackedCityThisTurn &&
      selectedUnit.movement_points_left > 0;

    const handleAtacarCiudad = () => {
      // Marcar la unidad como que ha atacado a ciudad y sin movimientos
      setUnits &&
        setUnits(prev =>
          prev.map(u =>
            u.id === selectedUnit?.id
              ? {
                ...u,
                hasAttackedCityThisTurn: true,
                hasAttackedThisTurn: true,
                movement_points_left: 0,
              }
              : u
          )
        );
      setShowCityBattle(true);
      showCityBattleRef.current = true;
    };

    const onCityBattleEnd = (finalDefense: number, finalHealth: number) => {
      setShowCityBattle(false);
      showCityBattleRef.current = false;

      setCities &&
        setCities(prev =>
          prev
            .map(city =>
              city.id === selectedCity.id
                ? { ...city, defense: finalDefense, health: finalHealth }
                : city
            )
            .filter(city =>
              !(city.id === selectedCity.id && finalHealth <= 0)
            )
        );
      checkVictoryOrDefeat();
    };

    // FORZAR el render de CityBattleView si showCityBattleRef o showCityBattle es true
    if ((showCityBattleRef.current || showCityBattle) && selectedUnit && selectedCity) {
      return (
        <CityBattleView
          attacker={selectedUnit}
          city={selectedCity}
          onClose={onCityBattleEnd}
        />
      );
    }

    return (
      <div>
        <h3>Hiria</h3>
        <p>Izena: {selectedCity.name}</p>
        <p>Populazioa: {selectedCity.population} </p>
        <p>Defentsa: {selectedCity.defense}</p>
        <p>Osasuna: {selectedCity.health}</p>
        <div style={{ textAlign: 'right' }}>
          {puedeAtacarCiudad ? (
            <button onClick={handleAtacarCiudad}>
              Hiria erasotu
            </button>
          ) : (
            !isEnemyCity && isPlayerTurn && (
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
        <p>Mota: {selectedUnit.type} - {selectedUnit.id}</p>
        <p>Mugimendu Puntuak: {selectedUnit.movement_points_left}/{selectedUnit.movement_points}</p>
        <p>Osasuna: {selectedUnit.health}</p>
        <p>Indarra: {selectedUnit.strength}</p>
        <p>Rangoa: {selectedUnit.range ?? 1}</p>
        {selectedUnit.type === 'kolono' && isPlayerTurn && (
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

  return <div>Egin ezazu klik unitate edo lurralde batean informazioa ikusteko.</div>;
};

export default InfoPanel;