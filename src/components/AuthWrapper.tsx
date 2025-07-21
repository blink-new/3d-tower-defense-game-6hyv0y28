import React, { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import type { User } from '../types/game'

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Tower Defense...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🏰 Tower Defense</h1>
            <p className="text-slate-300 text-lg">Strategic 3D Defense Game</p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Sign in to play</h2>
            <p className="text-slate-300 mb-6">
              Save your progress, compete on leaderboards, and unlock achievements!
            </p>
            
            <button
              onClick={() => blink.auth.login()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Sign In / Sign Up
            </button>
          </div>
          
          <div className="text-sm text-slate-400">
            <p>🎮 Multiple tower types</p>
            <p>👾 Progressive enemy waves</p>
            <p>🏆 Leaderboard competition</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children(user)}</>
}