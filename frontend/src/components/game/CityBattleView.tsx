import React, { useEffect, useState } from 'react';
import { UnitProps, CityProps } from '../../types';
import '../../styles/CityBattleView.css';

interface CityBattleViewProps {
  attacker: UnitProps;
  city: CityProps;
  onClose: (finalDefense: number, finalHealth: number) => void;
}

type Phase = 'idle' | 'projectile' | 'cityHit' | 'end';

const getCityImg = (era: string) => {
    if (era === 'Antzinaroa') return '/images/city/city_antzinaroa.png';
    if (era === 'Erdi Aroa') return '/images/city/city_erdi_aroa.png';
    if (era === 'Aro Modernoa') return '/images/city/city_aro_modernoa.png';
    return '/images/city/city_antzinaroa.png';
};

const CityBattleView: React.FC<CityBattleViewProps> = ({ attacker, city, onClose }) => {
    const [cityDefense, setCityDefense] = useState(city.defense ?? 20);
    const [cityHealth, setCityHealth] = useState(city.health ?? 100);
    const [phase, setPhase] = useState<Phase>('idle');
    const [showProjectile, setShowProjectile] = useState(false);

    // Animación de fases
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (phase === 'idle') {
            timeout = setTimeout(() => {
                setShowProjectile(true);
                setPhase('projectile');
            }, 700);
        } else if (phase === 'projectile') {
            timeout = setTimeout(() => {
                setShowProjectile(false);
                // Aplica daño
                if (cityDefense > 0) {
                    setCityDefense(d => Math.max(0, d - (attacker.strength ?? 0)));
                } else {
                    setCityHealth(h => Math.max(0, h - (attacker.strength ?? 0)));
                }
                setPhase('cityHit');
            }, 700);
        } else if (phase === 'cityHit') {
            timeout = setTimeout(() => setPhase('end'), 1100);
        } else if (phase === 'end') {
            timeout = setTimeout(() => onClose(cityDefense, cityHealth), 1200);
        }

        return () => clearTimeout(timeout);
    }, [phase, attacker.strength, cityDefense, onClose]);

    useEffect(() => {
        setPhase('idle');
    }, []);

    return (
        <div className="city-battle-overlay">
            <div className="city-battle-container">
                <div className="city-battle-title">
                    🏰 Hiria setiatzen! 🏹
                </div>
                <div className="city-battle-row">
                    {/* Atacante */}
                    <div className="city-battle-attacker">
                        <img
                            src={`/images/units/${attacker.type}/${attacker.type}-default.png`}
                            alt={attacker.type}
                            className={
                                "city-battle-attacker-img" +
                                (phase === 'projectile' ? ' attacking' : '')
                            }
                        />
                        <div style={{ fontWeight: 600, color: '#7c5e1a', fontSize: '1.08rem' }}>
                            {attacker.type}
                        </div>
                        <div className="city-battle-stats">
                            <span title="Osasuna">❤️ {attacker.health}</span>
                            <span title="Indarra">⚔️ {attacker.strength}</span>
                        </div>
                    </div>

                    {/* Proyectil animado */}
                    {showProjectile && (
                        <span className="city-battle-projectile" role="img" aria-label="rock">🔥</span>
                    )}

                    {/* Ciudad */}
                    <div className="city-battle-city">
                        <div
                            className={
                                "city-battle-city-img-wrapper" +
                                (phase === 'cityHit' ? ' hit' : '')
                            }
                        >
                            <img
                                src={getCityImg(city.era)}
                                alt="city"
                                className="city-battle-city-img"
                            />
                            {(phase === 'cityHit' || phase === 'end') && (
                                <span className="city-battle-city-fire" role="img" aria-label="fire">🔥</span>
                            )}
                        </div>
                        <div style={{ fontWeight: 600, color: '#7c5e1a', fontSize: '1.13rem' }}>
                            {city.name}
                        </div>
                        <div className="city-battle-stats">
                            <span title="Defentsa">🛡️ {cityDefense}</span>
                            <span title="Osasuna">❤️ {cityHealth}</span>
                        </div>
                    </div>
                </div>
                <div className="city-battle-flavor">
                    {phase === 'end' && cityHealth <= 0 ? (
                        <span style={{ color: '#b71c1c', fontWeight: 700, fontSize: '1.25rem' }}>
                            🏴 Hiria suntsituta! 🏴
                        </span>
                    ) : phase === 'end' ? (
                        <>Hiriari kalte handia egin zaio!</>
                    ) : phase === 'cityHit' ? (
                        <>🔥 Defentsak kolpe gogorra jaso du!</>
                    ) : (
                        <>🗡️ Hiria erasotzen... 🏹</>
                    )}
                </div>
                <div className="city-battle-murallas"></div>
            </div>
        </div>
    );
};

export default CityBattleView;