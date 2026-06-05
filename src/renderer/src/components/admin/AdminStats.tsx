import { JSX, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

export default function AdminStats(): JSX.Element {
  const [todaySales, setTodaySales] = useState<any[]>([])
  const [todayTotal, setTodayTotal] = useState(0)

  useEffect(() => {
    fetchTodaySales()

    // Subscrição Realtime ao vivo
    const subscription = supabase
      .channel('live-sales')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales' }, () => {
        fetchTodaySales()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  async function fetchTodaySales(): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('sales')
      .select('id, total_amount, created_at, workers(name)')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro a carregar vendas:', error)
    } else if (data) {
      setTodaySales(data)
      const total = data.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
      setTodayTotal(total)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{ backgroundColor: AppConfig.theme.primaryColor, color: '#ffffff', padding: '30px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Faturação de Hoje</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '48px', fontWeight: '800', color: AppConfig.theme.successColor }}>{todayTotal.toFixed(2)} {AppConfig.localization.currency}</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '16px', color: '#d1d5db' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '20px', display: 'inline-block' }}>
            <strong style={{ color: '#fff', fontSize: '20px' }}>{todaySales.length}</strong> vendas
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px' }}>Últimas Vendas</h3>
        {todaySales.map((sale) => (
          <div key={sale.id} style={{ padding: '16px', backgroundColor: AppConfig.theme.surfaceColor, borderRadius: '12px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ color: AppConfig.theme.primaryColor, fontSize: '18px' }}>{sale.total_amount.toFixed(2)} {AppConfig.localization.currency}</strong>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>{new Date(sale.created_at).toLocaleTimeString(AppConfig.localization.locale, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Trabalhador: <strong style={{ color: AppConfig.theme.secondaryColor }}>{sale.workers?.name || 'Desconhecido'}</strong>
            </div>
          </div>
        ))}
        {todaySales.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>Nenhuma venda registada hoje.</p>}
      </div>
    </div>
  )
}