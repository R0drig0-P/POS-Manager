import { JSX, CSSProperties } from 'react'
import { AppConfig } from '../../config'

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
  quantity: number
}

interface CheckoutPopupProps {
  activeTab: 'services' | 'products'
  setActiveTab: (tab: 'services' | 'products') => void
  onClose: () => void
  services: Service[]
  onAddToCart: (service: Service) => void
  clientFirstName: string
  setClientFirstName: (name: string) => void
  clientLastName: string
  setClientLastName: (name: string) => void
  clientPhone: string
  setClientPhone: (phone: string) => void
  cart: CartItem[]
  onRemoveFromCart: (id: string) => void
  total: number
  onCheckout: () => void
  isSubmitting: boolean
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: '80px',
    backgroundColor: '#f9fafb',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb'
  },
  tabContainer: { display: 'flex', gap: '16px' },
  tabButtonBase: {
    padding: '12px 24px',
    fontSize: '18px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  backButton: {
    padding: '8px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px'
  },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftPanel: { flex: 2, padding: '24px', overflowY: 'auto' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px'
  },
  serviceButton: {
    padding: '24px 16px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
    flex: '1 1 180px'
  },
  serviceName: { fontSize: '18px', color: AppConfig.theme.primaryColor },
  servicePrice: { color: AppConfig.theme.successColor, fontSize: '22px', fontWeight: 'bold' },
  emptyText: { color: '#6b7280', gridColumn: '1 / -1' },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeft: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column'
  },
  clientInputRow: {
    display: 'flex',
    gap: '12px',
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  clientInput: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxSizing: 'border-box',
    WebkitAppRegion: 'no-drag',
    WebkitUserSelect: 'text',
    userSelect: 'text'
  },
  cartList: { listStyle: 'none', padding: '10px 20px', flex: 1, overflowY: 'auto', margin: 0 },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '18px'
  },
  cartItemName: { color: '#374151', fontWeight: '500' },
  cartItemPrice: { marginRight: '15px', color: AppConfig.theme.primaryColor },
  removeButton: {
    color: AppConfig.theme.dangerColor,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '20px'
  },
  footer: { padding: '24px', borderTop: '1px solid #e5e7eb' },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: AppConfig.theme.primaryColor
  },
  totalAmount: { color: AppConfig.theme.successColor },
  checkoutButtonBase: {
    width: '100%',
    padding: '24px',
    fontSize: '22px',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 'bold'
  }
}

export default function CheckoutPopup({
  activeTab,
  setActiveTab,
  onClose,
  services,
  onAddToCart,
  clientFirstName,
  setClientFirstName,
  clientLastName,
  setClientLastName,
  clientPhone,
  setClientPhone,
  cart,
  onRemoveFromCart,
  total,
  onCheckout,
  isSubmitting
}: CheckoutPopupProps): JSX.Element {
  const getTabStyle = (tab: 'services' | 'products'): CSSProperties => ({
    ...styles.tabButtonBase,
    background: activeTab === tab ? AppConfig.theme.primaryColor : 'none',
    color: activeTab === tab ? '#fff' : '#6b7280'
  })

  const isPhoneValid = /^[29]\d{8}$/.test(clientPhone)
  const isReadyToCheckout =
    cart.length > 0 &&
    clientFirstName.trim() !== '' &&
    clientLastName.trim() !== '' &&
    isPhoneValid &&
    !isSubmitting

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <div style={styles.tabContainer}>
          <button onClick={() => setActiveTab('services')} style={getTabStyle('services')}>
            Serviços
          </button>
          {AppConfig.features.enableProducts && (
            <button onClick={() => setActiveTab('products')} style={getTabStyle('products')}>
              Produtos
            </button>
          )}
        </div>
        <button onClick={onClose} style={styles.backButton}>
          Voltar
        </button>
      </div>

      <div style={styles.body}>
        {/* ESQUERDA: LISTA DE ESCOLHA */}
        <div style={styles.leftPanel}>
          <div style={styles.grid}>
            {activeTab === 'services' ? (
              services.map((s) => (
                <button key={s.id} onClick={() => onAddToCart(s)} style={styles.serviceButton}>
                  <strong style={styles.serviceName}>{s.name}</strong>
                  <span style={styles.servicePrice}>
                    {s.price.toFixed(2)} {AppConfig.localization.currency}
                  </span>
                </button>
              ))
            ) : (
              <p style={styles.emptyText}>Lista de produtos aparecerá aqui em breve...</p>
            )}
          </div>
        </div>

        {/* DIREITA: TALÃO E CHECKOUT */}
        <div style={styles.rightPanel}>
          <div style={styles.clientInputRow}>
            <input
              type="text"
              placeholder="Nome"
              value={clientFirstName}
              onChange={(e) => setClientFirstName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''))}
              style={styles.clientInput}
            />
            <input
              type="text"
              placeholder="Apelido"
              value={clientLastName}
              onChange={(e) => setClientLastName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''))}
              style={styles.clientInput}
            />
            <input
              type="tel"
              placeholder="Telemóvel (9... ou 2...)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, '').replace(/^[^29]+/, '').slice(0, 9))}
              style={styles.clientInput}
            />
          </div>

          <ul style={styles.cartList}>
            {cart.map((item) => (
              <li key={item.id} style={styles.cartItem}>
                <span style={styles.cartItemName}>
                  {item.quantity}x {item.name}
                </span>
                <div>
                  <strong style={styles.cartItemPrice}>
                    {(item.price * item.quantity).toFixed(2)} {AppConfig.localization.currency}
                  </strong>
                  <button onClick={() => onRemoveFromCart(item.id)} style={styles.removeButton}>
                    X
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div style={styles.footer}>
            <div style={styles.totalRow}>
              <span>Total:</span>
              <span style={styles.totalAmount}>
                {total.toFixed(2)} {AppConfig.localization.currency}
              </span>
            </div>
            <button
              onClick={onCheckout}
              disabled={!isReadyToCheckout}
              style={{
                ...styles.checkoutButtonBase,
                backgroundColor: !isReadyToCheckout ? '#d1d5db' : AppConfig.theme.primaryColor,
                cursor: !isReadyToCheckout ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? 'A Registar...' : 'FINALIZAR VENDA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
