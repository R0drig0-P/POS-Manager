import { JSX } from 'react'
import { AppConfig } from '../../config'

interface CheckoutPopupProps {
  activeTab: 'services' | 'products'
  setActiveTab: (tab: 'services' | 'products') => void
  onClose: () => void
  services: any[]
  onAddToCart: (service: any) => void
  clientName: string
  setClientName: (name: string) => void
  cart: any[]
  onRemoveFromCart: (id: string) => void
  total: number
  onCheckout: () => void
  isSubmitting: boolean
}

export default function CheckoutPopup({ activeTab, setActiveTab, onClose, services, onAddToCart, clientName, setClientName, cart, onRemoveFromCart, total, onCheckout, isSubmitting }: CheckoutPopupProps): JSX.Element {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: '80px', backgroundColor: '#f9fafb', zIndex: 20, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => setActiveTab('services')} style={{ padding: '12px 24px', fontSize: '18px', border: 'none', background: activeTab === 'services' ? AppConfig.theme.primaryColor : 'none', color: activeTab === 'services' ? '#fff' : '#6b7280', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Serviços</button>
          {AppConfig.features.enableProducts && (
            <button onClick={() => setActiveTab('products')} style={{ padding: '12px 24px', fontSize: '18px', border: 'none', background: activeTab === 'products' ? AppConfig.theme.primaryColor : 'none', color: activeTab === 'products' ? '#fff' : '#6b7280', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Produtos</button>
          )}
        </div>
        <button onClick={onClose} style={{ padding: '8px 24px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px' }}>Voltar</button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ESQUERDA: LISTA DE ESCOLHA */}
        <div style={{ flex: 2, padding: '24px', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {activeTab === 'services' ? (
              services.map((s) => (
                <button key={s.id} onClick={() => onAddToCart(s)} style={{ padding: '24px 16px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', flex: '1 1 180px' }}>
                  <strong style={{ fontSize: '18px', color: AppConfig.theme.primaryColor }}>{s.name}</strong>
                  <span style={{ color: AppConfig.theme.successColor, fontSize: '22px', fontWeight: 'bold' }}>{s.price.toFixed(2)} {AppConfig.localization.currency}</span>
                </button>
              ))
            ) : (
              <p style={{ color: '#6b7280', gridColumn: '1 / -1' }}>Lista de produtos aparecerá aqui em breve...</p>
            )}
          </div>
        </div>

        {/* DIREITA: TALÃO E CHECKOUT */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
            <input type="text" placeholder="Nome do Cliente (Opcional)" value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: '100%', padding: '12px', fontSize: '16px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box' }} />
          </div>

          <ul style={{ listStyle: 'none', padding: '10px 20px', flex: 1, overflowY: 'auto', margin: 0 }}>
            {cart.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6', fontSize: '18px' }}>
                <span style={{ color: '#374151', fontWeight: '500' }}>{item.name}</span>
                <div>
                  <strong style={{ marginRight: '15px', color: AppConfig.theme.primaryColor }}>{item.price.toFixed(2)} {AppConfig.localization.currency}</strong>
                  <button onClick={() => onRemoveFromCart(item.id)} style={{ color: AppConfig.theme.dangerColor, border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✖</button>
                </div>
              </li>
            ))}
          </ul>

          <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px', color: AppConfig.theme.primaryColor }}>
              <span>Total:</span>
              <span style={{ color: AppConfig.theme.successColor }}>{total.toFixed(2)} {AppConfig.localization.currency}</span>
            </div>
            <button onClick={onCheckout} disabled={cart.length === 0 || isSubmitting} style={{ width: '100%', padding: '24px', fontSize: '22px', backgroundColor: cart.length === 0 ? '#d1d5db' : AppConfig.theme.primaryColor, color: 'white', border: 'none', borderRadius: '12px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
              {isSubmitting ? 'A Registar...' : 'FINALIZAR VENDA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}