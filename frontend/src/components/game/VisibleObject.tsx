import React from 'react';
import { VisibleObjectProps } from '../../types';
import { VISIBLE_OBJECTS_BY_ID } from '../../utils/Constants';
import '../../styles/VisibleObject.css';

interface Props extends VisibleObjectProps {
  onClick?: () => void;
}

const VisibleObject: React.FC<Props> = ({ type, onClick }) => {
  const objInfo = VISIBLE_OBJECTS_BY_ID[type];
  if (!objInfo) return null;

  return (
    <div
      className="visible-object-container"
      title={objInfo.name}
      onClick={e => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      style={{ cursor: 'inherit' }}
    >
      <img
        src={`/images/visibleObjects/${objInfo.name}.png`}
        alt={objInfo.name}
        className="visible-object-img"
      />
    </div>
  );
};

export default VisibleObject;