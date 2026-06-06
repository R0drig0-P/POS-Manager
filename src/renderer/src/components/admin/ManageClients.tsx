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
  emptyMessage: { color: '#6b7280', textAlign: 'center', marginTop: '20px' }
}

export default function ManageClients(): JSX.Element {
  const [clients, setClients] = useState<Client[]>([])

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

  return (
    <div style={styles.container}>
      <section style={styles.listSection}>
        <h2 style={styles.listTitle}>Carteira de Clientes</h2>
        <ul style={styles.list}>
          {clients.map((client) => (
            <li key={client.id} style={styles.listItem}>
              <div>
                <strong style={styles.clientName}>{client.name}</strong>
                <div style={styles.clientPhone}>{client.phone}</div>
              </div>
            </li>
          ))}
        </ul>
        {clients.length === 0 && <p style={styles.emptyMessage}>Nenhum cliente registado ainda.</p>}
      </section>
    </div>
  )
}
