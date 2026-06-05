import { JSX } from 'react'
import { AppConfig } from '../../config'

interface WorkerCardProps {
  name: string
  onClick: () => void
}

export default function WorkerCard({ name, onClick }: WorkerCardProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px 48px',
        backgroundColor: AppConfig.theme.surfaceColor,
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '24px',
        fontWeight: '600',
        color: AppConfig.theme.primaryColor,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        transition: 'transform 0.1s',
        minWidth: '240px',
        flexShrink: 0
      }}
    >
      {name}
    </button>
  )
}