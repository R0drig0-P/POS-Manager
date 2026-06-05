import { JSX } from 'react'
import { AppConfig } from '../../config'

interface WorkerDetailsOverlayProps {
  workerName: string
  workerSales: any[]
  isDeleteMode: boolean
  onClose: () => void
  onAddService: () => void
  onToggleDeleteMode: (e: React.MouseEvent) => void
  onDeleteSale: (id: string) => void
}

export default function WorkerDetailsOverlay({ workerName, workerSales, isDeleteMode, onClose, onAddService, onToggleDeleteMode, onDeleteSale }: WorkerDetailsOverlayProps): JSX.Element {
  return (
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: '80px', backgroundColor: '#f9fafb', zIndex: 10, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header do Widget */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Trabalhador: {workerName}</h2>
        <button onClick={onClose} style={{ padding: '8px 24px', fontSize: '16px', cursor: 'pointer', backgroundColor: AppConfig.theme.dangerColor, color: '#fff', border: 'none', borderRadius: '8px' }}>
          Fechar
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ESQUERDA: LISTA DE VENDAS DO DIA */}
        <div style={{ flex: 3, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#6b7280', fontSize: '16px', textTransform: 'uppercase' }}>Histórico de Hoje</h3>
          {workerSales.map((sale) => {
            const time = new Date(sale.created_at).toLocaleTimeString(AppConfig.localization.locale, { hour: '2-digit', minute: '2-digit' })
            const summary = sale.sale_items.map((i: any) => `${i.quantity}x ${i.item_name}`).join(' | ')
            
            return (
              <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative' }}>
                <div style={{ flex: 1, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '20px', color: '#111827' }}>{sale.total_amount.toFixed(2)} {AppConfig.localization.currency}</strong>
                    <span style={{ fontSize: '18px', color: '#4b5563' }}>• {summary}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>{time} {sale.client_name ? `- Cliente: ${sale.client_name}` : '- Registo Rápido'}</div>
                </div>

                {isDeleteMode && (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteSale(sale.id); }} style={{ padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '20px', marginLeft: '16px' }}>
                    🗑️
                  </button>
                )}
              </div>
            )
          })}
          {workerSales.length === 0 && <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px', fontSize: '18px' }}>Nenhum registo efetuado hoje.</div>}
        </div>

        {/* DIREITA: BOTÕES DE AÇÃO */}
        <div style={{ flex: 1, backgroundColor: '#fff', borderLeft: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={onAddService}
            style={{ padding: '24px', backgroundColor: AppConfig.theme.successColor, color: 'white', border: 'none', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
          >
            ➕ Adicionar Serviço
          </button>
          
          <button
            onClick={onToggleDeleteMode}
            style={{
              padding: '20px',
              backgroundColor: isDeleteMode ? '#fef2f2' : AppConfig.theme.backgroundColor,
              color: isDeleteMode ? AppConfig.theme.dangerColor : '#374151',
              border: isDeleteMode ? `2px solid ${AppConfig.theme.dangerColor}` : '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isDeleteMode ? 'Cancelar Apagar' : 'Remover Serviço'}
          </button>
          
          <button
            style={{
              padding: '20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: 'auto'
            }}
          >
            Detalhes Diários
          </button>
        </div>
      </div>
    </div>
  )
}