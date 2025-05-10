import React from 'react';
import { CityProps } from '../../types';
import '../../styles/City.css';

const eraToImage: Record<string, string> = {
  "Antzinaroa": "city_antzinaroa.png",
  "Erdi Aroa": "city_erdi_aroa.png",
  "Aro Modernoa": "city_aro_modernoa.png",
};

const City: React.FC<CityProps> = ({ id, name, position, onClick, era, owner }) => {
  const imageFile = eraToImage[era ?? "Antzinaroa"] || "city_antzinaroa.png";
  const isEnemy = owner === 'ai';

  return (
    <div
      className={`city-container${isEnemy ? ' enemy-city' : ''}`}
      data-city-id={id}
      title={name}
      style={{}}
      onClick={e => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      <img
        src={`/images/city/${imageFile}`}
        alt={name}
        className="city-person"
      />
    </div>
  );
};

export default City;