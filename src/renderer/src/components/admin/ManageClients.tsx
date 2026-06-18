import { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

interface Client {
  id: string
  name: string
  phone: string
  created_at: string
}

const styles: Record<string, CSSProperties> = {
  container: { padding: '20px' },
  listSection: { marginTop: '10px' },
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
  clientName: { fontSize: '18px', color: AppConfig.theme.primaryColor },
  clientPhone: { fontSize: '16px', color: '#6b7280', marginTop: '4px' },
  emptyMessage: { color: '#6b7280', textAlign: 'center', marginTop: '20px' },
  actionBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px 16px', backgroundColor: AppConfig.theme.surfaceColor, borderRadius: '12px', border: '1px solid #e5e7eb' },
  actionButtons: { display: 'flex', gap: '8px' },
  btnBase: { padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#fff', fontSize: '14px' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
  clientRowLeft: { display: 'flex', alignItems: 'center', gap: '16px' }
}

export default function ManageClients(): JSX.Element {
  const [clients, setClients] = useState<Client[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients(): Promise<void> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      setClients(data)
    }
  }

  const toggleAll = (): void => {
    if (selected.size === clients.length && clients.length > 0) setSelected(new Set())
    else setSelected(new Set(clients.map((c) => c.id)))
  }

  const toggleClient = (id: string): void => {
    const newSet = new Set(selected)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelected(newSet)
  }

  const handleWhatsApp = (): void => {
    if (selected.size === 0) return alert('Seleciona pelo menos um cliente para enviar mensagem.')
    const selectedClients = clients.filter((c) => selected.has(c.id))
    
    if (selectedClients.length === 1) {
      window.open(`https://wa.me/351${selectedClients[0].phone}`, '_blank')
    } else {
      const numbers = selectedClients.map((c) => c.phone).join(', ')
      navigator.clipboard.writeText(numbers)
      alert(`Copiados ${selectedClients.length} números para a área de transferência. Podes colar numa lista de transmissão do WhatsApp!`)
    }
  }

  const handleSMS = (): void => {
    if (selected.size === 0) return alert('Seleciona pelo menos um cliente para enviar SMS.')
    const selectedClients = clients.filter((c) => selected.has(c.id))
    const phones = selectedClients.map((c) => c.phone).join(',')
    window.location.href = `sms:${phones}`
  }

  return (
    <div style={styles.container}>
      <section style={styles.listSection}>
        <h2 style={styles.listTitle}>Carteira de Clientes</h2>
        
        <div style={styles.actionBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input type="checkbox" style={styles.checkbox} checked={clients.length > 0 && selected.size === clients.length} onChange={toggleAll} />
            <strong style={{ color: '#374151' }}>Selecionar Todos</strong>
          </div>
          <div style={styles.actionButtons}>
            <button onClick={handleSMS} style={{ ...styles.btnBase, backgroundColor: AppConfig.theme.primaryColor }}>SMS</button>
            <button onClick={handleWhatsApp} style={{ ...styles.btnBase, backgroundColor: '#25D366' }}>WhatsApp</button>
          </div>
        </div>

        <ul style={styles.list}>
          {clients.map((client) => (
            <li key={client.id} style={styles.listItem}>
              <div style={styles.clientRowLeft}>
                <input type="checkbox" style={styles.checkbox} checked={selected.has(client.id)} onChange={() => toggleClient(client.id)} />
                <div>
                  <strong style={styles.clientName}>{client.name}</strong>
                  <div style={styles.clientPhone}>{client.phone}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {clients.length === 0 && <p style={styles.emptyMessage}>Nenhum cliente registado ainda.</p>}
      </section>
    </div>
  )
}
