import React from 'react';
import { CityProps } from '../../types';
import '../../styles/CityView.css';

const CityView: React.FC<{ city: CityProps; onClose: () => void }> = ({ city, onClose }) => (
  <div className="city-view-overlay">
    <div className="city-view-content">
      <h2>{city.name}</h2>
      <p>Populazioa: {city.population}</p>
      <button onClick={onClose}>Itxi</button>
    </div>
  </div>
);

export default CityView;