import { HashRouter, Routes, Route } from 'react-router-dom'
import { JSX } from 'react/jsx-runtime'
import AdminDashboard from './pages/AdminDashboard'
import WorkerTerminal from './pages/WorkerTerminal'

function App(): JSX.Element {
  return (
    <HashRouter>
      <Routes>
        {/* Rota principal que abre logo no PC da barbearia */}
        <Route path="/" element={<WorkerTerminal />} />

        {/* Rota de administração (Patrão) */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </HashRouter>
  )
}

export default App
