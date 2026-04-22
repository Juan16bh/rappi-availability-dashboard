// GoldenSignals.jsx — Google SRE Golden Signals panel
import React from 'react'
import { STATS } from '../data/availabilityData'

const SIGNALS = [
  {
    name: 'Traffic',
    value: STATS.max.toLocaleString('es'),
    unit: 'stores peak',
    description: 'Carga máxima sobre el sistema en la ventana analizada.',
    badge: 'ok',
    badgeLabel: 'normal',
  },
  {
    name: 'Saturation',
    value: `${Math.round((STATS.final / STATS.max) * 100)}%`,
    unit: 'del pico al cierre',
    description: 'Qué tan "lleno" está el sistema. Caída del 9.7% post-pico es aceptable.',
    badge: 'ok',
    badgeLabel: 'ok',
  },
  {
    name: 'Errors',
    value: 'N/A',
    unit: 'sin datos de error',
    description: 'El CSV no contiene métricas de error rate. En producción: HTTP 5xx / failed probes.',
    badge: 'info',
    badgeLabel: 'sin datos',
  },
  {
    name: 'Latency',
    value: '10s',
    unit: 'intervalo de sondeo',
    description: 'Cada punto de dato representa el estado del sistema en ese instante. Monitoreo cada 10 segundos.',
    badge: 'ok',
    badgeLabel: 'aceptable',
  },
]

export default function GoldenSignals() {
  return (
    <div className="surface" style={{ padding: '0.9rem 1.1rem' }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontWeight: 500, fontSize: 12 }}>Golden Signals</span>
        <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-tertiary)' }}>Google SRE Book</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {SIGNALS.map(s => (
          <div key={s.name} style={{
            background: 'var(--bg-subtle)', borderRadius: 8, padding: '8px 10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.name}</span>
              <span className={`badge badge-${s.badge}`} style={{ fontSize: 9 }}>{s.badgeLabel}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', margin: '2px 0' }}>
              {s.value}
            </p>
            <p style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{s.unit}</p>
            <p style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
