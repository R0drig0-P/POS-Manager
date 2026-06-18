import { JSX, CSSProperties, useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { AppConfig } from '../../config'

interface Worker {
  id: string
  name: string
  roles?: string[]
  on_shift?: boolean
}

interface AddWorkerPopupProps {
  onClose: () => void
  onSuccess: () => void
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
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
  modal: {
    backgroundColor: '#fff',
    padding: '32px',
    borderRadius: '16px',
    width: '400px',
    maxWidth: '90%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh'
  },
  title: {
    margin: '0 0 24px 0',
    fontSize: '24px',
    color: AppConfig.theme.primaryColor
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    flex: 1,
    marginBottom: '24px'
  },
  workerButton: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: AppConfig.theme.primaryColor,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s'
  },
  rolesText: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 'normal',
    marginTop: '4px'
  },
  emptyMessage: { color: '#6b7280', textAlign: 'center', padding: '20px' },
  cancelButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
}

export default function AddWorkerPopup({ onClose, onSuccess }: AddWorkerPopupProps): JSX.Element {
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAvailableWorkers()
  }, [])

  async function fetchAvailableWorkers(): Promise<void> {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('workers')
      .select('id, name, roles, on_shift')
      .eq('is_active', true)
      .order('name')

    if (!error && data) {
      setAvailableWorkers(data.filter((w) => w.on_shift !== true))
    }
    setIsLoading(false)
  }

  async function handleSelectWorker(workerId: string): Promise<void> {
    const { error } = await supabase.from('workers').update({ on_shift: true }).eq('id', workerId)
    
    if (error) {
      alert('Erro ao iniciar turno: ' + error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Iniciar Turno</h2>
        
        <div style={styles.list}>
          {isLoading ? (
            <div style={styles.emptyMessage}>A carregar equipa...</div>
          ) : availableWorkers.length === 0 ? (
            <div style={styles.emptyMessage}>Toda a equipa ativa já iniciou turno hoje.</div>
          ) : (
            availableWorkers.map((worker) => (
              <button key={worker.id} style={styles.workerButton} onClick={() => handleSelectWorker(worker.id)}>
                <div>{worker.name}</div>
                <div style={styles.rolesText}>{worker.roles?.join(', ') || 'Sem categoria'}</div>
              </button>
            ))
          )}
        </div>

        <button type="button" onClick={onClose} style={styles.cancelButton}>
          Cancelar
        </button>
      </div>
    </div>
  )
}