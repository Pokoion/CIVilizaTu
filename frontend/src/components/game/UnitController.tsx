import React from 'react';

interface UnitControllerProps {
  position: { row: number; col: number };
}

const UnitController: React.FC<UnitControllerProps> = () => {
  return <div className="person" />;
};

export default UnitController;