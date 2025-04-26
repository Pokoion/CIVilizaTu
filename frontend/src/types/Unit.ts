export interface Unit {
    id: string;
    name: string;
    owner: string;
    position: { x: number; y: number };
    attack: number;
    defense: number;
    movementPoints: number;
  }