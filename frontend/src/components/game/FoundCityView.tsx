import React, { useState } from 'react';
import '../../styles/FoundCityView.css';

interface FoundCityViewProps {
  onConfirm: (cityName: string) => void;
  onCancel: () => void;
}

const FoundCityView: React.FC<FoundCityViewProps> = ({ onConfirm, onCancel }) => {
  const [cityName, setCityName] = useState('');

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Izena eman hiriari</h3>
        <input
          type="text"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          placeholder="Sartu hiriaren izena"
        />
        <div className="modal-buttons">
          <button onClick={() => onConfirm(cityName)}>Onartu</button>
          <button onClick={onCancel}>Utzi</button>
        </div>
      </div>
    </div>
  );
};

export default FoundCityView;