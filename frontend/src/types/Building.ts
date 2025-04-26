export interface Building {
    id: string;
    name: string;
    owner: string;
    position: { x: number; y: number };
    type: 'city' | 'farm' | 'barracks';
    health: number;
  }