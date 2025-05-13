import React, { useEffect, useState } from 'react';
import { Unit } from '../../types';
import '../../styles/BattleView.css';

interface BattleViewProps {
  attacker: Unit;
  defender: Unit;
  mode: 'full' | 'single';
  onClose: () => void;
  onUnitDeath?: (unitId: string) => void;
  onUnitHealthChange?: (unitId: string, newHealth: number) => void;
  onFinish?: (result: { attackerHealth: number; defenderHealth: number }) => void;
}

type Phase = 'idle' | 'attack' | 'defenderHit' | 'counter' | 'attackerHit' | 'end';

const isRanged = (unit: any) => (unit.range ?? 1) > 1;

const getProjectileImage = (unit: Unit) => {
  if (unit.type === 'tanke') return '/images/projectiles/bala.png';
  if (unit.type === 'itsasontzia') return '/images/projectiles/canonball.png';
  return '/images/projectiles/flecha.png';
};

const getProjectileSize = (unit: Unit) => {
  if (unit.type === 'tanke') return { width: 24, height: 24 };
  if (unit.type === 'itsasontzia') return { width: 32, height: 32 };
  return { width: 40, height: 10 };
};

const BattleView: React.FC<BattleViewProps> = ({
  attacker,
  defender,
  mode,
  onClose,
  onUnitDeath,
  onUnitHealthChange,
  onFinish,
}) => {
  const [attackerHealth, setAttackerHealth] = useState(attacker.health);
  const [defenderHealth, setDefenderHealth] = useState(defender.health);

  const [phase, setPhase] = useState<Phase>('idle');
  const [winner, setWinner] = useState<string | null>(null);

  const attackerDead = attackerHealth <= 0;
  const defenderDead = defenderHealth <= 0;

  const [showProjectile, setShowProjectile] = useState(false);

  // Sincroniza la vida local si cambian las props (por ejemplo, tras otra pelea)
  useEffect(() => {
    setAttackerHealth(attacker.health);
  }, [attacker.id, attacker.health]);
  useEffect(() => {
    setDefenderHealth(defender.health);
  }, [defender.id, defender.health]);

  // Secuencia de combate principal
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (mode === 'single') {
      if (phase === 'idle') {
        timeout = setTimeout(() => setPhase('attack'), 600);
      } else if (phase === 'attack') {
        if (isRanged(attacker)) setShowProjectile(true);
        timeout = setTimeout(() => {
          setShowProjectile(false);
          const newHealth = Math.max(0, defenderHealth - attacker.strength);
          setDefenderHealth(newHealth);
          if (onUnitHealthChange) onUnitHealthChange(defender.id, newHealth);
          if (newHealth <= 0 && onUnitDeath) onUnitDeath(defender.id); // <-- AVISA AQUÍ TAMBIÉN
          setPhase('defenderHit');
        }, isRanged(attacker) ? 500 : 400);
      } else if (phase === 'defenderHit') {
        timeout = setTimeout(() => {
          setWinner(defenderHealth - attacker.strength <= 0 ? 'attacker' : null);
          setPhase('end');
        }, 1000);
      }
      else if (phase === 'end') {
        timeout = setTimeout(() => {
          if (onFinish) {
            onFinish({ attackerHealth, defenderHealth });
          }
          onClose();
        }, 1000);
      }
    } else {
      // Pelea clásica a muerte
      if (phase === 'idle') {
        timeout = setTimeout(() => setPhase('attack'), 600);
      } else if (phase === 'attack') {
        if (isRanged(attacker)) setShowProjectile(true);
        timeout = setTimeout(() => {
          setShowProjectile(false);
          const newHealth = Math.max(0, defenderHealth - attacker.strength);
          setDefenderHealth(newHealth);
          if (onUnitHealthChange) onUnitHealthChange(defender.id, newHealth);
          setPhase('defenderHit');
        }, isRanged(attacker) ? 500 : 400);
      } else if (phase === 'defenderHit') {
        timeout = setTimeout(() => { }, 1);
      } else if (phase === 'counter') {
        if (isRanged(defender)) setShowProjectile(true);
        timeout = setTimeout(() => {
          setShowProjectile(false);
          const newHealth = Math.max(0, attackerHealth - defender.strength);
          setAttackerHealth(newHealth);
          if (onUnitHealthChange) onUnitHealthChange(attacker.id, newHealth);
          setPhase('attackerHit');
        }, isRanged(defender) ? 500 : 400);
      } else if (phase === 'attackerHit') {
        timeout = setTimeout(() => { }, 1);
      }
      else if (phase === 'end') {
        timeout = setTimeout(() => {
          if (onFinish) {
            onFinish({ attackerHealth, defenderHealth });
          }
          onClose();
        }, 1000);
      }
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [phase, attacker.strength, defender.strength, onClose, mode, defenderHealth, attackerHealth]);

  // Cuando defenderHealth cambia en fase defenderHit, decide si termina o sigue
  useEffect(() => {
    if (mode === 'single') return; // No hace falta, ya se gestiona arriba
    if (phase === 'defenderHit') {
      if (defenderHealth <= 0) {
        setWinner('attacker');
        if (onUnitDeath) onUnitDeath(defender.id);
        setTimeout(() => setPhase('end'), 1500);
      } else {
        setTimeout(() => setPhase('counter'), 600);
      }
    }
    // eslint-disable-next-line
  }, [defenderHealth, phase, mode]);

  // Cuando attackerHealth cambia en fase attackerHit, decide si termina o sigue
  useEffect(() => {
    if (mode === 'single') return;
    if (phase === 'attackerHit') {
      if (attackerHealth <= 0) {
        setWinner('defender');
        if (onUnitDeath) onUnitDeath(attacker.id);
        setTimeout(() => setPhase('end'), 1500);
      } else {
        setTimeout(() => setPhase('attack'), 600);
      }
    }
    // eslint-disable-next-line
  }, [attackerHealth, phase, mode]);

  useEffect(() => {
    setPhase('idle');
  }, []);

  return (
    <div className="battle-view-overlay">
      <div className="battle-view-container">
        <div className="battle-title">
          ⚔️ Borroka! ⚔️
        </div>
        <div className="battle-units-row battle-anim-row" style={{ position: 'relative' }}>
          <div className="battle-unit-box battle-unit-box-left">
            <div className="battle-label">Erasotzailea</div>
            <div
              className={
                "battle-unit-img-wrapper" +
                (phase === 'attack' && !isRanged(attacker) ? ' attacking' : '') +
                (phase === 'attackerHit' && attackerDead ? ' dead' : '') +
                (phase === 'attackerHit' && !attackerDead ? ' hit' : '')
              }
            >
              <img
                src={`/images/units/${attacker.type}/${attacker.type}-default.png`}
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
              <span title="Rango" style={{ marginLeft: 12 }}>🎯 {attacker.range ?? 1}</span>
            </div>
          </div>
          {/* Proyectil del atacante */}
          {showProjectile && phase === 'attack' && isRanged(attacker) && (
            <div
              style={{
                position: 'absolute',
                left: 120,
                top: 60,
                width: getProjectileSize(attacker).width,
                height: getProjectileSize(attacker).height,
                pointerEvents: 'none',
                zIndex: 10,
                animation: 'projectile-move 0.35s linear forwards'
              }}
            >
              <img
                src={getProjectileImage(attacker)}
                alt="proyectil"
                style={{
                  width: getProjectileSize(attacker).width,
                  height: getProjectileSize(attacker).height,
                  transform: 'rotate(0deg)'
                }}
              />
            </div>
          )}
          {/* Proyectil del defensor */}
          {showProjectile && phase === 'counter' && isRanged(defender) && (
            <div
              style={{
                position: 'absolute',
                right: 120,
                top: 60,
                width: getProjectileSize(defender).width,
                height: getProjectileSize(defender).height,
                pointerEvents: 'none',
                zIndex: 10,
                animation: 'projectile-move-reverse 0.35s linear forwards'
              }}
            >
              <img
                src={getProjectileImage(defender)}
                alt="proyectil"
                style={{
                  width: getProjectileSize(defender).width,
                  height: getProjectileSize(defender).height,
                  transform: 'rotate(180deg)'
                }}
              />
            </div>
          )}
          <div className="battle-unit-box battle-unit-box-right">
            <div className="battle-label">Defendatzailea</div>
            <div
              className={
                "battle-unit-img-wrapper" +
                (phase === 'counter' && !isRanged(defender) ? ' attacking' : '') +
                (phase === 'defenderHit' && defenderDead ? ' dead' : '') +
                (phase === 'defenderHit' && !defenderDead ? ' hit' : '')
              }
            >
              <img
                src={`/images/units/${defender.type}/${defender.type}-eskubi.png`}
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
              <span title="Rango" style={{ marginLeft: 12 }}>🎯 {defender.range ?? 1}</span>
            </div>
          </div>
        </div>
        <div className="battle-flavor">
          {phase === 'end' && winner ? (
            isRanged(attacker)
              ? <>🎯 Eraso urrunetik egin da! 🎯</> // Mensaje especial para ataque lejano
              : (
                winner === 'attacker'
                  ? <>🏆 Erasotzaileak irabazi du!</>
                  : <>🏆 Defendatzaileak irabazi du!</>
              )
          ) : (
            <>
              <span role="img" aria-label="swords">🗡️</span>
              Hoberenak irabazi dezala!
              <span role="img" aria-label="shield">🛡️</span>
            </>
          )}
        </div>
      </div>
      {/* Animaciones de proyectil */}
      <style>
        {`
        @keyframes projectile-move {
          0% { left: 120px; opacity: 1; }
          100% { left: 320px; opacity: 0.7; }
        }
        @keyframes projectile-move-reverse {
          0% { right: 120px; opacity: 1; }
          100% { right: 320px; opacity: 0.7; }
        }
        `}
      </style>
    </div>
  );
};

export default BattleView;