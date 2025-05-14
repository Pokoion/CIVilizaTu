import { Unit } from '../types';

export function cleanUnit(u: Unit) {
  return {
    id: u.id,
    type: u.type,
    position: u.position,
    movement_points: u.movement_points,
    movement_points_left: u.movement_points_left,
    strength: u.strength,
    health: u.health,
    range: u.range
  };
}