import { JSX, CSSProperties } from 'react'
import { AppConfig } from '../../config'

interface MobileBottomNavProps {
  activeTab: 'stats' | 'clients' | 'team' | 'catalog'
  setActiveTab: (tab: 'stats' | 'clients' | 'team' | 'catalog') => void
}

const styles: Record<string, CSSProperties> = {
  navContainer: {
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
    paddingBottom: 'env(safe-area-inset-bottom)',
    borderTop: '1px solid #e5e7eb'
  },
  navButtonBase: {
    flex: 1,
    height: '100%',
    border: 'none',
    background: 'none',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    cursor: 'pointer'
  }
}

export default function MobileBottomNav({
  activeTab,
  setActiveTab
}: MobileBottomNavProps): JSX.Element {
  const getButtonStyle = (tabId: string): CSSProperties => ({
    ...styles.navButtonBase,
    color: activeTab === tabId ? AppConfig.theme.primaryColor : '#9ca3af',
    fontWeight: activeTab === tabId ? 'bold' : 'normal'
  })

  return (
    <div style={styles.navContainer}>
      <button onClick={() => setActiveTab('stats')} style={getButtonStyle('stats')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        Resumo
      </button>
      <button onClick={() => setActiveTab('clients')} style={getButtonStyle('clients')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        Clientes
      </button>
      <button onClick={() => setActiveTab('team')} style={getButtonStyle('team')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="3"></circle>
          <circle cx="6" cy="18" r="3"></circle>
          <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
          <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
          <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
        </svg>
        Equipa
      </button>
      <button onClick={() => setActiveTab('catalog')} style={getButtonStyle('catalog')}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
        Catálogo
      </button>
    </div>
  )
}
