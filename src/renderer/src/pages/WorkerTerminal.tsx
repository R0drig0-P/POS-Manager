import { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AppConfig } from '../config'
import TerminalHotbar from '../components/terminal/TerminalHotbar'
import WorkerCard from '../components/terminal/WorkerCard'
import WorkerDetailsOverlay from '../components/terminal/WorkerDetailsOverlay'
import CheckoutPopup from '../components/terminal/CheckoutPopup'
import AddWorkerPopup from '../components/terminal/AddWorkerPopup'

interface Worker {
  id: string
  name: string
  commission_services: number
  commission_products: number
  is_active?: boolean
  on_shift?: boolean
  roles?: string[] // Array dinâmico de funções
}

interface Service {
  id: string
  name: string
  price: number
  roles?: string[]
}

interface CartItem {
  id: string
  item_id: string
  name: string
  price: number
  type: 'service' | 'product'
  commission: number
  quantity: number
}

interface SaleItem {
  item_name: string
  quantity: number
  price_at_sale: number
}

interface Sale {
  id: string
  total_amount: number
  created_at: string
  clients?: { name: string; phone: string } | null
  sale_items: SaleItem[]
}

const styles: Record<string, CSSProperties> = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: AppConfig.theme.backgroundColor,
    height: '100vh',
    width: '100vw',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  mainArea: { flex: 1, padding: '32px', overflowY: 'auto' },
  contentWrapper: { width: '100%', margin: '0 auto' },
  roleSection: { marginBottom: '40px' },
  roleTitle: {
    fontSize: '22px',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '8px',
    marginBottom: '20px',
    marginTop: 0
  },
  workersRow: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' },
  emptyMessage: { color: '#6b7280', textAlign: 'center', marginTop: '40px' }
}

