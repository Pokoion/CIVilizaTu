import React from 'react';
import { UnitProps } from '../../types';
import '../../styles/Unit.css';

const Unit: React.FC<UnitProps> = ({ id, type, selected, onClick }) => {

  return (
    <div
      className={`unit-container unit${selected ? ' selected' : ''}`}
      data-unit-id={id}
      title={type}
      onClick={e => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      <img src="images/warrior.png" alt="Unidad" className="unit-person" />
    </div>
  );
};

export default Unit;