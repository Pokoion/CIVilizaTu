import React, { useState } from 'react';
import { CityProps } from '../../types';
import '../../styles/CityView.css';
import BarracksView from './BarracksView';

const CityView: React.FC<{ city: CityProps; onClose: () => void }> = ({ city, onClose }) => {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0); // Índice del edificio central
  const [constructedBuildings, setConstructedBuildings] = useState(city.buildings); // Edificios construidos
  const [activeBarracks, setActiveBarracks] = useState<string | null>(null); // Cuartel activo
  const buildingLimit = 5; // Límite de edificios en la ciudad

  const availableBuildings = [
    { id: 'granary', name: 'Aletegia', description: 'Aumenta la producción de alimentos.', image: '/images/buildings/Aletegia.png' },
    { id: 'barracks', name: 'Kuartela', description: 'Permite entrenar unidades militares.', image: '/images/buildings/Kuartela.png' },
    { id: 'library', name: 'Eskola', description: 'Aumenta la producción de ciencia.', image: '/images/buildings/Eskola.png' },
    { id: 'market', name: 'Merkatua', description: 'Aumenta la producción de oro.', image: '/images/buildings/Merkatua.png' },
    { id: 'temple', name: 'Unibertsitatea', description: 'Aumenta la producción de cultura.', image: '/images/buildings/Unibertsitatea.png' },
    { id: 'wall', name: 'Harresia', description: 'Proporciona defensa adicional a la ciudad.', image: '/images/buildings/Harresia.png' },
  ];

  const handleNextBuilding = () => {
    setSelectedBuildingIndex((prevIndex) => (prevIndex + 1) % availableBuildings.length);
  };

  const handlePreviousBuilding = () => {
    setSelectedBuildingIndex((prevIndex) =>
      prevIndex === 0 ? availableBuildings.length - 1 : prevIndex - 1
    );
  };

  const handleBuild = (building: typeof availableBuildings[0]) => {
    if (constructedBuildings.length >= buildingLimit) {
      alert('Has alcanzado el límite de edificios en esta ciudad.');
      return;
    }

    // Agregar el edificio a la lista de construidos
    setConstructedBuildings((prevBuildings) => [
      ...prevBuildings,
      { id: `${building.id}-${Date.now()}`, type: building.id, name: building.name, description: building.description },
    ]);
  };

    if (activeBarracks) {
    return <BarracksView barracksName={activeBarracks} onClose={() => setActiveBarracks(null)} />;
  }

  // Obtener los 3 edificios visibles (anterior, actual, siguiente)
  const getVisibleBuildings = () => {
    const total = availableBuildings.length;
    const prev = (selectedBuildingIndex - 1 + total) % total;
    const next = (selectedBuildingIndex + 1) % total;
    return [availableBuildings[prev], availableBuildings[selectedBuildingIndex], availableBuildings[next]];
  };

  const visibleBuildings = getVisibleBuildings();

  return (
    <div className="city-view-overlay">
      <div className="city-view-background"></div>
      <div className="city-view-content">
        <button className="city-view-close-btn" onClick={onClose}>X</button>
        <h2 className="city-title">{city.name}</h2>
        <p className="city-population">Biztanleria: {city.population}</p>

        <div className="city-production">
          <h3>Produkzioa</h3>
          <div className="resource-list">
            <div className="resource-item">
              <img src="/images/resources/urrea.png" alt="Oro" />
              <span>{city.production.gold}</span>
            </div>
            <div className="resource-item">
              <img src="/images/resources/janaria.png" alt="Alimentos" />
              <span>{city.production.food}</span>
            </div>
            <div className="resource-item">
              <img src="/images/resources/kultura.png" alt="Cultura" />
              <span>{city.production.culture}</span>
            </div>
            <div className="resource-item">
              <img src="/images/resources/zientzia.png" alt="Ciencia" />
              <span>{city.production.science}</span>
            </div>
            <div className="resource-item">
              <img src="/images/resources/baliabide_naturalak.png" alt="Recursos Naturales" />
              <span>{city.production.natural_resources}</span>
            </div>
          </div>
        </div>

        {/* Lista de edificios construidos */}
        <div className="city-buildings">
          <h3>Edificios Construidos ({constructedBuildings.length}/{buildingLimit})</h3>
          {constructedBuildings.length > 0 ? (
            <ul className="building-list">
              {constructedBuildings.map((building) => (
                <li key={building.id} className="building-item">
                  <img src={`/images/buildings/${building.name}.png`} alt={building.name} className="building-image" />
                  <div>
                    <strong>{building.name}</strong>
                    <p>{building.description}</p>
                    {building.type === 'barracks' && (
                      <button onClick={() => setActiveBarracks(building.name)}>Entrar al Cuartel</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay edificios construidos en esta ciudad.</p>
          )}
        </div>
        

        {/* Construir nuevos edificios con navegación */}
        <div className="city-build-options">
          <h3>Construir Edificios</h3>
          <div className="build-navigation">
            <button onClick={handlePreviousBuilding} className="nav-btn-circle">◀</button>
            <div className="build-list">
              {visibleBuildings.map((building) => (
                <div key={building.id} className="build-item">
                  <img src={building.image} alt={building.name} className="build-image" />
                  <strong>{building.name}</strong>
                  <p>{building.description}</p>
                  <button onClick={() => handleBuild(building)} className="build-btn">
                    Construir
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleNextBuilding} className="nav-btn-circle">▶</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityView;