// SloSummary.jsx — Resumen de SLO / SLI / Error Budget
import React from 'react'
import { STATS, SLO_TARGET, SLO_LABEL } from '../data/availabilityData'

function Row({ label, value, highlight }) {
  return (
    <tr>
      <td style={{ padding: '5px 0', color: 'var(--text-secondary)', fontSize: 11 }}>{label}</td>
      <td style={{ padding: '5px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11,
        color: highlight ? (highlight === 'ok' ? 'var(--success-text)' : 'var(--warning-text)') : 'var(--text-primary)' }}>
        {value}
      </td>
    </tr>
  )
}

export default function SloSummary() {
  const errorBudgetUsed = parseFloat((100 - STATS.sloCompliance).toFixed(1))
  const isCompliant = STATS.sloCompliance >= 80

  return (
    <div className="surface" style={{ padding: '0.9rem 1.1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontWeight: 500, fontSize: 12 }}>SLO / SLI Summary</span>
        <span className={`badge ${isCompliant ? 'badge-ok' : 'badge-warn'}`}>
          {isCompliant ? 'Compliant' : 'At risk'}
        </span>
      </div>

      {/* Barra de compliance */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
          <span>SLO compliance</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>
            {STATS.sloCompliance}%
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${STATS.sloCompliance}%`,
            background: isCompliant ? '#639922' : '#BA7517', borderRadius: 3, transition: 'width 0.6s ease' }} />
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <Row label="SLI medido (avg)" value={STATS.avg.toLocaleString('es') + ' stores'} />
          <Row label="SLO objetivo" value={SLO_LABEL} />
          <Row label="Puntos sobre SLO" value={`${STATS.aboveSLO} / ${STATS.total}`} />
          <Row label="Error budget usado" value={`${errorBudgetUsed}%`} highlight={errorBudgetUsed > 30 ? 'warn' : 'ok'} />
          <Row label="Pico absoluto" value={STATS.max.toLocaleString('es') + ' · ' + STATS.peakTime} />
          <Row label="Valor final" value={STATS.final.toLocaleString('es') + ' stores'} />
        </tbody>
      </table>

      <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>
        SLO definido para: prueba técnica Rappi 2026. En producción ajustar con datos históricos de percentil p99.
      </p>
    </div>
  )
}