export default function WorkerTerminal(): JSX.Element {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [services, setServices] = useState<Service[]>([])

  // Controlos de UI
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [workerSales, setWorkerSales] = useState<Sale[]>([])
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services')
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)

  // Estado do Carrinho (Nova Venda)
  const [cart, setCart] = useState<CartItem[]>([])
  const [clientFirstName, setClientFirstName] = useState('')
  const [clientLastName, setClientLastName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function initTerminal(): Promise<void> {
      await checkAndResetShifts()
      fetchWorkers()
      fetchServices()
    }
    initTerminal()

    // Verificação de meia-noite (para POS que fica sempre aberto)
    const interval = setInterval(async () => {
      const didReset = await checkAndResetShifts()
      if (didReset) fetchWorkers()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Função de Limpeza Diária do Turno
  async function checkAndResetShifts(): Promise<boolean> {
    const todayStr = new Date().toDateString()
    const lastReset = localStorage.getItem('last_shift_reset')

    if (lastReset !== todayStr) {
      // Fazemos o update individualmente para garantir que não é bloqueado por restrições de segurança do Supabase
      const { data, error } = await supabase.from('workers').select('id').eq('on_shift', true)
      if (!error) {
        if (data && data.length > 0) {
          await Promise.all(data.map((w) => supabase.from('workers').update({ on_shift: false }).eq('id', w.id)))
        }
        localStorage.setItem('last_shift_reset', todayStr)
        return true
      }
    }
    return false
  }

  // Quando um trabalhador é selecionado, carrega as vendas DELE para o DIA DE HOJE
  useEffect(() => {
    if (selectedWorker) {
      fetchWorkerTodaySales(selectedWorker.id)
    }
  }, [selectedWorker])

  async function fetchWorkers(): Promise<void> {
    const { data } = await supabase.from('workers').select('*').eq('on_shift', true).order('name')
    if (data) setWorkers(data)
  }

  async function fetchServices(): Promise<void> {
    const { data } = await supabase.from('services').select('*').eq('is_active', true).order('name')
    if (data) setServices(data)
  }

  async function fetchWorkerTodaySales(workerId: string): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Vai buscar as vendas e os items associados num só pedido (magia do Supabase!)
    const { data, error } = await supabase
      .from('sales')
      .select(
        'id, total_amount, created_at, clients(name, phone), sale_items(item_name, quantity, price_at_sale)'
      )
      .eq('worker_id', workerId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (!error && data) {
      setWorkerSales(data)
    }
  }

  function addToCart(service: Service): void {
    if (!selectedWorker) return
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.item_id === service.id && i.price === service.price)
      if (existing) {
        return prevCart.map((i) => (i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [
        ...prevCart,
        {
          id: Math.random().toString(36).substring(2, 9),
          item_id: service.id,
          name: service.name,
          price: service.price,
          type: 'service',
          commission: selectedWorker.commission_services,
          quantity: 1
        }
      ]
    })
  }

  function removeFromCart(cartItemId: string): void {
    setCart(cart.filter((item) => item.id !== cartItemId))
  }

  async function checkout(): Promise<void> {
    if (!selectedWorker || cart.length === 0) return
    setIsSubmitting(true)

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Configuração do Cliente
    const fullName = `${clientFirstName.trim()} ${clientLastName.trim()}`
    const phone = clientPhone.trim()
    let clientId = null

    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('phone', phone)
      .limit(1)

    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert([{ name: fullName, phone }])
        .select()
        .single()
      if (!clientErr && newClient) clientId = newClient.id
    }

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ worker_id: selectedWorker.id, total_amount: totalAmount, client_id: clientId }])
      .select()
      .single()

    if (saleError || !saleData) {
      alert('Erro ao registar venda: ' + saleError?.message)
      setIsSubmitting(false)
      return
    }

    const saleItems = cart.map((item) => ({
      sale_id: saleData.id,
      item_type: item.type,
      item_id: item.item_id,
      item_name: item.name,
      price_at_sale: item.price,
      commission_at_sale: item.commission,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)

    if (itemsError) {
      alert('Erro ao registar detalhes: ' + itemsError.message)
    } else {
      setCart([])
      setClientFirstName('')
      setClientLastName('')
      setClientPhone('')
      setIsAddSaleOpen(false)
      fetchWorkerTodaySales(selectedWorker.id)
    }
    setIsSubmitting(false)
  }

  async function deleteSale(saleId: string): Promise<void> {
    if (!window.confirm('Tens a certeza que queres apagar este registo?')) {
      setIsDeleteMode(false)
      return
    }
    const { error } = await supabase.from('sales').delete().eq('id', saleId)
    if (error) {
      alert('Erro ao apagar: ' + error.message)
    } else {
      setWorkerSales(workerSales.filter((s) => s.id !== saleId))
    }
    setIsDeleteMode(false)
  }

  async function endShift(): Promise<void> {
    if (!selectedWorker) return
    if (!window.confirm(`Pretendes terminar o turno de ${selectedWorker.name}?`)) return
    
    const { error } = await supabase.from('workers').update({ on_shift: false }).eq('id', selectedWorker.id)
    if (!error) {
      setSelectedWorker(null)
      setWorkerSales([])
      setIsDeleteMode(false)
      fetchWorkers()
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Agrupar trabalhadores por múltiplas funções (roles dinâmicos)
  const groupedWorkers: Record<string, Worker[]> = {}
  workers.forEach((worker) => {
    const workerRoles = worker.roles && worker.roles.length > 0 ? worker.roles : ['Equipa Geral']
    workerRoles.forEach((role) => {
      if (!groupedWorkers[role]) groupedWorkers[role] = []
      groupedWorkers[role].push(worker)
    })
  })

  return (
    <div style={styles.container} onClick={() => isDeleteMode && setIsDeleteMode(false)}>
      {/* --- MAIN AREA: LINHAS DE TRABALHADORES --- */}
      <main style={styles.mainArea}>
        <div style={styles.contentWrapper}>
          {Object.entries(groupedWorkers).map(([role, roleWorkers]) => (
            <div key={role} style={styles.roleSection}>
              <h2 style={styles.roleTitle}>{role}</h2>
              <div style={styles.workersRow}>
                {roleWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    name={worker.name}
                    onClick={() => setSelectedWorker(worker)}
                  />
                ))}
              </div>
            </div>
          ))}
          {workers.length === 0 && (
            <p style={styles.emptyMessage}>
              Nenhum trabalhador ativo. Adiciona trabalhadores no painel Admin.
            </p>
          )}
        </div>
      </main>

      {/* --- HOTBAR (BASE) --- */}
      <TerminalHotbar onAddWorker={async () => {
        const didReset = await checkAndResetShifts()
        if (didReset) fetchWorkers()
        setIsAddWorkerOpen(true)
      }} />

      {/* --- WIDGET DO TRABALHADOR (OVERLAY) --- */}
      {selectedWorker && !isAddSaleOpen && (
        <WorkerDetailsOverlay
          workerName={selectedWorker.name}
          workerSales={workerSales}
          isDeleteMode={isDeleteMode}
          onClose={() => {
            setSelectedWorker(null)
            setWorkerSales([])
            setIsDeleteMode(false)
          }}
          onAddService={() => {
            setIsAddSaleOpen(true)
            setCart([])
            setClientFirstName('')
            setClientLastName('')
            setClientPhone('')
            setActiveTab('services')
          }}
          onToggleDeleteMode={(e) => {
            e.stopPropagation()
            setIsDeleteMode(!isDeleteMode)
          }}
          onDeleteSale={deleteSale}
          onEndShift={endShift}
        />
      )}

      {/* --- POPUP DE ADICIONAR VENDA (OVERLAY DENTRO DO WIDGET) --- */}
      {isAddSaleOpen && (
        <CheckoutPopup
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => {
            setIsAddSaleOpen(false)
            setCart([])
            setClientFirstName('')
            setClientLastName('')
            setClientPhone('')
          }}
          services={services.filter(s => {
            const serviceRoles = s.roles || ['Geral']
            if (serviceRoles.includes('Geral')) return true
            const workerRoles = selectedWorker.roles || ['Equipa Geral']
            return serviceRoles.some(r => workerRoles.includes(r))
          })}
          onAddToCart={addToCart}
          clientFirstName={clientFirstName}
          setClientFirstName={setClientFirstName}
          clientLastName={clientLastName}
          setClientLastName={setClientLastName}
          clientPhone={clientPhone}
          setClientPhone={setClientPhone}
          cart={cart}
          onRemoveFromCart={removeFromCart}
          total={total}
          onCheckout={checkout}
          isSubmitting={isSubmitting}
        />
      )}

      {/* --- POPUP DE ADICIONAR TRABALHADOR --- */}
      {isAddWorkerOpen && (
        <AddWorkerPopup
          onClose={() => setIsAddWorkerOpen(false)}
          onSuccess={() => {
            setIsAddWorkerOpen(false)
            fetchWorkers() // Recarrega a lista para mostrar o novo trabalhador imediatamente
          }}
        />
      )}
    </div>
  )
}
