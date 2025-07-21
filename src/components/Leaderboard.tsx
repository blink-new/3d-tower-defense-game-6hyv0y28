import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import type { GameSession } from '../types/game'

interface LeaderboardProps {
  isOpen: boolean
  onClose: () => void
  currentScore?: number
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, currentScore }) => {
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(false)

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const data = await blink.db.gameSessions.list({
        orderBy: { score: 'desc' },
        limit: 10
      })
      setSessions(data)
    } catch (error) {
      console.error('Failed to load leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-slate-300">Loading scores...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No scores yet. Be the first!</p>
            ) : (
              sessions.map((session, index) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    currentScore === session.score
                      ? 'bg-blue-600 bg-opacity-30 border border-blue-500'
                      : 'bg-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-amber-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        Player {session.userId.slice(-6)}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Wave {session.wave}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">
                      {session.score.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}