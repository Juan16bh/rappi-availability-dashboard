// AvailabilityChart.jsx — Gráfico principal con Recharts
import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
} from 'recharts'
import { FEB01_SERIES, SLO_TARGET, ANOMALIES } from '../data/availabilityData'
import CsvUploader from './CsvUploader'

const VIEWS = [
  { id: 'ts',   label: 'Serie temporal' },
  { id: 'dist', label: 'Distribución' },
  { id: 'rate', label: 'Δ Tasa de cambio' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label} COT</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontFamily: 'var(--font-mono)' }}>
          {p.name}: {Number(p.value).toLocaleString('es')}
          {p.name === 'Stores' ? ' tiendas' : ''}
        </p>
      ))}
    </div>
  )
}

export default function AvailabilityChart({ series = FEB01_SERIES, stats, datasetLabel = 'Feb 1, 2026', onDataLoad }) {
  const [view, setView] = useState('ts')
  const isDark = document.documentElement.dataset.theme === 'dark'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const axisColor = isDark ? '#888780' : '#B4B2A9'

  const sampled = useMemo(() => series.filter((_, i) => i % 3 === 0), [series])

  const distData = useMemo(() => {
    const bins = [0, 2500, 5000, 7500, 10000, 12500, 15000, 17500, 20000, 22500, 25000]
    return bins.slice(0, -1).map((lo, i) => {
      const hi = bins[i + 1]
      const count = series.filter(d => d.value >= lo && d.value < hi).length
      return { label: `${(lo / 1000).toFixed(0)}k–${(hi / 1000).toFixed(0)}k`, count, aboveSLO: lo >= SLO_TARGET }
    })
  }, [series])

  const rateData = useMemo(() =>
    sampled.slice(1).map((d, i) => ({
      time: d.timeLabel,
      delta: d.value - sampled[i].value,
    }))
  , [sampled])

  // Detectar si hay zona de anomalía (sólo en datos Feb 1 con la meseta conocida)
  const hasAnomalyZone = series === FEB01_SERIES

  return (
    <div className="surface" style={{ padding: '1rem 1.25rem' }}>
      {/* Header: título + uploader + tab switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <div>
            <span style={{ fontWeight: 500, fontSize: 13 }}>Disponibilidad en el tiempo</span>
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-tertiary)' }}>UTC-5 (COT)</span>
          </div>
          {onDataLoad && (
            <CsvUploader onDataLoad={onDataLoad} currentLabel={datasetLabel} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-subtle)', padding: 3, borderRadius: 8, flexShrink: 0 }}>
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              style={{
                padding: '3px 10px', fontSize: 11, border: 'none', borderRadius: 5, cursor: 'pointer',
                background: view === v.id ? 'var(--bg-surface)' : 'transparent',
                color: view === v.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: view === v.id ? 500 : 400,
                fontFamily: 'var(--font-sans)',
                boxShadow: view === v.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Serie temporal ─── */}
      {view === 'ts' && (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={sampled} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rappiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#E84510" stopOpacity={0.20} />
                <stop offset="95%" stopColor="#E84510" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="timeLabel" tick={{ fontSize: 10, fill: axisColor }} interval={14} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: axisColor }} width={36} />
            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine y={SLO_TARGET} stroke="#3b82f6" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: 'SLO 15k', position: 'right', fontSize: 9, fill: '#3b82f6' }} />

            {hasAnomalyZone && (
              <ReferenceArea x1="06:33" x2="06:39" fill="rgba(234,179,8,0.12)" stroke="rgba(234,179,8,0.3)" strokeWidth={1} />
            )}

            <Area
              type="monotone"
              dataKey="value"
              name="Stores"
              stroke="#E84510"
              strokeWidth={2.5}
              fill="url(#rappiGradient)"
              activeDot={{ r: 4, fill: '#E84510' }}
              dot={(props) => {
                if (!hasAnomalyZone) return null
                const origIdx = props.index * 3
                const inZone = (origIdx >= 133 && origIdx <= 151) || (origIdx >= 213 && origIdx <= 289)
                if (!inZone) return null
                return <circle key={props.index} cx={props.cx} cy={props.cy} r={2.5} fill="#f59e0b" stroke="none" />
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* ── Distribución ─── */}
      {view === 'dist' && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={distData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} width={36} />
            <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-mono)', color: payload[0].fill }}>
                  {payload[0].value} puntos ({((payload[0].value / series.length) * 100).toFixed(1)}%)
                </p>
              </div>
            ) : null} />
            <Bar dataKey="count" name="Puntos"
              fill="#E84510"
              radius={[4, 4, 0, 0]}
              // Barras en azul si están bajo SLO
            />
            <ReferenceLine x="15k–17.5k" stroke="#3b82f6" strokeDasharray="4 2"
              label={{ value: 'SLO', fontSize: 9, fill: '#3b82f6' }} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* ── Tasa de cambio ─── */}
      {view === 'rate' && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rateData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: axisColor }} interval={7} />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} width={40} />
            <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p style={{ fontFamily: 'var(--font-mono)', color: payload[0].value >= 0 ? '#639922' : '#A32D2D' }}>
                  Δ {payload[0].value >= 0 ? '+' : ''}{Number(payload[0].value).toLocaleString('es')} tiendas/30s
                </p>
              </div>
            ) : null} />
            <ReferenceLine y={0} stroke={axisColor} strokeWidth={1} />
            <Bar dataKey="delta" name="Δ tiendas"
              fill="#639922"
              radius={[2, 2, 0, 0]}
              // Color dinámico por valor
            />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <LegendDot color="#E84510" label="visible stores" />
        <LegendDot color="#3b82f6" label="SLO mínimo (15k)" dashed />
        <LegendDot color="rgba(234,179,8,0.5)" label="zona de anomalía" square />
      </div>
    </div>
  )
}

function LegendDot({ color, label, dashed, square }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-secondary)' }}>
      {square
        ? <span style={{ width: 12, height: 10, background: color, borderRadius: 2 }} />
        : <span style={{ width: 16, height: 2, background: color, borderTop: dashed ? `2px dashed ${color}` : 'none', borderRadius: dashed ? 0 : 1 }} />
      }
      {label}
    </span>
  )
}
