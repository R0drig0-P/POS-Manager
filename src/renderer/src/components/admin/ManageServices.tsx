import React, { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

interface Service {
  id: string
  name: string
  price: number
  is_active: boolean
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
  input: { padding: '14px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px' },
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
  itemName: { fontSize: '18px', color: AppConfig.theme.primaryColor },
  itemRight: { textAlign: 'right' },
  itemPrice: { fontSize: '20px', color: AppConfig.theme.successColor },
  emptyMessage: { color: '#6b7280', textAlign: 'center', marginTop: '20px' }
}

export default function ManageServices(): JSX.Element {
  const [services, setServices] = useState<Service[]>([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('')

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices(): Promise<void> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('Erro a carregar serviços:', error)
    else setServices(data || [])
  }

  async function addService(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newServiceName.trim() || newServicePrice === '') return alert('Insere o nome e preço.')

    const { error } = await supabase
      .from('services')
      .insert([{ name: newServiceName, price: newServicePrice }])

    if (error) alert('Erro ao adicionar: ' + error.message)
    else {
      setNewServiceName('')
      setNewServicePrice('')
      fetchServices()
    }
  }

  return (
    <div style={styles.container}>
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Novo Serviço</h2>
        <form onSubmit={addService} style={styles.form}>
          <input
            type="text"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Nome (ex: Corte, Barba)"
            style={styles.input}
          />
          <input
            type="number"
            step="0.01"
            value={newServicePrice}
            onChange={(e) =>
              setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder={`Preço (${AppConfig.localization.currency})`}
            style={styles.input}
          />
          <button type="submit" style={styles.submitButton}>
            Registar
          </button>
        </form>
      </section>

      <section style={styles.listSection}>
        <h2 style={styles.listTitle}>Catálogo de Serviços</h2>
        <ul style={styles.list}>
          {services.map((service) => (
            <li key={service.id} style={styles.listItem}>
              <strong style={styles.itemName}>{service.name}</strong>
              <div style={styles.itemRight}>
                <strong style={styles.itemPrice}>
                  {service.price.toFixed(2)} {AppConfig.localization.currency}
                </strong>
                <div
                  style={{
                    fontSize: '12px',
                    marginTop: '4px',
                    fontWeight: '500',
                    color: service.is_active ? '#6b7280' : '#ef4444'
                  }}
                >
                  {service.is_active ? 'Disponível' : 'Oculto'}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {services.length === 0 && (
          <p style={styles.emptyMessage}>Nenhum serviço registado ainda.</p>
        )}
      </section>
    </div>
  )
}
