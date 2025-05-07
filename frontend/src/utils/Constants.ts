import { TerrainType } from '../types';

export const TILE_SIZE = 140;

export const MAP_DEFAULT_SIZE = 50;

export const TILE_TYPES = {
  water: { color: 'rgb(89, 201, 238)', movementCost: Infinity, image: '/images/water.png' },
  grass: { color: 'lightgreen', movementCost: 1, image: '/images/grass.jpg' },
  mountain: { color: 'gray', movementCost: 3, image: '/images/rock.png' },
  forest: { color: 'darkgreen', movementCost: 2, image: '/images/grass.jpg' },
  desert: { color: 'goldenrod', movementCost: 2, image: '/images/ground.jpg' },
};

export const TECHS = [
  // Antzinaroa
  {
    id: 'nekazaritza',
    name: 'Nekazaritza',
    description: 'Eraikina: Aletegiak',
    image: '/images/techs/nekazaritza.jpg',
    parents: [],
    x: 80, y: 80,
    era: 'Antzinaroa',
    cost: { science: 10, gold: 5 },
  },
  {
    id: 'ehiza',
    name: 'Ehiza',
    description: 'Eraikina: Ehiztari etxola',
    image: '/images/techs/ehiza.jpg',
    parents: [],
    x: 80, y: 220,
    era: 'Antzinaroa',
    cost: { science: 8, gold: 4 },
  },
  {
    id: 'idazketa',
    name: 'Idazketa',
    description: 'Eraikina: Liburutegia',
    image: '/img/techs/idazketa.png',
    parents: [],
    x: 80, y: 360,
    era: 'Antzinaroa',
    cost: { science: 15, gold: 7 },
  },
  {
    id: 'brontzegintza',
    name: 'Brontzegintza',
    description: 'Eraikina: Arma tailerra',
    image: '/img/techs/brontzegintza.png',
    parents: [],
    x: 80, y: 500,
    era: 'Antzinaroa',
    cost: { science: 12, gold: 6 },
  },
  {
    id: 'gurpila',
    name: 'Gurpila',
    description: 'Eraikina: Errota',
    image: '/img/techs/gurpila.png',
    parents: [],
    x: 80, y: 640,
    era: 'Antzinaroa',
    cost: { science: 10, gold: 5 },
  },

  // Erdi Aroa
  {
    id: 'txanponak',
    name: 'Txanponak',
    description: 'Eraikina: Merkatua',
    image: '/img/techs/txanponak.png',
    parents: ['idazketa'],
    x: 320, y: 360,
    era: 'Erdi Aroa',
    cost: { science: 20, gold: 15 },
  },
  {
    id: 'ingeniaritza',
    name: 'Ingeniaritza',
    description: 'Eraikina: Akueduktua',
    image: '/img/techs/ingeniaritza.png',
    parents: ['gurpila'],
    x: 320, y: 640,
    era: 'Erdi Aroa',
    cost: { science: 22, gold: 12 },
  },
  {
    id: 'burdingintza',
    name: 'Burdingintza',
    description: 'Eraikina: Burdinola',
    image: '/img/techs/burdingintza.png',
    parents: ['brontzegintza'],
    x: 320, y: 500,
    era: 'Erdi Aroa',
    cost: { science: 18, gold: 10 },
  },
  {
    id: 'nabigazioa',
    name: 'Nabigazioa',
    description: 'Eraikina: Portua',
    image: '/img/techs/nabigazioa.png',
    parents: ['astronomia'],
    x: 560, y: 80,
    era: 'Erdi Aroa',
    cost: { science: 25, gold: 18 },
  },
  {
    id: 'teologia',
    name: 'Teologia',
    description: 'Eraikina: Tenplua',
    image: '/img/techs/teologia.png',
    parents: ['idazketa'],
    x: 320, y: 220,
    era: 'Erdi Aroa',
    cost: { science: 16, gold: 8 },
  },

  // Aro Modernoa
  {
    id: 'inprimategia',
    name: 'Inprimategia',
    description: 'Eraikina: Unibertsitatea',
    image: '/img/techs/inprimategia.png',
    parents: ['ingeniaritza'],
    x: 560, y: 640,
    era: 'Aro Modernoa',
    cost: { science: 30, gold: 20 },
  },
  {
    id: 'ehungintza',
    name: 'Ehungintza',
    description: 'Eraikina: Ehungintza lantegia',
    image: '/img/techs/ehungintza.png',
    parents: ['burdingintza'],
    x: 560, y: 500,
    era: 'Aro Modernoa',
    cost: { science: 28, gold: 14 },
  },
  {
    id: 'artilleria',
    name: 'Artilleria',
    description: 'Eraikina: Gotorlekua',
    image: '/img/techs/artilleria.png',
    parents: ['burdingintza'],
    x: 800, y: 500,
    era: 'Aro Modernoa',
    cost: { science: 35, gold: 25 },
  },
  {
    id: 'astronomia',
    name: 'Astronomia',
    description: 'Eraikina: Behatokia',
    image: '/img/techs/astronomia.png',
    parents: ['matematika'],
    x: 320, y: 80,
    era: 'Aro Modernoa',
    cost: { science: 32, gold: 18 },
  },
  {
    id: 'medikuntza',
    name: 'Medikuntza',
    description: 'Eraikina: Ospitalea',
    image: '/img/techs/medikuntza.png',
    parents: ['unibertsitatea'],
    x: 800, y: 640,
    era: 'Aro Modernoa',
    cost: { science: 40, gold: 30 },
  },
  // Puedes añadir 'matematika' y 'unibertsitatea' si quieres que las dependencias sean correctas
];

export const TERRAIN_TYPES: TerrainType[] = Object.keys(TILE_TYPES) as TerrainType[];