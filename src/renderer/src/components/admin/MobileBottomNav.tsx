import { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from '../../config'

interface MobileBottomNavProps {
  activeTab: 'stats' | 'team' | 'catalog'
  setActiveTab: (tab: 'stats' | 'team' | 'catalog') => void
}

export default function MobileBottomNav({ activeTab, setActiveTab }: MobileBottomNavProps): JSX.Element {
  const navigate = useNavigate()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '75px',
        backgroundColor: AppConfig.theme.surfaceColor,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)', // Protege contra a barra do iPhone
        borderTop: '1px solid #e5e7eb'
      }}
    >
      <button
        onClick={() => setActiveTab('stats')}
        style={{ flex: 1, height: '100%', border: 'none', background: 'none', color: activeTab === 'stats' ? AppConfig.theme.primaryColor : '#9ca3af', fontWeight: activeTab === 'stats' ? 'bold' : 'normal', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '24px' }}>📊</span>
        Resumo
      </button>
      <button
        onClick={() => setActiveTab('team')}
        style={{ flex: 1, height: '100%', border: 'none', background: 'none', color: activeTab === 'team' ? AppConfig.theme.primaryColor : '#9ca3af', fontWeight: activeTab === 'team' ? 'bold' : 'normal', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '24px' }}>👥</span>
        Equipa
      </button>
      <button
        onClick={() => setActiveTab('catalog')}
        style={{ flex: 1, height: '100%', border: 'none', background: 'none', color: activeTab === 'catalog' ? AppConfig.theme.primaryColor : '#9ca3af', fontWeight: activeTab === 'catalog' ? 'bold' : 'normal', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '24px' }}>📋</span>
        Catálogo
      </button>
      <button
        onClick={() => navigate('/')}
        style={{ flex: 1, height: '100%', border: 'none', background: 'none', color: '#9ca3af', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '24px' }}>🔙</span>
        Sair
      </button>
    </div>
  )
}