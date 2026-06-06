import { JSX, CSSProperties, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from '../config'
import MobileBottomNav from '../components/admin/MobileBottomNav'
import AdminStats from '../components/admin/AdminStats'
import ManageWorkers from '../components/admin/ManageWorkers'
import ManageServices from '../components/admin/ManageServices'
import ManageClients from '../components/admin/ManageClients'

const styles: Record<string, CSSProperties> = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: AppConfig.theme.backgroundColor,
    minHeight: '100vh',
    width: '100vw',
    position: 'absolute',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    paddingBottom: '80px',
    overflowX: 'hidden'
  },
  header: {
    padding: '16px 20px',
    backgroundColor: AppConfig.theme.surfaceColor,
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    margin: 0,
    color: AppConfig.theme.primaryColor,
    fontSize: '22px'
  },
  exitButton: {
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  contentWrapper: { width: '100%', maxWidth: '600px', margin: '0 auto' }
}

export default function AdminDashboard(): JSX.Element {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'stats' | 'clients' | 'team' | 'catalog'>('stats')

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Gestão</h1>
        <button onClick={() => navigate('/')} style={styles.exitButton}>
          Sair
        </button>
      </div>

      {/* CONTENTOR CENTRALIZADO: No telemóvel preenche tudo, no Desktop fica focado no centro parecendo telemóvel */}
      <div style={styles.contentWrapper}>
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'clients' && <ManageClients />}
        {activeTab === 'team' && <ManageWorkers />}
        {activeTab === 'catalog' && <ManageServices />}
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
