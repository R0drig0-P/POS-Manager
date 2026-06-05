import { JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from '../../config'

export default function TerminalHotbar(): JSX.Element {
  const navigate = useNavigate()

  return (
    <footer
      style={{
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
      }}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        <button
          style={{ padding: '12px 24px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
          ➕ Adicionar Trabalhador
        </button>
        
        {AppConfig.features.enableProducts && (
          <button
            style={{ padding: '12px 24px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            📦 Produtos
          </button>
        )}
        
        {AppConfig.features.enableClients && (
          <button
            style={{ padding: '12px 24px', backgroundColor: '#374151', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            👥 Clientes
          </button>
        )}
      </div>
      
      <div>
        <button
          onClick={() => navigate('/admin')}
          style={{
            padding: '12px 32px',
            backgroundColor: AppConfig.theme.secondaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ⚙️ Admin
        </button>
      </div>
    </footer>
  )
}