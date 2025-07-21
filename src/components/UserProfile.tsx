import React from 'react'
import { blink } from '../blink/client'
import type { User } from '../types/game'

interface UserProfileProps {
  user: User
  isOpen: boolean
  onClose: () => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null

  const handleSignOut = () => {
    blink.auth.logout()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">👤 Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl text-white">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-white font-semibold text-lg">
            {user.displayName || 'Player'}
          </h3>
          <p className="text-slate-400 text-sm">{user.email}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}