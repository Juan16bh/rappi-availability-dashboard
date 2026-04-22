// AnomalyPanel.jsx — Panel de anomalías detectadas por AI
import React from 'react'
import { ANOMALIES } from '../data/availabilityData'

const SEVERITY_CONFIG = {
  warning: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', border: '#BA7517', icon: '⚠' },
  info:    { bg: 'var(--info-bg)',    text: 'var(--info-text)',    border: '#185FA5', icon: 'ℹ' },
  danger:  { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  border: '#A32D2D', icon: '✕' },
}

export default function AnomalyPanel() {
  return (
    <div className="surface" style={{ padding: '0.9rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 500, fontSize: 12 }}>Anomaly Detection</span>
        <span className="badge badge-warn">
          {ANOMALIES.length} detectadas · AI
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ANOMALIES.map(a => {
          const cfg = SEVERITY_CONFIG[a.severity]
          return (
            <div key={a.id} style={{
              background: cfg.bg, borderLeft: `3px solid ${cfg.border}`,
              borderRadius: '0 6px 6px 0', padding: '8px 10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                <span style={{ fontSize: 12 }}>{cfg.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: cfg.text }}>{a.label}</span>
                <span style={{ fontSize: 10, color: cfg.text, marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                  {a.time}
                </span>
              </div>
              <p style={{ fontSize: 11, color: cfg.text, lineHeight: 1.5, opacity: 0.9 }}>
                {a.description}
              </p>
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 10 }}>
        Detección basada en análisis estadístico de la serie temporal y contexto de Claude AI.
      </p>
    </div>
  )
}
