import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { GameState, TowerType, Position, GRID_SIZE, CELL_SIZE, PATH_POINTS } from '../types/game';

interface GameSceneProps {
  gameState: GameState;
  selectedTowerType: TowerType | null;
  onTowerPlace: (x: number, z: number) => void;
}

// Grid component
const Grid: React.FC = () => {
  const gridLines = useMemo(() => {
    const lines = [];
    const halfSize = GRID_SIZE / 2;
    
    // Vertical lines
    for (let i = -halfSize; i <= halfSize; i++) {
      lines.push(
        <line key={`v${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                i * CELL_SIZE, 0, -halfSize * CELL_SIZE,
                i * CELL_SIZE, 0, halfSize * CELL_SIZE
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#334155" />
        </line>
      );
    }
    
    // Horizontal lines
    for (let i = -halfSize; i <= halfSize; i++) {
      lines.push(
        <line key={`h${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                -halfSize * CELL_SIZE, 0, i * CELL_SIZE,
                halfSize * CELL_SIZE, 0, i * CELL_SIZE
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#334155" />
        </line>
      );
    }
    
    return lines;
  }, []);

  return <group>{gridLines}</group>;
};

// Path component
const Path: React.FC = () => {
  const pathGeometry = useMemo(() => {
    const points = PATH_POINTS.map(p => new Vector3(p.x, p.y + 0.01, p.z));
    return points;
  }, []);

  return (
    <group>
      {pathGeometry.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, point.z]}>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
      ))}
    </group>
  );
};

// Tower component
interface TowerProps {
  tower: GameState['towers'][0];
}

const Tower: React.FC<TowerProps> = ({ tower }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={[tower.position.x, tower.position.y, tower.position.z]}>
      {/* Tower base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      
      {/* Tower turret */}
      <mesh ref={meshRef} position={[0, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.4]} />
        <meshStandardMaterial color={tower.type.color} />
      </mesh>
      
      {/* Range indicator (when selected) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[tower.type.range - 0.1, tower.type.range, 32]} />
        <meshBasicMaterial color={tower.type.color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// Enemy component
interface EnemyProps {
  enemy: GameState['enemies'][0];
}

const Enemy: React.FC<EnemyProps> = ({ enemy }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.1;
    }
  });

  const healthPercentage = enemy.health / enemy.maxHealth;

  return (
    <group position={[enemy.position.x, enemy.position.y, enemy.position.z]}>
      {/* Enemy body */}
      <mesh ref={meshRef} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color={enemy.type.color} />
      </mesh>
      
      {/* Health bar background */}
      <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.5, 0.1]} />
        <meshBasicMaterial color="#1F2937" />
      </mesh>
      
      {/* Health bar */}
      <mesh position={[-0.25 + (0.25 * healthPercentage), 0.61, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.5 * healthPercentage, 0.08]} />
        <meshBasicMaterial color={healthPercentage > 0.5 ? "#22C55E" : healthPercentage > 0.25 ? "#F59E0B" : "#EF4444"} />
      </mesh>
    </group>
  );
};

// Placement preview
interface PlacementPreviewProps {
  position: Position;
  towerType: TowerType;
  canPlace: boolean;
}

const PlacementPreview: React.FC<PlacementPreviewProps> = ({ position, towerType, canPlace }) => {
  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.2, 8]} />
        <meshStandardMaterial 
          color={canPlace ? towerType.color : "#EF4444"} 
          transparent 
          opacity={0.6} 
        />
      </mesh>
      
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[towerType.range - 0.1, towerType.range, 32]} />
        <meshBasicMaterial 
          color={canPlace ? towerType.color : "#EF4444"} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </group>
  );
};

// Clickable grid cells
interface GridCellProps {
  x: number;
  z: number;
  onTowerPlace: (x: number, z: number) => void;
  selectedTowerType: TowerType | null;
  canPlace: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ x, z, onTowerPlace, selectedTowerType, canPlace }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <mesh
      position={[x, 0, z]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => selectedTowerType && canPlace && onTowerPlace(x, z)}
    >
      <boxGeometry args={[CELL_SIZE, 0.01, CELL_SIZE]} />
      <meshStandardMaterial 
        color={hovered && selectedTowerType ? (canPlace ? "#22C55E" : "#EF4444") : "transparent"}
        transparent
        opacity={0.3}
      />
      {hovered && selectedTowerType && (
        <PlacementPreview 
          position={{ x: 0, y: 0, z: 0 }} 
          towerType={selectedTowerType} 
          canPlace={canPlace}
        />
      )}
    </mesh>
  );
};

export const GameScene: React.FC<GameSceneProps> = ({ gameState, selectedTowerType, onTowerPlace }) => {
  // Generate grid cells
  const gridCells = useMemo(() => {
    const cells = [];
    const halfSize = GRID_SIZE / 2;
    
    for (let x = -halfSize + 0.5; x < halfSize; x++) {
      for (let z = -halfSize + 0.5; z < halfSize; z++) {
        const gridX = Math.round(x);
        const gridZ = Math.round(z);
        
        // Check if position is valid for tower placement
        const isOnPath = PATH_POINTS.some(point => 
          Math.abs(point.x - gridX) < 0.5 && Math.abs(point.z - gridZ) < 0.5
        );
        const hasTower = gameState.towers.some(tower => 
          Math.abs(tower.position.x - gridX) < 0.5 && Math.abs(tower.position.z - gridZ) < 0.5
        );
        const canPlace = !isOnPath && !hasTower;
        
        cells.push(
          <GridCell
            key={`${gridX}-${gridZ}`}
            x={gridX}
            z={gridZ}
            onTowerPlace={onTowerPlace}
            selectedTowerType={selectedTowerType}
            canPlace={canPlace}
          />
        );
      }
    }
    
    return cells;
  }, [gameState.towers, selectedTowerType, onTowerPlace]);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      
      {/* Grid */}
      <Grid />
      
      {/* Path */}
      <Path />
      
      {/* Grid cells for interaction */}
      {gridCells}
      
      {/* Towers */}
      {gameState.towers.map(tower => (
        <Tower key={tower.id} tower={tower} />
      ))}
      
      {/* Enemies */}
      {gameState.enemies.map(enemy => (
        <Enemy key={enemy.id} enemy={enemy} />
      ))}
    </group>
  );
};