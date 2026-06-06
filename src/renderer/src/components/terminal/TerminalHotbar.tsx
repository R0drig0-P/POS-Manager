import { JSX, CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from '../../config'

const styles: Record<string, CSSProperties> = {
  footer: {
    height: '80px',
    backgroundColor: AppConfig.theme.primaryColor,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    flexShrink: 0,
    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',
    zIndex: 30
  },
  leftContainer: {
    display: 'flex',
    gap: '16px'
  },
  actionButton: {
    padding: '12px 24px',
    backgroundColor: '#374151',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  adminButton: {
    padding: '12px 32px',
    backgroundColor: AppConfig.theme.secondaryColor,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  }
}

export default function TerminalHotbar(): JSX.Element {
  const navigate = useNavigate()

  return (
    <footer style={styles.footer}>
      <div style={styles.leftContainer}>
        <button style={styles.actionButton}>Adicionar Trabalhador</button>

        {AppConfig.features.enableClients && <button style={styles.actionButton}>Clientes</button>}

        {AppConfig.features.enableProducts && <button style={styles.actionButton}>Produtos</button>}
      </div>

      <div>
        <button onClick={() => navigate('/admin')} style={styles.adminButton}>
          Admin
        </button>
      </div>
    </footer>
  )
}
