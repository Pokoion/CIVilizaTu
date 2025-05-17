import React, { useState, useMemo, useEffect } from 'react';
import '../../styles/CityView.css';
import BarracksView from './BarracksView';
import { BUILDINGS, CITY_ERAS_BY_ID } from '../../utils/Constants';
import { useGame } from '../../context/GameContext';

// Eras y tipos
const ERAS = ['Antzinaroa', 'Erdi Aroa', 'Aro Modernoa'] as const;
type Era = typeof ERAS[number];

function getNextEra(currentEra: Era): Era {
  const idx = ERAS.indexOf(currentEra);
  return idx >= 0 && idx < ERAS.length - 1 ? ERAS[idx + 1] : currentEra;
}

// Mapeo de recursos a nombres de imagen reales
const RESOURCE_IMAGE_MAP: Record<string, string> = {
  gold: "urrea.png",
  food: "janaria.png",
  culture: "kultura.png",
  science: "zientzia.png",
  natural_resources: "baliabide_naturalak.png"
};

const CityView: React.FC<{ cityId: string; onClose: () => void }> = ({ cityId, onClose }) => {
  const { cities, unlockedTechs, updateCity, resources, setResources, civilization, playerEra } = useGame();
  const city = cities.find(c => c.id === cityId);

  // --- Mueve todos los hooks arriba, antes de cualquier return ---
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0);
  const [constructedBuildings, setConstructedBuildings] = useState(city ? city.buildings : []);
  const [activeBarracks, setActiveBarracks] = useState<string | null>(null);
  const [buildingLimitMsg, setBuildingLimitMsg] = useState<string | null>(null);

  const RESOURCE_KEY_MAP: Record<string, keyof typeof resources> = {
    gold: "gold",
    culture: "culture",
    natural_resources: "natural_resources",
    food: "food",
    science: "science"
  };

  const PRODUCTION_KEYS: Array<keyof typeof resources> = [
    "gold", "food", "culture", "science", "natural_resources"
  ];

  // Filtrar edificios según tecnologías desbloqueadas
  const availableBuildings = useMemo(() => {
    return BUILDINGS.filter(b => {
      if (!b.requirement) return true;
      return unlockedTechs.includes(b.requirement);
    }).map(b => ({
      id: b.id,
      name: b.name,
      description: b.bonus,
      type: b.id,
    }));
  }, [unlockedTechs]);

  useEffect(() => {
    if (selectedBuildingIndex >= availableBuildings.length) {
      setSelectedBuildingIndex(0);
    }
    // eslint-disable-next-line
  }, [availableBuildings.length, selectedBuildingIndex]);

  // --- Fin hooks arriba ---

  if (!city) return null;

  const buildingLimit = CITY_ERAS_BY_ID[city.era || 'Antzinaroa']?.building_limit || 5;
  const hasBarracks = constructedBuildings.some(bid => bid === 'kuartela');

  const handleNextBuilding = () => {
    setSelectedBuildingIndex((prevIndex) =>
      availableBuildings.length === 0 ? 0 : (prevIndex + 1) % availableBuildings.length
    );
  };

  const handlePreviousBuilding = () => {
    setSelectedBuildingIndex((prevIndex) =>
      availableBuildings.length === 0
        ? 0
        : prevIndex === 0
          ? availableBuildings.length - 1
          : prevIndex - 1
    );
  };

  const handleBuild = (building: typeof availableBuildings[0]) => {
    if (constructedBuildings.length >= buildingLimit) {
      setBuildingLimitMsg('Ezin duzu eraikin gehiago eraiki hiri honetan.');
      setTimeout(() => setBuildingLimitMsg(null), 2500);
      return;
    }

    const buildingData = BUILDINGS.find(b => b.id === building.id);
    const cost = buildingData?.cost || {};

    const notEnough = Object.entries(cost).some(
      ([resource, amount]) => {
        const key = RESOURCE_KEY_MAP[resource];
        if (key === undefined) return false;
        return resources[key] < (amount as number);
      }
    );
    if (notEnough) {
      setBuildingLimitMsg('Ez daukazu nahikoa baliabide eraikin hau egiteko.');
      setTimeout(() => setBuildingLimitMsg(null), 2500);
      return;
    }

    setResources(prev => {
      const newRes = { ...prev };
      Object.entries(cost).forEach(([resource, amount]) => {
        const key = RESOURCE_KEY_MAP[resource];
        if (key && key !== "culture") {
          newRes[key] -= amount as number;
        }
      });
      return newRes;
    });

    setConstructedBuildings((prevBuildings) => [
      ...prevBuildings,
      building.id
    ]);

    if (building.id === "harresia") {
      updateCity(cityId, {
        buildings: [...constructedBuildings, building.id],
        defense: (city.defense ?? 20) + 50,
      });
    } else {
      updateCity(cityId, {
        buildings: [...constructedBuildings, building.id]
      });
    }

    updateCity(cityId, {
      buildings: [...constructedBuildings, building.id]
    });
  };

  // --- MEJORA DE ERA ---
  const handleUpgradeEra = () => {
    if (!city) return;
    const currentEra = city.era as Era;
    const nextEra = getNextEra(currentEra);
    if (playerEra !== nextEra) {
      setBuildingLimitMsg('Jokalaria ez dago hurrengo eran! Ezin da hobetu.');
      setTimeout(() => setBuildingLimitMsg(null), 2500);
      return;
    }
    const currentEraInfo = CITY_ERAS_BY_ID[currentEra];
    if (!currentEraInfo) {
      setBuildingLimitMsg('Ezin da gehiago hobetu.');
      setTimeout(() => setBuildingLimitMsg(null), 2500);
      return;
    }
    const cost = currentEraInfo.upgrade_cost;
    if (resources.gold < cost.gold || resources.natural_resources < cost.natural_resources) {
      setBuildingLimitMsg('Ez daukazu nahikoa urre eta baliabide naturalak hiriaren era hobetzeko!');
      setTimeout(() => setBuildingLimitMsg(null), 2500);
      return;
    }
    setResources(prev => ({
      ...prev,
      gold: prev.gold - cost.gold,
      natural_resources: prev.natural_resources - cost.natural_resources,
    }));
    updateCity(cityId, {
      era: nextEra,
      production: {
        food: (city.production.food || 0) + (CITY_ERAS_BY_ID[nextEra].base_production.food || 0),
        gold: (city.production.gold || 0) + (CITY_ERAS_BY_ID[nextEra].base_production.gold || 0),
        culture: (city.production.culture || 0) + (CITY_ERAS_BY_ID[nextEra].base_production.culture || 0),
        science: (city.production.science || 0) + (CITY_ERAS_BY_ID[nextEra].base_production.science || 0),
        natural_resources: (city.production.natural_resources || 0) + (CITY_ERAS_BY_ID[nextEra].base_production.natural_resources || 0),
      }
    });
  };

  if (activeBarracks) {
    const barracksCount = constructedBuildings.filter(b => b === 'kuartela').length;
    return (
      <BarracksView
        onClose={() => {
          setActiveBarracks(null); // Cierra BarracksView
          onClose();               // Cierra CityView
        }}
        barracksCount={barracksCount}
        civilization={civilization}
        unlockedTechs={unlockedTechs}
        cityId={city.id}
      />
    );
  }

  let visibleBuildings: typeof availableBuildings = [];
  if (availableBuildings.length === 1) {
    visibleBuildings = [availableBuildings[0]];
  } else if (availableBuildings.length === 2) {
    visibleBuildings = [
      availableBuildings[selectedBuildingIndex],
      availableBuildings[(selectedBuildingIndex + 1) % 2],
    ];
  } else if (availableBuildings.length >= 3) {
    const total = availableBuildings.length;
    const prev = (selectedBuildingIndex - 1 + total) % total;
    const next = (selectedBuildingIndex + 1) % total;
    visibleBuildings = [
      availableBuildings[prev],
      availableBuildings[selectedBuildingIndex],
      availableBuildings[next],
    ];
  }

  const currentEra = city.era as Era;
  const nextEra = getNextEra(currentEra);

  const playerEraIndex = ERAS.indexOf(playerEra as Era);
  const cityEraIndex = ERAS.indexOf(currentEra);
  // Permite mejorar si el jugador está en una era superior y la ciudad aún no está en la última era
  const canUpgradeEra = playerEraIndex > cityEraIndex && cityEraIndex < ERAS.length - 1;
  const currentEraInfo = CITY_ERAS_BY_ID[currentEra];
  const upgradeCost = currentEraInfo?.upgrade_cost || { gold: 0, natural_resources: 0 };

  return (
    <div className="city-view-overlay">
      <div className="city-view-content">
        <button className="city-view-close-btn" onClick={onClose}>X</button>
        <h2 className="city-title">{city.name}</h2>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 8,
            justifyContent: 'center'
          }}
        >
          <p className="city-population" style={{ margin: 0 }}>
            Biztanleria: {city.population}
          </p>
          <button
            className={`city-growth-btn ${city.allowPopulationGrowth ? 'grow-on' : 'grow-off'}`}
            onClick={() => updateCity(city.id, { allowPopulationGrowth: !city.allowPopulationGrowth })}
            aria-pressed={city.allowPopulationGrowth}
          >
            {city.allowPopulationGrowth
              ? '✔️ Biztanleria hazkundea AKTIBATUTA'
              : '⏸️ Biztanleria hazkundea DESAKTIBATUTA'}
          </button>
        </div>
        <p className="city-era">Era: <b>{city.era}</b></p>
        <p className="city-defense">
          🛡️ Defentsa: <b>
            {(city.defense ?? 20) + city.buildings.filter(b => b === 'harresia').length * 50}
          </b>
        </p>
        <p className="city-health">
          ❤️ Osasuna: <b>{city.health ?? 100}</b>
        </p>

        {buildingLimitMsg && (
          <div
            className="city-message city-message-warning"
            style={{
              margin: '12px 0 0 0',
              background: '#ffe0e0',
              color: '#a00',
              border: '1px solid #f88',
              borderRadius: 6,
              padding: '8px 16px',
              textAlign: 'center',
              fontWeight: 500,
              maxWidth: 400,
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            {buildingLimitMsg}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
          <button
            className="city-upgrade-era-btn"
            style={{
              padding: '10px 28px',
              background: canUpgradeEra ? 'linear-gradient(90deg, #f7d358 60%, #bfa32f 100%)' : '#ccc',
              color: canUpgradeEra ? '#222' : '#888',
              border: 'none',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: '1.1em',
              cursor: canUpgradeEra ? 'pointer' : 'not-allowed',
              opacity: canUpgradeEra ? 1 : 0.7,
              boxShadow: canUpgradeEra ? '0 2px 8px #bfa32f44' : 'none',
              transition: 'all 0.2s'
            }}
            disabled={!canUpgradeEra}
            onClick={handleUpgradeEra}
          >
            {nextEra !== currentEra
              ? (
                <>
                  <span style={{ fontWeight: 600 }}>Hiriaren era hobetu: {nextEra}</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 6,
                    justifyContent: 'center'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <img src={`/images/resources/${RESOURCE_IMAGE_MAP.gold}`} alt="Gold" style={{ width: 22, height: 22, verticalAlign: 'middle' }} />
                      <span style={{ fontWeight: 500 }}>{upgradeCost.gold}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <img src={`/images/resources/${RESOURCE_IMAGE_MAP.natural_resources}`} alt="Natural resources" style={{ width: 22, height: 22, verticalAlign: 'middle' }} />
                      <span style={{ fontWeight: 500 }}>{upgradeCost.natural_resources}</span>
                    </span>
                  </div>
                </>
              )
              : <>Era maximora iritsita</>
            }
          </button>
        </div>

        {hasBarracks && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
            <button
              onClick={() => setActiveBarracks("Kuartela")}
              className="barracks-enter-btn"
              style={{
                padding: '8px 24px',
                fontSize: '1.1em',
                background: '#2d3e50',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0002'
              }}
            >
              Kuartelera Sartu
            </button>
          </div>
        )}

        <div className="city-production">
          <h3>Produkzioa</h3>
          <div className="resource-list">
            {PRODUCTION_KEYS.map((res) => {
              let value = city.production[res];
              if (res === "culture") {
                const schoolCount = city.buildings.filter(b => b === 'eskola').length;
                const uniCount = city.buildings.filter(b => b === 'unibertsitatea').length;
                value = (city.production.culture || 0)
                  + (schoolCount * city.population)
                  + (uniCount * city.population * 2);
              }
              if (res === "science") {
                const schoolCount = city.buildings.filter(b => b === 'eskola').length;
                value = (city.production.science || 0)
                  + (schoolCount * city.population);
              }
              if (res === "gold") {
                const marketCount = city.buildings.filter(b => b === 'merkatua').length;
                const hasEkonomia = unlockedTechs.includes("ekonomia");
                value = (city.production.gold || 0) + (marketCount * 2) + (hasEkonomia ? 5 : 0);
              }
              return (
                <div className="resource-item" key={res}>
                  <img src={`/images/resources/${RESOURCE_IMAGE_MAP[res]}`} alt={res} />
                  <span>{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="city-buildings">
          <h3>Eraikitako Eraikinak ({constructedBuildings.length}/{buildingLimit})</h3>
          {constructedBuildings.length > 0 ? (
            <ul className="building-list">
              {constructedBuildings.map((buildingId, idx) => {
                const building = BUILDINGS.find(b => b.id === buildingId);
                if (!building) return null;
                return (
                  <li key={buildingId + '-' + idx} className="building-item">
                    <img src={`/images/buildings/${building.name}.png`} alt={building.name} className="building-image" />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{building.name}</strong>
                        <p>{building.bonus}</p>
                        <div className="building-cost"
                          style={{
                            display: 'flex',
                            gap: 12,
                            margin: '12px 0',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                          }}>
                          {Object.entries(building.cost || {}).map(([resource, amount]) => (
                            amount > 0 && (
                              <span key={resource} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <img
                                  src={`/images/resources/${RESOURCE_IMAGE_MAP[resource] || resource + ".png"}`}
                                  alt={resource}
                                  style={{ width: 20, height: 20 }}
                                />
                                <span>{amount}</span>
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>Ez dago eraikinik hiri honetan.</p>
          )}
        </div>

        <div className="city-build-options">
          <h3>Eraikinak Eraiki</h3>
          {availableBuildings.length === 0 ? (
            <div className="city-message city-message-warning" style={{ marginTop: 16 }}>
              Ez dago eraikin erabilgarririk teknologiarik gabe.
            </div>
          ) : (
            <div className="build-navigation">
              <button onClick={handlePreviousBuilding} className="nav-btn-circle" disabled={availableBuildings.length < 2}>◀</button>
              <div className="build-list">
                {visibleBuildings.map((building) => (
                  <div key={building.id} className="build-item">
                    <img src={`/images/buildings/${building.name}.png`} alt={building.name} className="build-image" />
                    <strong>{building.name}</strong>
                    <p>{building.description}</p>
                    <div className="building-cost"
                      style={{
                        display: 'flex',
                        gap: 12,
                        margin: '12px 0',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}>
                      {Object.entries(BUILDINGS.find(b => b.id === building.id)?.cost || {}).map(([resource, amount]) => (
                        amount > 0 && (
                          <span key={resource} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <img
                              src={`/images/resources/${RESOURCE_IMAGE_MAP[resource] || resource + ".png"}`}
                              alt={resource}
                              style={{ width: 20, height: 20 }}
                            />
                            <span>{amount}</span>
                          </span>
                        )
                      ))}
                    </div>
                    <button onClick={() => handleBuild(building)} className="build-btn">
                      Eraiki
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleNextBuilding} className="nav-btn-circle" disabled={availableBuildings.length < 2}>▶</button>
            </div>
          )}
          {buildingLimitMsg && (
            <div className="city-message city-message-warning" style={{ marginTop: 16 }}>
              {buildingLimitMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CityView;