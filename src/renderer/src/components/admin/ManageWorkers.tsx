import React, { JSX, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

interface Worker {
  id: string
  name: string
  commission_services: number
  commission_products: number
  is_active: boolean
  roles?: string[]
}

export default function ManageWorkers(): JSX.Element {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [newName, setNewName] = useState('')
  const [commServices, setCommServices] = useState<number | ''>(AppConfig.defaults.commissionServices)
  const [commProducts, setCommProducts] = useState<number | ''>(AppConfig.defaults.commissionProducts)
  const [rolesInput, setRolesInput] = useState('')

  useEffect(() => {
    fetchWorkers()
  }, [])

  async function fetchWorkers(): Promise<void> {
    const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false })
    if (error) console.error('Erro a carregar trabalhadores:', error)
    else setWorkers(data || [])
  }

  async function addWorker(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!newName.trim()) return alert('Insere o nome.')

    const rolesArray = rolesInput.split(',').map((r) => r.trim()).filter((r) => r)

    const { error } = await supabase.from('workers').insert([{
      name: newName,
      commission_services: commServices || 0,
      commission_products: commProducts || 0,
      roles: rolesArray.length > 0 ? rolesArray : ['Barbeiro']
    }])

    if (error) alert('Erro ao adicionar: ' + error.message)
    else {
      setNewName(''); setCommServices(AppConfig.defaults.commissionServices); setCommProducts(AppConfig.defaults.commissionProducts); setRolesInput('')
      fetchWorkers()
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <section style={{ padding: '20px', backgroundColor: AppConfig.theme.surfaceColor, border: '1px solid #e5e7eb', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0, fontSize: '18px', color: AppConfig.theme.primaryColor }}>➕ Novo Trabalhador</h2>
        <form onSubmit={addWorker} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do trabalhador..." style={{ padding: '14px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          <div style={{ display: 'flex', gap: '12px' }}>
            <input type="number" value={commServices} onChange={(e) => setCommServices(e.target.value === '' ? '' : Number(e.target.value))} placeholder="% Serviços" style={{ padding: '14px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1 }} />
            {AppConfig.features.enableProducts && (
              <input type="number" value={commProducts} onChange={(e) => setCommProducts(e.target.value === '' ? '' : Number(e.target.value))} placeholder="% Produtos" style={{ padding: '14px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', flex: 1 }} />
            )}
          </div>
          <input type="text" value={rolesInput} onChange={(e) => setRolesInput(e.target.value)} placeholder="Funções (ex: Barbeiro, Esteticista)" style={{ padding: '14px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
          <button type="submit" style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', backgroundColor: AppConfig.theme.primaryColor, color: '#fff', border: 'none', borderRadius: '8px' }}>Registar</button>
        </form>
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '18px', color: '#374151', paddingLeft: '4px' }}>A Minha Equipa</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {workers.map((worker) => (
            <li key={worker.id} style={{ padding: '16px 20px', backgroundColor: AppConfig.theme.surfaceColor, border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div>
                <strong style={{ fontSize: '18px', color: AppConfig.theme.primaryColor }}>{worker.name}</strong>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  {worker.commission_services}% Serv.
                  {AppConfig.features.enableProducts && ` | ${worker.commission_products}% Prod.`}
                </div>
                <div style={{ fontSize: '12px', color: AppConfig.theme.secondaryColor, marginTop: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {worker.roles?.join(', ')}
                </div>
              </div>
              <div>
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: worker.is_active ? '#d1fae5' : '#fee2e2',
                    color: worker.is_active ? '#065f46' : '#991b1b'
                  }}
                >
                  {worker.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {workers.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '20px' }}>Nenhum trabalhador registado.</p>}
      </section>
    </div>
  )
}