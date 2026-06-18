import React, { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'
import ManageRolesPopup, { Role } from './ManageRolesPopup'

interface Worker {
  id: string
  name: string
  commission_services: number
  commission_products: number
  is_active: boolean
  roles?: string[]
  is_archived?: boolean
}

const styles: Record<string, CSSProperties> = {
  container: { padding: '20px' },
  section: {
    padding: '20px',
    backgroundColor: AppConfig.theme.surfaceColor,
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionTitle: { marginTop: 0, fontSize: '18px', color: AppConfig.theme.primaryColor },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    padding: '14px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    WebkitAppRegion: 'no-drag',
    WebkitUserSelect: 'text',
    userSelect: 'text'
  },
  inputRow: { display: 'flex', gap: '12px' },
  inputHalf: {
    padding: '14px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    flex: 1,
    WebkitAppRegion: 'no-drag',
    WebkitUserSelect: 'text',
    userSelect: 'text'
  },
  submitButton: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: AppConfig.theme.primaryColor,
    color: '#fff',
    border: 'none',
    borderRadius: '8px'
  },
  listSection: { marginTop: '30px' },
  listTitle: { fontSize: '18px', color: '#374151', paddingLeft: '4px' },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listItem: {
    padding: '16px 20px',
    backgroundColor: AppConfig.theme.surfaceColor,
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  workerName: { fontSize: '18px', color: AppConfig.theme.primaryColor },
  workerCommissions: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  workerRoles: {
    fontSize: '12px',
    color: AppConfig.theme.secondaryColor,
    marginTop: '6px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  emptyMessage: { color: '#6b7280', textAlign: 'center', marginTop: '20px' }
}

export default function ManageWorkers(): JSX.Element {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [newName, setNewName] = useState('')
  const [commServices, setCommServices] = useState<number | ''>(
    AppConfig.defaults.commissionServices
  )
  const [commProducts, setCommProducts] = useState<number | ''>(
    AppConfig.defaults.commissionProducts
  )

  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false)

  useEffect(() => {
    fetchWorkers()
    fetchRoles()
  }, [])

  async function fetchRoles(): Promise<void> {
    const { data } = await supabase.from('roles').select('*').order('name')
    if (data) setAvailableRoles(data)
  }

  async function fetchWorkers(): Promise<void> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Erro a carregar trabalhadores:', error)
    } else {
      setWorkers((data || []).filter((w) => !w.is_archived))
    }
  }

  async function toggleWorkerStatus(worker: Worker): Promise<void> {
    const { error } = await supabase
      .from('workers')
      .update({ is_active: !worker.is_active })
      .eq('id', worker.id)

    if (error) alert('Erro ao atualizar estado: ' + error.message)
    else fetchWorkers()
  }

  async function archiveWorker(id: string): Promise<void> {
    if (!window.confirm('Tens a certeza que queres remover este trabalhador? Se não tiver vendas será apagado definitivamente, caso contrário será arquivado para manter o histórico.')) return
    
    // 1. Verifica se o trabalhador já tem alguma venda registada
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id')
      .eq('worker_id', id)
      .limit(1)

    if (salesError) {
      alert('Erro ao verificar histórico do trabalhador: ' + salesError.message)
      return
    }

    if (sales && sales.length > 0) {
      // TEM VENDAS -> Apenas arquiva para não destruir a contabilidade
      const { error } = await supabase
        .from('workers')
        .update({ is_archived: true, is_active: false, on_shift: false })
        .eq('id', id)
      if (error) alert('Erro ao arquivar: ' + error.message)
      else fetchWorkers()
    } else {
      // NÃO TEM VENDAS -> Apaga definitivamente da base de dados
      const { error } = await supabase.from('workers').delete().eq('id', id)
      if (error) alert('Erro ao apagar: ' + error.message)
      else fetchWorkers()
    }
  }

  async function addWorker(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newName.trim()) return alert('Insere o nome.')
    if (selectedRoles.length === 0) return alert('Por favor, seleciona pelo menos uma função.')

    const { error } = await supabase.from('workers').insert([
      {
        name: newName,
        commission_services: commServices || 0,
        commission_products: commProducts || 0,
        roles: selectedRoles,
        is_active: true,
        on_shift: false
      }
    ])

    if (error) alert('Erro ao adicionar: ' + error.message)
    else {
      setNewName('')
      setCommServices(AppConfig.defaults.commissionServices)
      setCommProducts(AppConfig.defaults.commissionProducts)
      setSelectedRoles([])
      fetchWorkers()
    }
  }

  function toggleRole(roleName: string): void {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    )
  }

  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Novo Trabalhador</h2>
        <form onSubmit={addWorker} style={styles.form}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome do trabalhador..."
            style={styles.input}
          />
          <div style={styles.inputRow}>
            <input
              type="number"
              value={commServices}
              onChange={(e) => setCommServices(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="% Serviços"
              style={styles.inputHalf}
            />
            {AppConfig.features.enableProducts && (
              <input
                type="number"
                value={commProducts}
                onChange={(e) =>
                  setCommProducts(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="% Produtos"
                style={styles.inputHalf}
              />
            )}
          </div>

          {/* SELETOR DE FUNÇÕES COM BOTÃO DE GERIR */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '4px 0' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', marginRight: '4px' }}>Funções:</span>
            {availableRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.name)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #d1d5db',
                  backgroundColor: selectedRoles.includes(role.name) ? AppConfig.theme.primaryColor : '#f9fafb',
                  color: selectedRoles.includes(role.name) ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {role.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsManageRolesOpen(true)}
              style={{ padding: '6px', borderRadius: '50%', border: '1px solid #d1d5db', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Gerir Funções"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
          </div>

          <button type="submit" style={styles.submitButton}>
            Registar
          </button>
        </form>
      </section>

      <section style={styles.listSection}>
        <h2 style={styles.listTitle}>A Minha Equipa</h2>
        <ul style={styles.list}>
          {workers.map((worker) => (
            <li key={worker.id} style={styles.listItem}>
              <div>
                <strong style={styles.workerName}>{worker.name}</strong>
                <div style={styles.workerCommissions}>
                  {worker.commission_services}% Serv.
                  {AppConfig.features.enableProducts && ` | ${worker.commission_products}% Prod.`}
                </div>
                <div style={styles.workerRoles}>{worker.roles?.join(', ')}</div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => toggleWorkerStatus(worker)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: worker.is_active ? '#d1fae5' : '#fee2e2',
                    color: worker.is_active ? '#065f46' : '#991b1b',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {worker.is_active ? 'Ativo' : 'Inativo'}
                </button>
                <button
                  onClick={() => archiveWorker(worker.id)}
                  style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: AppConfig.theme.dangerColor, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Remover da Equipa"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
        {workers.length === 0 && <p style={styles.emptyMessage}>Nenhum trabalhador registado.</p>}
      </section>

      {isManageRolesOpen && (
        <ManageRolesPopup 
          onClose={() => {
            setIsManageRolesOpen(false)
            fetchRoles()
          }} 
        />
      )}
    </div>
  )
}
