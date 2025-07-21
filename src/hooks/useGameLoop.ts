import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Tower, Enemy, TowerType, Position, ENEMY_TYPES, PATH_POINTS } from '../types/game';

const INITIAL_GAME_STATE: GameState = {
  health: 20,
  gold: 100,
  score: 0,
  wave: 1,
  isPlaying: false,
  isPaused: false,
  gameOver: false,
  victory: false,
  selectedTowerType: null,
  towers: [],
  enemies: [],
  waveProgress: 0,
  waveEnemiesSpawned: 0,
  waveEnemiesTotal: 0
};

export const useGameLoop = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const enemySpawnTimerRef = useRef<number>(0);

  // Calculate path position for enemies
  const getPathPosition = useCallback((progress: number): Position => {
    const totalSegments = PATH_POINTS.length - 1;
    const segmentProgress = progress * totalSegments;
    const segmentIndex = Math.floor(segmentProgress);
    const segmentT = segmentProgress - segmentIndex;

    if (segmentIndex >= totalSegments) {
      return PATH_POINTS[PATH_POINTS.length - 1];
    }

    const start = PATH_POINTS[segmentIndex];
    const end = PATH_POINTS[segmentIndex + 1];

    return {
      x: start.x + (end.x - start.x) * segmentT,
      y: start.y + (end.y - start.y) * segmentT,
      z: start.z + (end.z - start.z) * segmentT
    };
  }, []);

  // Calculate distance between two positions
  const getDistance = useCallback((pos1: Position, pos2: Position): number => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, []);

  // Find closest enemy in range for a tower
  const findTarget = useCallback((tower: Tower, enemies: Enemy[]): Enemy | undefined => {
    let closestEnemy: Enemy | undefined;
    let closestDistance = Infinity;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      
      const distance = getDistance(tower.position, enemy.position);
      if (distance <= tower.type.range && distance < closestDistance) {
        closestEnemy = enemy;
        closestDistance = distance;
      }
    }

    return closestEnemy;
  }, [getDistance]);

  // Spawn enemy
  const spawnEnemy = useCallback((wave: number): Enemy => {
    const enemyTypeIndex = Math.floor(Math.random() * ENEMY_TYPES.length);
    const enemyType = ENEMY_TYPES[enemyTypeIndex];
    
    // Scale enemy health and reward based on wave
    const scaledHealth = Math.floor(enemyType.health * (1 + wave * 0.2));
    const scaledReward = Math.floor(enemyType.reward * (1 + wave * 0.1));

    return {
      id: `enemy-${Date.now()}-${Math.random()}`,
      type: { ...enemyType, health: scaledHealth, reward: scaledReward },
      position: getPathPosition(0),
      health: scaledHealth,
      maxHealth: scaledHealth,
      pathProgress: 0,
      isDead: false
    };
  }, [getPathPosition]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = currentTime;
    const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
    lastTimeRef.current = currentTime;

    setGameState(prevState => {
      if (!prevState.isPlaying || prevState.isPaused || prevState.gameOver || prevState.victory) {
        return prevState;
      }

      const newState = { ...prevState };

      // Spawn enemies
      if (newState.waveEnemiesSpawned < newState.waveEnemiesTotal) {
        enemySpawnTimerRef.current += deltaTime;
        if (enemySpawnTimerRef.current >= 1) { // Spawn every 1 second
          const newEnemy = spawnEnemy(newState.wave);
          newState.enemies = [...newState.enemies, newEnemy];
          newState.waveEnemiesSpawned++;
          enemySpawnTimerRef.current = 0;
        }
      }

      // Update enemies
      newState.enemies = newState.enemies.map(enemy => {
        if (enemy.isDead) return enemy;

        // Move enemy along path
        const newProgress = enemy.pathProgress + (enemy.type.speed * deltaTime * 0.1);
        const newPosition = getPathPosition(newProgress);

        // Check if enemy reached the end
        if (newProgress >= 1) {
          newState.health--;
          return { ...enemy, isDead: true, pathProgress: 1 };
        }

        return {
          ...enemy,
          pathProgress: newProgress,
          position: newPosition
        };
      });

      // Tower targeting and shooting
      const currentTime = Date.now();
      newState.towers = newState.towers.map(tower => {
        const target = findTarget(tower, newState.enemies);
        const canFire = currentTime - tower.lastFired >= (1000 / tower.type.fireRate);

        if (target && canFire) {
          // Deal damage to target
          const targetIndex = newState.enemies.findIndex(e => e.id === target.id);
          if (targetIndex !== -1) {
            const updatedEnemy = { ...newState.enemies[targetIndex] };
            updatedEnemy.health -= tower.type.damage;
            
            if (updatedEnemy.health <= 0) {
              updatedEnemy.isDead = true;
              newState.gold += updatedEnemy.type.reward;
              newState.score += updatedEnemy.type.reward * 10;
            }
            
            newState.enemies[targetIndex] = updatedEnemy;
          }

          return { ...tower, lastFired: currentTime, target };
        }

        return { ...tower, target };
      });

      // Remove dead enemies
      newState.enemies = newState.enemies.filter(enemy => !enemy.isDead);

      // Check win condition
      if (newState.waveEnemiesSpawned >= newState.waveEnemiesTotal && newState.enemies.length === 0) {
        if (newState.wave >= 10) {
          newState.victory = true;
          newState.isPlaying = false;
        } else {
          // Prepare next wave
          newState.wave++;
          newState.waveEnemiesTotal = Math.min(5 + newState.wave * 2, 20);
          newState.waveEnemiesSpawned = 0;
          newState.gold += 50; // Wave completion bonus
          newState.isPlaying = false;
          enemySpawnTimerRef.current = 0;
        }
      }

      // Check lose condition
      if (newState.health <= 0) {
        newState.gameOver = true;
        newState.isPlaying = false;
      }

      return newState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [spawnEnemy, getPathPosition, findTarget]);

  // Start game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameLoop]);

  // Game actions
  const startWave = useCallback(() => {
    setGameState(prevState => {
      if (prevState.isPlaying) return prevState;
      
      const waveEnemiesTotal = Math.min(5 + prevState.wave * 2, 20);
      return {
        ...prevState,
        isPlaying: true,
        isPaused: false,
        waveEnemiesTotal,
        waveEnemiesSpawned: 0
      };
    });
    enemySpawnTimerRef.current = 0;
    lastTimeRef.current = 0;
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isPaused: !prevState.isPaused
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
    enemySpawnTimerRef.current = 0;
    lastTimeRef.current = 0;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  const placeTower = useCallback((towerType: TowerType, position: Position) => {
    setGameState(prevState => {
      if (prevState.gold < towerType.cost) return prevState;

      const newTower: Tower = {
        id: `tower-${Date.now()}-${Math.random()}`,
        type: towerType,
        position,
        lastFired: 0,
        level: 1
      };

      return {
        ...prevState,
        towers: [...prevState.towers, newTower],
        gold: prevState.gold - towerType.cost
      };
    });
  }, []);

  return {
    ...gameState,
    startWave,
    pauseGame,
    resetGame,
    placeTower
  };
};