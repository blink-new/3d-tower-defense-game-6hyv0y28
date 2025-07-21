import React from 'react'
import { TowerDefenseGame } from './components/TowerDefenseGame'
import { AuthWrapper } from './components/AuthWrapper'

function App() {
  return (
    <AuthWrapper>
      {(user) => <TowerDefenseGame user={user} />}
    </AuthWrapper>
  )
}

export default App