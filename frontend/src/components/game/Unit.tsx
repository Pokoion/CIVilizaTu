import React from 'react';

interface UnitProps {
  id: string;
  type: string;
  position: { x: number; y: number };
  visible: boolean;
  selected?: boolean;
  onClick?: () => void;
}

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