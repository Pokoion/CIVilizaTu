import React from 'react';
import '../../styles/BarracksView.css';

interface BarracksViewProps {
  onClose: () => void;
  barracksName: string;
}

const BarracksView: React.FC<BarracksViewProps> = ({ onClose, barracksName }) => {
  const availableUnits = [
    { id: 'infantry', name: 'Infantería', description: 'Unidad básica de combate cuerpo a cuerpo.', cost: 100 },
    { id: 'archer', name: 'Arquero', description: 'Unidad de combate a distancia.', cost: 120 },
    { id: 'cavalry', name: 'Caballería', description: 'Unidad rápida y poderosa.', cost: 200 },
  ];

  const handleTrainUnit = (unitName: string) => {
    alert(`Entrenando unidad: ${unitName}`);
    // Aquí puedes implementar la lógica para entrenar la unidad
  };

  return (
    <div className="barracks-view-overlay">
      <div className="barracks-view-content">
        <button className="barracks-view-close-btn" onClick={onClose}>X</button>
        <h2 className="barracks-title">{barracksName}</h2>
        <p>Selecciona una unidad para entrenar:</p>

        <div className="unit-list">
          {availableUnits.map((unit) => (
            <div key={unit.id} className="unit-item">
              <strong>{unit.name}</strong>
              <p>{unit.description}</p>
              <p>Costo: {unit.cost} oro</p>
              <button className="train-unit-btn" onClick={() => handleTrainUnit(unit.name)}>
                Entrenar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarracksView;