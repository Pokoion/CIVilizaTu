import React from 'react';
import { CityProps } from '../../types';
import '../../styles/City.css';

const City: React.FC<CityProps> = ({ id, name, position, onClick }) => {
  return (
    <div
      className="city-container"
      data-city-id={id}
      title={name}
      style={{}}
      onClick={e => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      <img src="images/city.png" alt={name} className="city-person" />
    </div>
  );
};

export default City;