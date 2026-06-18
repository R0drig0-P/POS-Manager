import { JSX, CSSProperties, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from '../config'
import { supabase } from '../lib/supabase'
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
  contentWrapper: { width: '100%', maxWidth: '600px', margin: '0 auto' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 30px -5px rgba(0,0,0,0.1)' },
  modalTitle: { margin: 0, fontSize: '20px', textAlign: 'center', color: AppConfig.theme.primaryColor },
  input: { padding: '16px', fontSize: '16px', textAlign: 'center', border: '1px solid #d1d5db', borderRadius: '8px', WebkitAppRegion: 'no-drag', WebkitUserSelect: 'text', userSelect: 'text' },
  buttonRow: { display: 'flex', gap: '12px' },
  submitBtn: { flex: 1, padding: '14px', backgroundColor: AppConfig.theme.primaryColor, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
}

export default function AdminDashboard(): JSX.Element {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'stats' | 'clients' | 'team' | 'catalog'>('stats')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleChangePassword(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newPassword.trim()) return
    setIsSaving(true)
    const { error } = await supabase.from('settings').update({ value: newPassword }).eq('id', 'admin_password')
    setIsSaving(false)
    
    if (error) alert('Erro ao alterar senha: ' + error.message)
    else {
      alert('Senha alterada com sucesso!')
      setIsSettingsOpen(false)
      setNewPassword('')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Gestão</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setNewPassword(''); setIsSettingsOpen(true) }} style={styles.exitButton} title="Definições">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
          <button onClick={() => navigate('/')} style={styles.exitButton}>
            Sair
          </button>
        </div>
      </div>

      {/* CONTENTOR CENTRALIZADO: No telemóvel preenche tudo, no Desktop fica focado no centro parecendo telemóvel */}
      <div style={styles.contentWrapper}>
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'clients' && <ManageClients />}
        {activeTab === 'team' && <ManageWorkers />}
        {activeTab === 'catalog' && <ManageServices />}
      </div>

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {isSettingsOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsSettingsOpen(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Alterar Senha Admin</h3>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova Senha" style={styles.input} autoFocus />
              <div style={styles.buttonRow}>
                <button type="button" onClick={() => setIsSettingsOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.submitBtn} disabled={isSaving}>{isSaving ? '...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
