import { JSX, CSSProperties, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppConfig } from '../../config'
import { supabase } from '../../lib/supabase'

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
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '320px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 25px 30px -5px rgba(0,0,0,0.1)' },
  modalTitle: { margin: 0, fontSize: '20px', textAlign: 'center', color: AppConfig.theme.primaryColor },
  input: { padding: '16px', fontSize: '28px', textAlign: 'center', letterSpacing: '8px', border: '1px solid #d1d5db', borderRadius: '8px', WebkitAppRegion: 'no-drag', WebkitUserSelect: 'text', userSelect: 'text' },
  buttonRow: { display: 'flex', gap: '12px' },
  submitBtn: { flex: 1, padding: '14px', backgroundColor: AppConfig.theme.primaryColor, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }
}

interface TerminalHotbarProps {
  onAddWorker?: () => void
}

export default function TerminalHotbar({ onAddWorker }: TerminalHotbarProps): JSX.Element {
  const navigate = useNavigate()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  async function handleLogin(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!password) return
    setIsVerifying(true)
    
    const { data, error } = await supabase.from('settings').select('value').eq('id', 'admin_password').single()
    setIsVerifying(false)
    
    const correctPassword = data && !error ? data.value : '1234'
    
    if (password === correctPassword) {
      navigate('/admin')
    } else {
      alert('Senha incorreta!')
      setPassword('')
    }
  }

  return (
    <footer style={styles.footer}>
      <div style={styles.leftContainer}>
        <button style={styles.actionButton} onClick={onAddWorker}>Adicionar Trabalhador</button>
      </div>

      <div>
        <button onClick={() => { setPassword(''); setIsLoginOpen(true) }} style={styles.adminButton}>
          Admin
        </button>
      </div>

      {isLoginOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsLoginOpen(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Acesso Reservado</h3>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="****" style={styles.input} autoFocus />
              <div style={styles.buttonRow}>
                <button type="button" onClick={() => setIsLoginOpen(false)} style={styles.cancelBtn}>Cancelar</button>
                <button type="submit" style={styles.submitBtn} disabled={isVerifying}>{isVerifying ? '...' : 'Entrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  )
}
