export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface TowerType {
  id: string;
  name: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  color: string;
  description: string;
}

export interface Tower {
  id: string;
  type: TowerType;
  position: Position;
  lastFired: number;
  target?: Enemy;
  level: number;
}

export interface EnemyType {
  id: string;
  name: string;
  health: number;
  speed: number;
  reward: number;
  color: string;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  position: Position;
  health: number;
  maxHealth: number;
  pathProgress: number;
  isDead: boolean;
}

export interface GameState {
  health: number;
  gold: number;
  score: number;
  wave: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
  selectedTowerType: TowerType | null;
  towers: Tower[];
  enemies: Enemy[];
  waveProgress: number;
  waveEnemiesSpawned: number;
  waveEnemiesTotal: number;
}

export interface Projectile {
  id: string;
  position: Position;
  target: Position;
  damage: number;
  speed: number;
  color: string;
}

export interface GameSession {
  id: string;
  userId: string;
  score: number;
  wave: number;
  completedAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
}

// Game constants
export const TOWER_TYPES: TowerType[] = [
  {
    id: 'cannon',
    name: 'Cannon',
    cost: 50,
    damage: 25,
    range: 3,
    fireRate: 1,
    color: '#8B5CF6',
    description: 'Basic tower with moderate damage'
  },
  {
    id: 'laser',
    name: 'Laser',
    cost: 75,
    damage: 15,
    range: 4,
    fireRate: 2,
    color: '#EF4444',
    description: 'Fast firing laser tower'
  },
  {
    id: 'missile',
    name: 'Missile',
    cost: 100,
    damage: 50,
    range: 5,
    fireRate: 0.5,
    color: '#F59E0B',
    description: 'High damage, slow firing'
  },
  {
    id: 'freeze',
    name: 'Freeze',
    cost: 80,
    damage: 10,
    range: 2.5,
    fireRate: 1.5,
    color: '#06B6D4',
    description: 'Slows enemies down'
  }
];

export const ENEMY_TYPES: EnemyType[] = [
  {
    id: 'basic',
    name: 'Basic',
    health: 50,
    speed: 1,
    reward: 10,
    color: '#EF4444'
  },
  {
    id: 'fast',
    name: 'Fast',
    health: 30,
    speed: 2,
    reward: 15,
    color: '#F59E0B'
  },
  {
    id: 'heavy',
    name: 'Heavy',
    health: 100,
    speed: 0.5,
    reward: 25,
    color: '#8B5CF6'
  },
  {
    id: 'flying',
    name: 'Flying',
    health: 40,
    speed: 1.5,
    reward: 20,
    color: '#06B6D4'
  }
];

export const GRID_SIZE = 10;
export const CELL_SIZE = 1;
export const PATH_POINTS: Position[] = [
  { x: -4, y: 0, z: 4 },
  { x: -2, y: 0, z: 4 },
  { x: -2, y: 0, z: 2 },
  { x: 2, y: 0, z: 2 },
  { x: 2, y: 0, z: -2 },
  { x: -2, y: 0, z: -2 },
  { x: -2, y: 0, z: -4 },
  { x: 4, y: 0, z: -4 }
];