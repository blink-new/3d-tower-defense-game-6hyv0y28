import React, { useState, useCallback } from 'react'
import { GameState, TowerType, TOWER_TYPES, User } from '../types/game'
import { Leaderboard } from './Leaderboard'
import { UserProfile } from './UserProfile'
import { blink } from '../blink/client'

interface GameUIProps {
  gameState: GameState
  selectedTowerType: TowerType | null
  onTowerSelect: (towerType: TowerType) => void
  onStartWave: () => void
  onPauseGame: () => void
  onResetGame: () => void
  user: User
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  selectedTowerType,
  onTowerSelect,
  onStartWave,
  onPauseGame,
  onResetGame,
  user
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const saveGameSession = useCallback(async () => {
    try {
      await blink.db.gameSessions.create({
        userId: user.id,
        score: gameState.score,
        wave: gameState.wave,
        completedAt: gameState.victory ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to save game session:', error)
    }
  }, [user.id, gameState.score, gameState.wave, gameState.victory])

  // Save session when game ends
  React.useEffect(() => {
    if (gameState.gameOver || gameState.victory) {
      saveGameSession()
    }
  }, [gameState.gameOver, gameState.victory, saveGameSession])

  return (
    <>
      {/* Top Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="bg-slate-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            {/* Left: Resources */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-red-400">❤️</span>
                <span className="text-lg font-semibold text-white">{gameState.health}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">🪙</span>
                <span className="text-lg font-semibold text-white">{gameState.gold}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">🏆</span>
                <span className="text-lg font-semibold text-white">{gameState.score}</span>
              </div>
            </div>

            {/* Center: Wave Info */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Wave {gameState.wave}
              </div>
              <div className="w-48">
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span>Enemies</span>
                  <span>{gameState.waveEnemiesSpawned}/{gameState.waveEnemiesTotal}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gameState.waveEnemiesSpawned / gameState.waveEnemiesTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: User & Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLeaderboard(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🏆 Leaderboard
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                👤 {user.email.split('@')[0]}
              </button>
              {!gameState.isPlaying ? (
                <button 
                  onClick={onStartWave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ▶️ Start Wave
                </button>
              ) : (
                <button 
                  onClick={onPauseGame}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
              )}
              <button 
                onClick={onResetGame}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tower Selection Panel */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-slate-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">🏰 Tower Selection</h3>
          <div className="grid grid-cols-2 gap-3">
            {TOWER_TYPES.map(towerType => {
              const canAfford = gameState.gold >= towerType.cost
              const isSelected = selectedTowerType?.id === towerType.id
              
              return (
                <button
                  key={towerType.id}
                  onClick={() => canAfford && onTowerSelect(towerType)}
                  disabled={!canAfford}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-600 bg-opacity-20' 
                      : canAfford 
                        ? 'border-slate-600 bg-slate-700 hover:bg-slate-600' 
                        : 'border-slate-700 bg-slate-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: towerType.color }}
                    />
                    <div className="text-center">
                      <div className="font-semibold text-sm text-white">{towerType.name}</div>
                      <div className="text-xs text-slate-300">{towerType.description}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-yellow-400">🪙</span>
                        <span className="text-sm font-medium text-white">{towerType.cost}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {selectedTowerType && (
            <div className="mt-4 p-3 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-500">
              <div className="text-sm font-semibold mb-2 text-white">Selected: {selectedTowerType.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>Damage: {selectedTowerType.damage}</div>
                <div>Range: {selectedTowerType.range}</div>
                <div>Fire Rate: {selectedTowerType.fireRate}/s</div>
                <div>Cost: {selectedTowerType.cost}</div>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Click on the grid to place this tower
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <h2 className="text-center text-2xl text-red-500 font-bold mb-4">💀 Game Over!</h2>
            <div className="text-center mb-6">
              <div className="text-lg mb-2 text-white">Final Score: {gameState.score.toLocaleString()}</div>
              <div className="text-sm text-slate-400">You reached wave {gameState.wave}</div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLeaderboard(true)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                🏆 Leaderboard
              </button>
              <button 
                onClick={onResetGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {gameState.victory && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
            <h2 className="text-center text-2xl text-green-500 font-bold mb-4">🎉 Victory!</h2>
            <div className="text-center mb-6">
              <div className="text-lg mb-2 text-white">Congratulations!</div>
              <div className="text-lg mb-2 text-white">Final Score: {gameState.score.toLocaleString()}</div>
              <div className="text-sm text-slate-400">You defended against all 10 waves!</div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLeaderboard(true)}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                🏆 Leaderboard
              </button>
              <button 
                onClick={onResetGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                🔄 Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameState.isPlaying && gameState.wave === 1 && gameState.towers.length === 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-slate-800 bg-opacity-90 backdrop-blur-sm rounded-lg p-4 border border-slate-700 w-80">
            <h3 className="text-lg font-semibold text-white mb-3">🎮 How to Play</h3>
            <div className="text-sm space-y-2 text-slate-300">
              <div>• Select a tower from the panel on the left</div>
              <div>• Click on the grid to place towers</div>
              <div>• Towers will automatically attack enemies in range</div>
              <div>• Prevent enemies from reaching the end of the path</div>
              <div>• Survive 10 waves to win!</div>
              <div className="pt-3">
                <button 
                  onClick={onStartWave}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  🚀 Start First Wave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Leaderboard 
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentScore={gameState.score}
      />
      <UserProfile 
        user={user}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  )
}