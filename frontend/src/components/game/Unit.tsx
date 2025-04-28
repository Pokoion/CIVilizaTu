import React from 'react';
import { UnitProps } from '../../types'; // Importar los tipos de props

const Unit: React.FC<UnitProps> = ({ id, type, visible, selected, onClick }) => {
  if (!visible) return null;

  return (
    <div
      className={`unit${selected ? ' selected' : ''}`}
      data-unit-id={id}
      title={type}
      onClick={e => {
        e.stopPropagation();
        onClick && onClick();
      }}
    />
  );
};

export default Unit;