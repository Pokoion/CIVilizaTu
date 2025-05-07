import React from 'react';
import { UnitProps } from '../../types';
import '../../styles/Unit.css';

const Unit: React.FC<UnitProps> = ({ id, type, selected, onClick, owner }) => {
  return (
    <div
      className={
        `unit-container unit` +
        (selected ? ' selected' : '') +
        (owner === 'ai' ? ' unit-enemy' : '')
      }
      data-unit-id={id}
      title={type}
      onClick={e => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      <img src="images/warrior.png" alt="Unidad" className="unit-person" />
    </div>
  );
};

export default Unit;