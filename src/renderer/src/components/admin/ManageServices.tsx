import React, { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

import ManageRolesPopup, { Role } from './ManageRolesPopup'

interface Service {
  id: string
  name: string
  price: number
  is_active: boolean
  roles?: string[]
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
  itemRight: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  itemPrice: { fontSize: '20px', color: AppConfig.theme.successColor },
  serviceRoles: {
    fontSize: '12px',
    color: AppConfig.theme.secondaryColor,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  emptyMessage: { color: '#6b7280', textAlign: 'center', marginTop: '20px' }
}

export default function ManageServices(): JSX.Element {
  const [services, setServices] = useState<Service[]>([])
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('')
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  useEffect(() => {
    fetchServices()
    fetchRoles()
  }, [])

  async function fetchRoles(): Promise<void> {
    const { data } = await supabase.from('roles').select('*').order('name')
    if (data) setAvailableRoles(data)
  }

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

    const finalRoles = selectedRoles.length > 0 ? selectedRoles : ['Geral']

    const { error } = await supabase
      .from('services')
      .insert([{ name: newServiceName, price: newServicePrice, roles: finalRoles }])

    if (error) alert('Erro ao adicionar: ' + error.message)
    else {
      setNewServiceName('')
      setNewServicePrice('')
      setSelectedRoles([])
      fetchServices()
    }
  }

  async function toggleServiceStatus(service: Service): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id)

    if (error) alert('Erro ao atualizar estado: ' + error.message)
    else fetchServices()
  }

  async function archiveService(id: string): Promise<void> {
    if (!window.confirm('Tens a certeza que queres remover este serviço? Se não tiver vendas associadas será apagado definitivamente, caso contrário será arquivado para manter o histórico.')) return
    
    const { data: sales, error: salesError } = await supabase
      .from('sale_items')
      .select('id')
      .eq('item_id', id)
      .limit(1)

    if (salesError) {
      alert('Erro ao verificar histórico do serviço: ' + salesError.message)
      return
    }

    if (sales && sales.length > 0) {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', id)
      if (error) alert('Erro ao arquivar: ' + error.message)
      else fetchServices()
    } else {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) alert('Erro ao apagar: ' + error.message)
      else fetchServices()
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
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', padding: '4px 0' }}>
            <span style={{ fontSize: '14px', color: '#6b7280', marginRight: '4px' }}>Específico para:</span>
            <button
                type="button"
                onClick={() => setSelectedRoles([])}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #d1d5db',
                  backgroundColor: selectedRoles.length === 0 ? AppConfig.theme.primaryColor : '#f9fafb',
                  color: selectedRoles.length === 0 ? '#fff' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Geral (Todos)
              </button>
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
          </div>

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
              <div>
                <strong style={styles.itemName}>{service.name}</strong>
                <div style={styles.serviceRoles}>{service.roles?.join(', ')}</div>
              </div>
              <div style={styles.itemRight}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <strong style={styles.itemPrice}>
                    {service.price.toFixed(2)} {AppConfig.localization.currency}
                  </strong>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: service.is_active ? '#d1fae5' : '#fee2e2',
                      color: service.is_active ? '#065f46' : '#991b1b',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {service.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                  <button
                    onClick={() => archiveService(service.id)}
                    style={{ padding: '6px', backgroundColor: 'transparent', border: 'none', color: AppConfig.theme.dangerColor, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="Remover Serviço"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
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
