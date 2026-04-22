// Header.jsx — Barra superior con título, estado y toggle de dark mode
import React from 'react'
import { STATS } from '../data/availabilityData'

export default function Header({ darkMode, onToggleDark }) {
  return (
    <header className="header-root">
      {/* Izquierda — Brand + título */}
      <div className="header-brand">
        {/* Wordmark Rappi */}
        <svg viewBox="0 0 100 28" width="80" height="28" xmlns="http://www.w3.org/2000/svg" aria-label="Rappi" style={{ flexShrink: 0 }}>
          <text x="0" y="22" fontFamily="'Arial Black',Arial,sans-serif"
            fontWeight="900" fontSize="24" fill="#E84510" letterSpacing="-0.5">rappi</text>
        </svg>

        <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} />

        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            Monitor de Disponibilidad de Tiendas
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Aplicación desarrollada para la Prueba Técnica · RappiMakers 2026
          </p>
        </div>

        {/* Badge Operational con ping */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--success-bg)', borderRadius: 20,
          padding: '3px 10px', flexShrink: 0,
        }}>
          {/* Ping dot */}
          <span style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#22c55e',
              animation: 'ping 1.6s ease-out infinite',
            }} />
            <span style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: '#22c55e',
            }} />
          </span>
          <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--success-text)' }}>Operational</span>
        </div>
      </div>

      {/* Derecha — Estadísticas + toggle */}
      <div className="header-right">
        <div className="header-stat">
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>SLO target</p>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>≥ 15,000 stores</p>
        </div>

        <div className="header-divider" />

        <div className="header-stat">
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>SLO compliance</p>
          <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500, color: STATS.sloCompliance >= 80 ? 'var(--success-text)' : 'var(--warning-text)' }}>
            {STATS.sloCompliance}%
          </p>
        </div>

        <div className="header-divider" />

        <button
          onClick={onToggleDark}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            cursor: 'pointer', fontSize: 15, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  )
}
