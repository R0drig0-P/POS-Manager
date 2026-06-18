import { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

export interface Role {
  id: string
  name: string
}

interface ManageRolesPopupProps {
  onClose: () => void
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
    alignItems: 'center', justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#fff', padding: '24px', borderRadius: '16px',
    width: '380px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column', gap: '16px'
  },
  title: { margin: 0, fontSize: '20px', color: AppConfig.theme.primaryColor },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '40vh', overflowY: 'auto' },
  listItem: { display: 'flex', gap: '8px', alignItems: 'center' },
  input: { flex: 1, padding: '10px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', WebkitAppRegion: 'no-drag', color: '#111827' },
  addButton: { padding: '10px 16px', backgroundColor: AppConfig.theme.primaryColor, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  iconButton: { padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  closeButton: { padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '8px' }
}

export default function ManageRolesPopup({ onClose }: ManageRolesPopupProps): JSX.Element {
  const [roles, setRoles] = useState<Role[]>([])
  const [newRoleName, setNewRoleName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  async function fetchRoles(): Promise<void> {
    const { data } = await supabase.from('roles').select('*').order('name')
    if (data) setRoles(data)
  }

  async function addRole(): Promise<void> {
    if (!newRoleName.trim()) return
    const { error } = await supabase.from('roles').insert([{ name: newRoleName.trim() }])
    if (error) {
      alert('Erro ao adicionar função: ' + error.message)
    } else {
      setNewRoleName('')
      fetchRoles()
    }
  }

  async function deleteRole(id: string): Promise<void> {
    if (!window.confirm('Tens a certeza que queres apagar esta função do catálogo? Os trabalhadores atuais vão mantê-la até a alterares.')) return
    await supabase.from('roles').delete().eq('id', id)
    fetchRoles()
  }

  async function startEdit(role: Role): Promise<void> {
    setEditingId(role.id)
    setEditName(role.name)
  }

  async function saveEdit(id: string, oldName: string): Promise<void> {
    if (!editName.trim() || editName.trim() === oldName) return setEditingId(null)
    
    const newName = editName.trim()
    await supabase.from('roles').update({ name: newName }).eq('id', id)
    
    // Atualiza o nome da função em todos os trabalhadores antigos que a tinham!
    const { data: workers } = await supabase.from('workers').select('id, roles')
    if (workers) {
      for (const worker of workers) {
        if (worker.roles && worker.roles.includes(oldName)) {
          const updatedRoles = worker.roles.map((r) => (r === oldName ? newName : r))
          await supabase.from('workers').update({ roles: updatedRoles }).eq('id', worker.id)
        }
      }
    }
    setEditingId(null)
    fetchRoles()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Gerir Funções</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''))} placeholder="Nova função..." style={styles.input} />
          <button onClick={addRole} style={styles.addButton}>Adicionar</button>
        </div>
        <ul style={styles.list}>
          {roles.map((role) => (
            <li key={role.id} style={styles.listItem}>
              {editingId === role.id ? (
                <><input value={editName} onChange={(e) => setEditName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''))} style={styles.input} autoFocus /><button onClick={() => saveEdit(role.id, role.name)} style={{ ...styles.iconButton, color: AppConfig.theme.successColor }}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></button></>
              ) : (
                <><div style={{ flex: 1, fontSize: '16px', color: '#374151' }}>{role.name}</div><button onClick={() => startEdit(role)} style={{ ...styles.iconButton, color: AppConfig.theme.primaryColor }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button><button onClick={() => deleteRole(role.id)} style={{ ...styles.iconButton, color: AppConfig.theme.dangerColor }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></>
              )}
            </li>
          ))}
        </ul>
        <button onClick={onClose} style={styles.closeButton}>Fechar</button>
      </div>
    </div>
  )
}