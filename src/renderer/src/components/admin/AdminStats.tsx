import { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

interface SaleData {
  id: string
  total_amount: number
  created_at: string
  workers?: { name: string } | null
}

const styles: Record<string, CSSProperties> = {
  container: { padding: '20px' },
  statsCard: {
    backgroundColor: AppConfig.theme.primaryColor,
    color: '#ffffff',
    padding: '30px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
  },
  statsTitle: {
    margin: 0,
    color: '#9ca3af',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  statsAmount: {
    margin: '8px 0 0 0',
    fontSize: '48px',
    fontWeight: '800',
    color: AppConfig.theme.successColor
  },
  salesCountContainer: { textAlign: 'right', fontSize: '16px', color: '#d1d5db' },
  salesCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '10px 20px',
    borderRadius: '20px',
    display: 'inline-block'
  },
  salesCountText: { color: '#fff', fontSize: '20px' },
  salesListContainer: { marginTop: '30px' },
  salesListTitle: { fontSize: '18px', color: '#374151', marginBottom: '16px' },
  saleItem: {
    padding: '16px',
    backgroundColor: AppConfig.theme.surfaceColor,
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  saleItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  saleItemAmount: { color: AppConfig.theme.primaryColor, fontSize: '18px' },
  saleItemTime: { fontSize: '14px', color: '#9ca3af' },
  saleItemWorker: { fontSize: '14px', color: '#6b7280' },
  saleItemWorkerName: { color: AppConfig.theme.secondaryColor },
  emptyMessage: { color: '#9ca3af', textAlign: 'center', marginTop: '40px' }
}

export default function AdminStats(): JSX.Element {
  const [todaySales, setTodaySales] = useState<SaleData[]>([])
  const [todayTotal, setTodayTotal] = useState(0)

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
      const salesData = data as unknown as SaleData[]
      setTodaySales(salesData)
      const total = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0)
      setTodayTotal(total)
    }
  }

  useEffect(() => {
    let isMounted = true

    // Defer initial fetch to avoid synchronous setState inside effect
    const timer = setTimeout(() => {
      if (!isMounted) return
      void fetchTodaySales()
    }, 0)

    // Subscrição Realtime ao vivo
    const subscription = supabase
      .channel('live-sales')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sales' }, () => {
        // fetch when a new sale is inserted
        void fetchTodaySales()
      })
      .subscribe()

    return () => {
      isMounted = false
      clearTimeout(timer)
      supabase.removeChannel(subscription)
    }
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.statsCard}>
        <div>
          <h2 style={styles.statsTitle}>Faturação de Hoje</h2>
          <p style={styles.statsAmount}>
            {todayTotal.toFixed(2)} {AppConfig.localization.currency}
          </p>
        </div>
        <div style={styles.salesCountContainer}>
          <div style={styles.salesCountBadge}>
            <strong style={styles.salesCountText}>{todaySales.length}</strong> vendas
          </div>
        </div>
      </div>

      <div style={styles.salesListContainer}>
        <h3 style={styles.salesListTitle}>Últimas Vendas</h3>
        {todaySales.map((sale) => (
          <div key={sale.id} style={styles.saleItem}>
            <div style={styles.saleItemHeader}>
              <strong style={styles.saleItemAmount}>
                {sale.total_amount.toFixed(2)} {AppConfig.localization.currency}
              </strong>
              <span style={styles.saleItemTime}>
                {new Date(sale.created_at).toLocaleTimeString(AppConfig.localization.locale, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div style={styles.saleItemWorker}>
              Trabalhador:{' '}
              <strong style={styles.saleItemWorkerName}>
                {sale.workers?.name || 'Desconhecido'}
              </strong>
            </div>
          </div>
        ))}
        {todaySales.length === 0 && (
          <p style={styles.emptyMessage}>Nenhuma venda registada hoje.</p>
        )}
      </div>
    </div>
  )
}
