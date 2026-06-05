import { JSX, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AppConfig } from '../config'
import TerminalHotbar from '../components/terminal/TerminalHotbar'
import WorkerCard from '../components/terminal/WorkerCard'
import WorkerDetailsOverlay from '../components/terminal/WorkerDetailsOverlay'
import CheckoutPopup from '../components/terminal/CheckoutPopup'

interface Worker {
  id: string
  name: string
  commission_services: number
  commission_products: number
  roles?: string[] // Array dinâmico de funções
}

interface Service {
  id: string
  name: string
  price: number
}

interface CartItem {
  id: string
  item_id: string
  name: string
  price: number
  type: 'service' | 'product'
  commission: number
}

interface SaleItem {
  item_name: string
  quantity: number
}

interface Sale {
  id: string
  total_amount: number
  created_at: string
  client_name?: string
  sale_items: SaleItem[]
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

  // Estado do Carrinho (Nova Venda)
  const [cart, setCart] = useState<CartItem[]>([])
  const [clientName, setClientName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchWorkers()
    fetchServices()
  }, [])

  // Quando um trabalhador é selecionado, carrega as vendas DELE para o DIA DE HOJE
  useEffect(() => {
    if (selectedWorker) {
      fetchWorkerTodaySales(selectedWorker.id)
    } else {
      setWorkerSales([])
      setIsDeleteMode(false)
    }
  }, [selectedWorker])

  async function fetchWorkers(): Promise<void> {
    const { data } = await supabase.from('workers').select('*').eq('is_active', true).order('name')
    if (data) setWorkers(data)
  }

  async function fetchServices(): Promise<void> {
    const { data } = await supabase.from('services').select('*').eq('is_active', true).order('name')
    if (data) setServices(data)
  }

  async function fetchWorkerTodaySales(workerId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Vai buscar as vendas e os items associados num só pedido (magia do Supabase!)
    const { data, error } = await supabase
      .from('sales')
      .select('id, total_amount, created_at, sale_items(item_name, quantity)')
      .eq('worker_id', workerId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })

    if (!error && data) {
      setWorkerSales(data)
    }
  }

  function addToCart(service: Service): void {
    if (!selectedWorker) return
    const newItem: CartItem = {
      id: Math.random().toString(36).substring(2, 9),
      item_id: service.id,
      name: service.name,
      price: service.price,
      type: 'service',
      commission: selectedWorker.commission_services
    }
    setCart([...cart, newItem])
  }

  function removeFromCart(cartItemId: string): void {
    setCart(cart.filter((item) => item.id !== cartItemId))
  }

  async function checkout(): Promise<void> {
    if (!selectedWorker || cart.length === 0) return
    setIsSubmitting(true)

    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0)

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{ worker_id: selectedWorker.id, total_amount: totalAmount }]) // client_id viria aqui no futuro
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
      quantity: 1
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems)

    if (itemsError) {
      alert('Erro ao registar detalhes: ' + itemsError.message)
    } else {
      setCart([])
      setClientName('')
      setIsAddSaleOpen(false)
      fetchWorkerTodaySales(selectedWorker.id)
    }
    setIsSubmitting(false)
  }

  async function deleteSale(saleId: string) {
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

  const total = cart.reduce((sum, item) => sum + item.price, 0)

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
    <div
      style={{
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
      }}
      onClick={() => isDeleteMode && setIsDeleteMode(false)}
    >
      {/* --- MAIN AREA: LINHAS DE TRABALHADORES --- */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div
          style={{
            width: '100%',
            margin: '0 auto'
          }}
        >
          {Object.entries(groupedWorkers).map(([role, roleWorkers]) => (
            <div key={role} style={{ marginBottom: '40px' }}>
              <h2
                style={{
                  fontSize: '22px',
                  color: '#4b5563',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: '8px',
                  marginBottom: '20px',
                  marginTop: 0
                }}
              >
                {role}
              </h2>
              <div
                style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}
              >
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
            <p style={{ color: '#6b7280', textAlign: 'center', marginTop: '40px' }}>
              Nenhum trabalhador ativo. Adiciona trabalhadores no painel Admin.
            </p>
          )}
        </div>
      </main>

      {/* --- HOTBAR (BASE) --- */}
      <TerminalHotbar />

      {/* --- WIDGET DO TRABALHADOR (OVERLAY) --- */}
      {selectedWorker && !isAddSaleOpen && (
        <WorkerDetailsOverlay
          workerName={selectedWorker.name}
          workerSales={workerSales}
          isDeleteMode={isDeleteMode}
          onClose={() => setSelectedWorker(null)}
          onAddService={() => setIsAddSaleOpen(true)}
          onToggleDeleteMode={(e) => { e.stopPropagation(); setIsDeleteMode(!isDeleteMode); }}
          onDeleteSale={deleteSale}
        />
      )}

      {/* --- POPUP DE ADICIONAR VENDA (OVERLAY DENTRO DO WIDGET) --- */}
      {isAddSaleOpen && (
        <CheckoutPopup
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setIsAddSaleOpen(false)}
          services={services}
          onAddToCart={addToCart}
          clientName={clientName}
          setClientName={setClientName}
          cart={cart}
          onRemoveFromCart={removeFromCart}
          total={total}
          onCheckout={checkout}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
