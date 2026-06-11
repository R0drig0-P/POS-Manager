import { JSX, CSSProperties, useState } from 'react'
import { AppConfig } from '../../config'

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

interface WorkerDetailsOverlayProps {
  workerName: string
  workerSales: Sale[]
  isDeleteMode: boolean
  onClose: () => void
  onAddService: () => void
  onToggleDeleteMode: (e: React.MouseEvent) => void
  onDeleteSale: (id: string) => void
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: '80px',
    backgroundColor: '#f9fafb',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb'
  },
  headerTitle: { margin: 0, fontSize: '24px' },
  closeButton: {
    padding: '8px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: AppConfig.theme.dangerColor,
    color: '#fff',
    border: 'none',
    borderRadius: '8px'
  },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  leftPanel: {
    flex: 3,
    padding: '24px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  historyTitle: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#6b7280',
    fontSize: '16px',
    textTransform: 'uppercase'
  },
  saleCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    position: 'relative'
  },
  saleInfo: { flex: 1, cursor: 'pointer' },
  saleAmountRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' },
  saleAmount: { fontSize: '20px', color: '#111827' },
  saleSummary: { fontSize: '18px', color: '#4b5563' },
  saleTime: { fontSize: '14px', color: '#9ca3af' },
  deleteButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    color: AppConfig.theme.dangerColor,
    border: 'none',
    cursor: 'pointer',
    marginLeft: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyMessage: { color: '#9ca3af', textAlign: 'center', padding: '40px', fontSize: '18px' },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeft: '1px solid #e5e7eb',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  addServiceButton: {
    padding: '24px',
    backgroundColor: AppConfig.theme.successColor,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
  },
  actionButtonBase: {
    padding: '20px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '16px',
    width: '450px',
    maxWidth: '90%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  modalTitle: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    color: AppConfig.theme.primaryColor,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '12px'
  },
  modalClientRow: { fontSize: '16px', color: '#4b5563', marginBottom: '8px' },
  modalItemList: {
    listStyle: 'none',
    padding: 0,
    margin: '24px 0',
    borderTop: '1px dashed #e5e7eb',
    borderBottom: '1px dashed #e5e7eb'
  },
  modalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    fontSize: '18px',
    color: '#111827'
  },
  modalTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '24px',
    fontWeight: 'bold',
    color: AppConfig.theme.successColor,
    marginBottom: '24px'
  },
  modalCloseButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
}

export default function WorkerDetailsOverlay({
  workerName,
  workerSales,
  isDeleteMode,
  onClose,
  onAddService,
  onToggleDeleteMode,
  onDeleteSale
}: WorkerDetailsOverlayProps): JSX.Element {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const totalDayAmount = workerSales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const totalDayServices = workerSales.reduce(
    (sum, sale) => sum + sale.sale_items.reduce((s, item) => s + item.quantity, 0),
    0
  )

  return (
    <div style={styles.overlay}>
      {/* Header do Widget */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Trabalhador: {workerName}</h2>
        <button onClick={onClose} style={styles.closeButton}>
          Fechar
        </button>
      </div>

      <div style={styles.body}>
        {/* ESQUERDA: LISTA DE VENDAS DO DIA */}
        <div style={styles.leftPanel}>
          <h3 style={styles.historyTitle}>
            Histórico de Hoje • {totalDayAmount.toFixed(2)} {AppConfig.localization.currency} -{' '}
            {totalDayServices} serviços
          </h3>
          {workerSales.map((sale) => {
            const time = new Date(sale.created_at).toLocaleTimeString(
              AppConfig.localization.locale,
              { hour: '2-digit', minute: '2-digit' }
            )
            const summary = sale.sale_items.map((i) => `${i.quantity}x ${i.item_name}`).join(' | ')

            return (
              <div key={sale.id} style={styles.saleCard} onClick={() => setSelectedSale(sale)}>
                <div style={styles.saleInfo}>
                  <div style={styles.saleAmountRow}>
                    <strong style={styles.saleAmount}>
                      {sale.total_amount.toFixed(2)} {AppConfig.localization.currency}
                    </strong>
                    <span style={styles.saleSummary}>• {summary}</span>
                  </div>
                  <div style={styles.saleTime}>
                    {time}{' '}
                    {sale.clients?.name ? `- Cliente: ${sale.clients.name}` : '- Registo Rápido'}
                  </div>
                </div>

                {isDeleteMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSale(sale.id)
                    }}
                    style={styles.deleteButton}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
          {workerSales.length === 0 && (
            <div style={styles.emptyMessage}>Nenhum registo efetuado hoje.</div>
          )}
        </div>

        {/* DIREITA: BOTÕES DE AÇÃO */}
        <div style={styles.rightPanel}>
          <button onClick={onAddService} style={styles.addServiceButton}>
            Adicionar Serviço
          </button>

          <button
            onClick={onToggleDeleteMode}
            style={{
              ...styles.actionButtonBase,
              backgroundColor: isDeleteMode ? '#fef2f2' : AppConfig.theme.backgroundColor,
              color: isDeleteMode ? AppConfig.theme.dangerColor : '#374151',
              border: isDeleteMode
                ? `2px solid ${AppConfig.theme.dangerColor}`
                : '1px solid #d1d5db'
            }}
          >
            {isDeleteMode ? 'Cancelar Apagar' : 'Remover Serviço'}
          </button>
        </div>
      </div>

      {/* MODAL / WIDGET DA FATURA DETALHADA */}
      {selectedSale && (
        <div style={styles.modalBackdrop} onClick={() => setSelectedSale(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {new Date(selectedSale.created_at).toLocaleTimeString(AppConfig.localization.locale, {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </h2>
            {selectedSale.clients && (
              <>
                <div style={styles.modalClientRow}>
                  <strong>Cliente:</strong> {selectedSale.clients.name}
                </div>

              </>
            )}
            <ul style={styles.modalItemList}>
              {selectedSale.sale_items.map((item, idx) => (
                <li key={idx} style={styles.modalItem}>
                  <span>
                    {item.quantity}x {item.item_name}
                  </span>
                  <strong>
                    {(item.price_at_sale * item.quantity).toFixed(2)}{' '}
                    {AppConfig.localization.currency}
                  </strong>
                </li>
              ))}
            </ul>
            <div style={styles.modalTotal}>
              <span>Total:</span>
              <span>
                {selectedSale.total_amount.toFixed(2)} {AppConfig.localization.currency}
              </span>
            </div>
            <button style={styles.modalCloseButton} onClick={() => setSelectedSale(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
