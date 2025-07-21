import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GameScene } from './GameScene';
import { GameUI } from './GameUI';
import { useGameLoop } from '../hooks/useGameLoop';
import { TowerType, TOWER_TYPES, User } from '../types/game';

interface TowerDefenseGameProps {
  user: User;
}

export const TowerDefenseGame: React.FC<TowerDefenseGameProps> = ({ user }) => {
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const gameState = useGameLoop();

  const handleTowerSelect = useCallback((towerType: TowerType) => {
    if (gameState.gold >= towerType.cost) {
      setSelectedTowerType(towerType);
    }
  }, [gameState.gold]);

  const handleTowerPlace = useCallback((x: number, z: number) => {
    if (selectedTowerType && gameState.gold >= selectedTowerType.cost) {
      gameState.placeTower(selectedTowerType, { x, y: 0, z });
      setSelectedTowerType(null);
    }
  }, [selectedTowerType, gameState]);

  return (
    <div className="w-full h-screen bg-slate-900 relative overflow-hidden">
      {/* 3D Game Canvas */}
      <Canvas
        camera={{ position: [8, 8, 8], fov: 60 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <GameScene
          gameState={gameState}
          selectedTowerType={selectedTowerType}
          onTowerPlace={handleTowerPlace}
        />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>

      {/* Game UI Overlay */}
      <GameUI
        gameState={gameState}
        selectedTowerType={selectedTowerType}
        onTowerSelect={handleTowerSelect}
        onStartWave={gameState.startWave}
        onPauseGame={gameState.pauseGame}
        onResetGame={gameState.resetGame}
        user={user}
      />
    </div>
  );
};