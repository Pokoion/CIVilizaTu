import React, { useState } from 'react';
import '../../styles/BarracksView.css';
import { UNITS } from '../../utils/Constants';
import { TrainingUnit } from '../../types';
import { useGame } from '../../context/GameContext';
import { asset } from '../../utils/asset';

interface BarracksViewProps {
  onClose: () => void;
  barracksCount: number;
  civilization: string;
  unlockedTechs: string[];
  cityId: string;
}

const UNITS_VISIBLE = 3;
const DEFAULT_TRAIN_TURNS = 3;

// Mapeo para imágenes de recursos
const RESOURCE_IMAGE_MAP: Record<string, string> = {
  food: "janaria.png",
  gold: "urrea.png"
};

const BarracksView: React.FC<BarracksViewProps> = ({
  onClose,
  barracksCount,
  civilization,
  unlockedTechs,
  cityId,
}) => {
  const { resources, setResources, cities, setCities, setSelectedCity, setDeployingUnit } = useGame();

  // Hooks siempre al principio
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);

  // city nunca debe ser undefined aquí, si lo es, no renderizamos nada
  const city = cities.find(c => c.id === cityId);
  if (!city) return null;

  const availableUnits = UNITS.filter(
    (unit: any) => {
      // Unidades exclusivas por tecnología
      if (unit.id === "arkeroa" && !unlockedTechs.includes("arku_tiroa")) return false;
      if (unit.id === "tankea" && !unlockedTechs.includes("artilleria")) return false;
      if (unit.id === "itsasontzia" && !unlockedTechs.includes("nabigazioa")) return false;
      // Unidades normales
      return unit.civilization === null || unit.civilization === civilization;
    }
  );

  const trainingQueue = city.training;

  const handleTrainUnit = (unit: any) => {
    if (trainingQueue.length >= barracksCount) return;

    // Comprobar si hay recursos suficientes
    if (unit.cost) {
      if (
        (unit.cost.food !== undefined && resources.food < unit.cost.food) ||
        (unit.cost.gold !== undefined && resources.gold < unit.cost.gold)
      ) {
        alert('Ez daukazu nahikoa baliabide unitate hau entrenatzeko!');
        return;
      }
    }

    // Restar recursos
    setResources(prev => ({
      ...prev,
      food: prev.food - (unit.cost?.food || 0),
      gold: prev.gold - (unit.cost?.gold || 0),
    }));

    // Bonus de arkitektura
    const hasArkitektura = unlockedTechs.includes("arkitektura");
    const baseTrainTurns = unit.trainTurns ?? DEFAULT_TRAIN_TURNS;
    const trainTurns = Math.max(1, baseTrainTurns - (hasArkitektura ? 1 : 0));

    // Añadir a la cola de entrenamiento de la ciudad correspondiente en el contexto
    setCities(prev =>
      prev.map(c =>
        c.id === cityId
          ? {
            ...c,
            training: [
              ...c.training,
              {
                id: `${unit.id}-${Date.now()}`,
                type: unit.id,
                name: unit.name,
                turnsLeft: trainTurns,
              },
            ],
          }
          : c
      )
    );
  };

  const handleNextUnit = () => {
    setSelectedUnitIndex((prev) =>
      availableUnits.length === 0 ? 0 : (prev + 1) % availableUnits.length
    );
  };

  const handlePreviousUnit = () => {
    setSelectedUnitIndex((prev) =>
      availableUnits.length === 0
        ? 0
        : (prev - 1 + availableUnits.length) % availableUnits.length
    );
  };

  // Eliminar de la cola y marcar como lista para desplegar (simulado)
  const handleDeployUnit = (unitId: string) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    const trainingUnit = city.training.find((item: TrainingUnit) => item.id === unitId);
    if (!trainingUnit) return;

    // Marca la unidad para desplegar
    setDeployingUnit({ unit: trainingUnit, city });

    // Elimina de la cola de entrenamiento
    setCities(prev =>
      prev.map(city =>
        city.id === cityId
          ? {
            ...city,
            training: city.training.filter((item: TrainingUnit) => item.id !== unitId),
          }
          : city
      )
    );

    // Cierra BarracksView y CityView
    onClose();
    setSelectedCity(null); // Esto cierra CityView también
  };

  // Mostrar varias unidades a la vez (ventana deslizante)
  let visibleUnits: typeof availableUnits = [];
  if (availableUnits.length > 0) {
    for (let i = 0; i < Math.min(UNITS_VISIBLE, availableUnits.length); i++) {
      const idx = (selectedUnitIndex - 1 + i + availableUnits.length) % availableUnits.length;
      visibleUnits.push(availableUnits[idx]);
    }
  }

  const hasPenizilina = unlockedTechs.includes("penizilina");
  const hasBurdina = unlockedTechs.includes("burdina");
  const hasArtilleria = unlockedTechs.includes("artilleria");
  const hasArkitektura = unlockedTechs.includes("arkitektura");

  return (
    <div className="barracks-view-overlay">
      <div className="barracks-view-content">
        <button className="barracks-view-close-btn" onClick={onClose}>X</button>
        <h2 className="barracks-title">Kuartela</h2>
        <p>Entrenatzeko unitateak:</p>

        <div className="barracks-units-list" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', gap: 16 }}>
          <button
            className="nav-btn-circle"
            onClick={handlePreviousUnit}
            disabled={availableUnits.length < 2}
            style={{ fontSize: 24, padding: '0 12px', height: 48 }}
          >
            ◀
          </button>
          {visibleUnits.map((unit) => {
            const health = (unit.health ?? 100) + (hasPenizilina ? 30 : 0);
            const strength = (unit.strength ?? 0) + (hasBurdina ? 5 : 0) + (hasArtilleria ? 10 : 0);
            const hasGurpila = unlockedTechs.includes("gurpila");
            const movementPoints = (unit.movementPoints ?? 1) + (hasGurpila ? 3 : 0);
            const hasArkitektura = unlockedTechs.includes("arkitektura");
            const hasIndustria = unlockedTechs.includes("industria");
            let trainTurns = unit.training_time ?? DEFAULT_TRAIN_TURNS;
            if (hasArkitektura) trainTurns = Math.max(1, trainTurns - 1);
            if (hasIndustria) trainTurns = Math.max(1, trainTurns - 1);

            return (
              <div key={unit.id} className="barracks-unit-card">
                <img src={asset(`/images/units/${unit.type}/${unit.type}-default.png`)} alt={unit.type} className="barracks-unit-img" />
                <div className="barracks-unit-stats" style={{ fontSize: '0.97em', color: '#444', margin: '8px 0 4px 0' }}>
                  <div>⚔️ <strong>{unit.type}</strong></div>
                  <div>❤️ <strong>{health}</strong></div>
                  <div>🗡️ <strong>{strength}</strong></div>
                  <div>🏃 <strong>{movementPoints}</strong></div>
                  <div>🎯 <strong>{unit.range}</strong></div>
                </div>
                <div className="barracks-unit-cost" style={{ fontSize: '0.95em', color: '#666', margin: '4px 0 2px 0' }}>
                  <strong>
                    {unit.cost && (
                      <>
                        {unit.cost.food !== undefined && (
                          <>
                            <img
                              src={asset(`/images/resources/${RESOURCE_IMAGE_MAP.food}`)}
                              alt="Janaria"
                              style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 2 }}
                            />{" "}
                            {unit.cost.food}{" "}
                          </>
                        )}
                        {unit.cost.gold !== undefined && (
                          <>
                            <img
                              src={asset(`/images/resources/${RESOURCE_IMAGE_MAP.gold}`)}
                              alt="Urrea"
                              style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 2 }}
                            />{" "}
                            {unit.cost.gold}
                          </>
                        )}
                      </>
                    )}
                  </strong>
                </div>
                <div className="barracks-unit-turns">Entrenatzeko txandak: {trainTurns}</div>
                <button
                  className="train-unit-btn"
                  disabled={trainingQueue.length >= barracksCount}
                  onClick={() => handleTrainUnit(unit)}
                >
                  Entrenatu
                </button>
              </div>
            );
          })}
          <button
            className="nav-btn-circle"
            onClick={handleNextUnit}
            disabled={availableUnits.length < 2}
            style={{ fontSize: 24, padding: '0 12px', height: 48 }}
          >
            ▶
          </button>
        </div>

        <h3 className="barracks-queue-title">Entrenamendu ilara ({trainingQueue.length}/{barracksCount})</h3>
        <ul className="barracks-queue-list">
          {trainingQueue.map((item) => {
            // Busca la unidad en UNITS, no solo en availableUnits
            const unit = UNITS.find((u: any) => u.id === item.type);
            if (!unit) return null;
            return (
              <li key={item.id} className="barracks-queue-item">
                <div className="barracks-queue-info">
                  <img src={asset(`/images/units/${unit.type}/${unit.type}-default.png`)} alt={unit.id} className="barracks-queue-img" />
                  <span><strong>{unit.id}</strong></span>
                  <span>
                    {item.turnsLeft > 0 ? (
                      <span>Falta diren txandak: {item.turnsLeft}</span>
                    ) : (
                      <span className="barracks-ready">Ateratzeko prest!</span>
                    )}
                  </span>
                </div>
                {item.turnsLeft === 0 && (
                  <button className="train-unit-btn" onClick={() => handleDeployUnit(item.id)}>
                    Mapan jarri
                  </button>
                )}
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
};

export default BarracksView;