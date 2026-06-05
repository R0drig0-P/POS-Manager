import { JSX, useState } from 'react'
import { AppConfig } from '../config'
import MobileBottomNav from '../components/admin/MobileBottomNav'
import AdminStats from '../components/admin/AdminStats'
import ManageWorkers from '../components/admin/ManageWorkers'
import ManageServices from '../components/admin/ManageServices'

export default function AdminDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'stats' | 'team' | 'catalog'>('stats')

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: AppConfig.theme.backgroundColor,
        minHeight: '100vh',
        width: '100vw',
        position: 'absolute',
        top: 0,
        left: 0,
        boxSizing: 'border-box',
        paddingBottom: '80px', // Espaço livre para a Navigation Bar no fundo
        overflowX: 'hidden'
      }}
    >
      <div style={{ padding: '24px 20px', backgroundColor: AppConfig.theme.surfaceColor, borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 40 }}>
        <h1 style={{ margin: 0, color: AppConfig.theme.primaryColor, fontSize: '22px', textAlign: 'center' }}>⚙️ Gestão - {AppConfig.companyName}</h1>
      </div>

      {/* CONTENTOR CENTRALIZADO: No telemóvel preenche tudo, no Desktop fica focado no centro parecendo telemóvel */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'team' && <ManageWorkers />}
        {activeTab === 'catalog' && <ManageServices />}
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
