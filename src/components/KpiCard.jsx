// KpiCard.jsx — Tarjeta de métrica con stagger, hover y número animado
import React, { useState, useEffect, useRef } from 'react'

const SEVERITY_STYLES = {
  default: { accent: '#E84510', bg: 'var(--bg-subtle)' },
  success: { accent: '#639922', bg: 'var(--success-bg)' },
  warning: { accent: '#BA7517', bg: 'var(--warning-bg)' },
  danger:  { accent: '#A32D2D', bg: 'var(--danger-bg)' },
  info:    { accent: '#185FA5', bg: 'var(--info-bg)' },
}

// Detecta formato del value para re-formatear el número animado
function detectFormat(value) {
  const hasPct    = String(value).endsWith('%')
  const stripped  = String(value).replace('%', '')
  // Formato miles español: dígitos separados por puntos (ej: "20.762")
  const isEsThousands = /^\d{1,3}(\.\d{3})+$/.test(stripped)
  const normalized = isEsThousands
    ? stripped.replace(/\./g, '')
    : stripped.replace(',', '.')
  const target = parseFloat(normalized)
  return { hasPct, isEsThousands, target: isNaN(target) ? null : target }
}

function formatIntermediate(current, hasPct, isEsThousands) {
  if (hasPct)         return `${current.toFixed(1)}%`
  if (isEsThousands)  return Math.round(current).toLocaleString('es')
  return String(Math.round(current))
}

/**
 * @param {string}  props.label
 * @param {string}  props.value       — Valor ya formateado (string)
 * @param {string}  [props.sub]
 * @param {number}  [props.fillPct]   — 0–100
 * @param {number[]}[props.spark]
 * @param {number}  [props.index]     — Posición para el stagger (0-4)
 * @param {'default'|'success'|'warning'|'danger'|'info'} [props.severity]
 */
export default function KpiCard({ label, value, sub, fillPct, spark, severity = 'default', index = 0 }) {
  const style = SEVERITY_STYLES[severity]
  const [displayValue, setDisplayValue] = useState(value)
  const rafRef = useRef(null)

  useEffect(() => {
    const { hasPct, isEsThousands, target } = detectFormat(value)

    // Si no hay target numérico no animamos
    if (target === null || target === 0) {
      setDisplayValue(value)
      return
    }

    const startTs  = performance.now()
    const duration = 1200

    function step(now) {
      const progress = Math.min((now - startTs) / duration, 1)
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(formatIntermediate(eased * target, hasPct, isEsThousands))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        setDisplayValue(value) // snap al valor exacto final
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return (
    <div
      className="kpi-card surface"
      style={{ '--stagger-index': index, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {/* Label */}
      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>

      {/* Value animado */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {displayValue}
      </span>

      {/* Sub */}
      {sub && (
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{sub}</span>
      )}

      {/* Sparkline SVG */}
      {spark && spark.length > 1 && (
        <Sparkline data={spark} color={style.accent} />
      )}

      {/* Progress bar */}
      {fillPct !== undefined && (
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(fillPct, 100)}%`, background: style.accent, borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>
      )}
    </div>
  )
}

function Sparkline({ data, color }) {
  const W = 100, H = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 4 }} aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
