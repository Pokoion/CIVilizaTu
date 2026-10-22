import React from 'react';
import { UnitProps } from '../../types';
import '../../styles/Unit.css';
import { asset } from '../../utils/asset';

const Unit: React.FC<UnitProps> = ({ id, type, selected, onClick, owner, direction }) => {
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
      <img src={asset(`/images/units/${type}/${type}-${direction || 'default'}.png`)} alt={type} className="unit-person" />
    </div>
  );
};

export default Unit;