import React, { useEffect, useState } from 'react';
import { Unit } from '../../types';
import '../../styles/BattleView.css';

interface BattleViewProps {
  attacker: Unit;
  defender: Unit;
  onClose: () => void;
}

type Phase = 'idle' | 'attack' | 'defenderHit' | 'counter' | 'attackerHit' | 'end';

const BattleView: React.FC<BattleViewProps> = ({ attacker, defender, onClose }) => {
  const [attackerHealth, setAttackerHealth] = useState(attacker.health);
  const [defenderHealth, setDefenderHealth] = useState(defender.health);

  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<string | null>(null);

  const attackerDead = attackerHealth <= 0;
  const defenderDead = defenderHealth <= 0;

  // Secuencia de combate principal
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (phase === 'idle') {
      timeout = setTimeout(() => setPhase('attack'), 600);
    }
    else if (phase === 'attack') {
      timeout = setTimeout(() => {
        setDefenderHealth(h => Math.max(0, h - attacker.strength));
        setPhase('defenderHit');
      }, 400);
    }
    else if (phase === 'defenderHit') {
      // Espera a que defenderHealth se actualice antes de decidir
      timeout = setTimeout(() => {}, 1);
    }
    else if (phase === 'counter') {
      timeout = setTimeout(() => {
        setAttackerHealth(h => Math.max(0, h - defender.strength));
        setPhase('attackerHit');
      }, 400);
    }
    else if (phase === 'attackerHit') {
      // Espera a que attackerHealth se actualice antes de decidir
      timeout = setTimeout(() => {}, 1);
    }
    else if (phase === 'end') {
      timeout = setTimeout(() => onClose(), 2200);
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [phase, attacker.strength, defender.strength, onClose]);

  // Cuando defenderHealth cambia en fase defenderHit, decide si termina o sigue
  useEffect(() => {
    if (phase === 'defenderHit') {
      if (defenderHealth <= 0) {
        setWinner('attacker');
        setTimeout(() => setPhase('end'), 1500);
      } else {
        setTimeout(() => setPhase('counter'), 600);
      }
    }
    // eslint-disable-next-line
  }, [defenderHealth, phase]);

  // Cuando attackerHealth cambia en fase attackerHit, decide si termina o sigue
  useEffect(() => {
    if (phase === 'attackerHit') {
      if (attackerHealth <= 0) {
        setWinner('defender');
        setTimeout(() => setPhase('end'), 1500);
      } else {
        setTimeout(() => setPhase('attack'), 600);
      }
    }
    // eslint-disable-next-line
  }, [attackerHealth, phase]);

  useEffect(() => {
    setPhase('idle');
  }, []);

  return (
    <div className="battle-view-overlay">
      <div className="battle-view-container">
        <div className="battle-title">
          ⚔️ Borroka! ⚔️
        </div>
        <div className="battle-units-row battle-anim-row">
          <div className="battle-unit-box battle-unit-box-left">
            <div className="battle-label">Erasotzailea</div>
            <div
              className={
                "battle-unit-img-wrapper" +
                (phase === 'attack' ? ' attacking' : '') +
                (phase === 'attackerHit' && attackerDead ? ' dead' : '') +
                (phase === 'attackerHit' && !attackerDead ? ' hit' : '')
              }
            >
              <img
                src="/images/warrior.png"
                alt={attacker.type}
                className="battle-unit-img"
                style={{
                  filter: attacker.owner === 'ai'
                    ? 'hue-rotate(-30deg) sepia(0.8) saturate(2.5) brightness(1.1)'
                    : undefined,
                  opacity: attackerDead ? 0.3 : 1,
                }}
              />
              {attackerDead && (
                <div className="death-effect">💀</div>
              )}
            </div>
            <div className="battle-unit-name">{attacker.type}</div>
            <div className="battle-unit-stats">
              <span title="Osasuna">❤️ {attackerHealth}</span>
              <span title="Indarra" style={{ marginLeft: 12 }}>⚔️ {attacker.strength}</span>
            </div>
          </div>
          <div className="battle-unit-box battle-unit-box-right">
            <div className="battle-label">Defendatzailea</div>
            <div
              className={
                "battle-unit-img-wrapper" +
                (phase === 'counter' ? ' attacking' : '') +
                (phase === 'defenderHit' && defenderDead ? ' dead' : '') +
                (phase === 'defenderHit' && !defenderDead ? ' hit' : '')
              }
            >
              <img
                src="/images/warrior.png"
                alt={defender.type}
                className="battle-unit-img"
                style={{
                  filter: defender.owner === 'ai'
                    ? 'hue-rotate(-30deg) sepia(0.8) saturate(2.5) brightness(1.1)'
                    : undefined,
                  opacity: defenderDead ? 0.3 : 1,
                }}
              />
              {defenderDead && (
                <div className="death-effect">💀</div>
              )}
            </div>
            <div className="battle-unit-name">{defender.type}</div>
            <div className="battle-unit-stats">
              <span title="Osasuna">❤️ {defenderHealth}</span>
              <span title="Indarra" style={{ marginLeft: 12 }}>⚔️ {defender.strength}</span>
            </div>
          </div>
        </div>
        <div className="battle-flavor">
          {phase === 'end' && winner ? (
            winner === 'attacker'
              ? <>🏆 Erasotzaileak irabazi du!</>
              : <>🏆 Defendatzaileak irabazi du!</>
          ) : (
            <>
              <span role="img" aria-label="swords">🗡️</span>
              Hoberenak irabazi dezala!
              <span role="img" aria-label="shield">🛡️</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleView;