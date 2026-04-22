// NarrativePanel.jsx — Narrativa ejecutiva AI generada automáticamente al cargar un dataset
import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { SLO_TARGET } from '../data/availabilityData'

function buildPrompt(series, stats) {
  const start = series[0]?.timeLabel ?? '—'
  const end   = series[series.length - 1]?.timeLabel ?? '—'

  // Detección ligera de anomalías: segmentos con delta ~0 (plateau)
  const sampled = series.filter((_, i) => i % 3 === 0)
  const deltas = sampled.slice(1).map((d, i) => Math.abs(d.value - sampled[i].value))
  const avgDelta = deltas.reduce((a, b) => a + b, 0) / (deltas.length || 1)
  const flatCount = deltas.filter(d => d < avgDelta * 0.1).length
  const plateauNote = flatCount > 6
    ? `- Plateau detectado: ${flatCount} segmentos con variación < 10% del delta promedio (posible throttling o saturación)`
    : ''

  // Detectar caída post-pico
  const peakIdx = stats.peakIndex
  const postPeak = peakIdx > 0 && peakIdx < series.length - 1
    ? series[series.length - 1].value - stats.max
    : 0
  const postPeakPct = stats.max > 0 ? ((postPeak / stats.max) * 100).toFixed(1) : '0'

  return `Analiza este dataset de disponibilidad de tiendas Rappi y escribe exactamente 3 oraciones en español para un engineering manager. Sin encabezados, sin listas, solo el párrafo.

Datos del dataset:
- Ventana horaria: ${start}–${end} COT
- Total puntos: ${stats.total} (cada 10 segundos)
- Valor inicial: ${stats.min.toLocaleString('es')} tiendas
- Pico máximo: ${stats.max.toLocaleString('es')} tiendas a las ${stats.peakTime}
- Promedio: ${stats.avg.toLocaleString('es')} tiendas
- Valor al cierre: ${stats.final.toLocaleString('es')} tiendas (${postPeakPct}% vs pico)
- SLO target: ≥${SLO_TARGET.toLocaleString('es')} tiendas
- SLO compliance: ${stats.sloCompliance}% del tiempo
- Error budget consumido: ${(100 - stats.sloCompliance).toFixed(1)}%
${plateauNote}

Estructura las 3 oraciones así: (1) comportamiento general de la ventana, (2) estado del SLO y error budget, (3) anomalía o patrón más relevante con implicación operacional.`
}

export default function NarrativePanel({ series, stats, datasetLabel }) {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [triggered, setTriggered] = useState(false)
  const prevLabelRef = useRef(null)
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  // Generar automáticamente cada vez que cambia el dataset
  useEffect(() => {
    if (datasetLabel === prevLabelRef.current) return
    prevLabelRef.current = datasetLabel
    setTriggered(true)
    generate()
  }, [datasetLabel]) // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    if (!apiKey) {
      setError('Configura VITE_ANTHROPIC_API_KEY en .env para habilitar la narrativa AI')
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setText('')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 320,
          stream: true,
          system: 'Eres un experto SRE de Rappi. Responde solo con el párrafo solicitado, sin introducción ni cierre.',
          messages: [{ role: 'user', content: buildPrompt(series, stats) }],
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData?.error?.message ?? `HTTP ${res.status}`)
      }

      // Leer stream SSE
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break
          try {
            const parsed = JSON.parse(raw)
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              setText(prev => prev + parsed.delta.text)
            }
          } catch { /* línea parcial, ignorar */ }
        }
      }
    } catch (err) {
      setError(`Error al generar narrativa: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!triggered) return null

  return (
    <div
      className="surface"
      style={{
        padding: '0.875rem 1.25rem',
        marginBottom: '1.25rem',
        borderLeft: '3px solid #E84510',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={13} color="#E84510" />
          <span style={{ fontSize: 12, fontWeight: 600 }}>Análisis AI</span>
          <span style={{
            fontSize: 10, color: 'var(--text-tertiary)',
            background: 'var(--bg-subtle)', padding: '1px 6px',
            borderRadius: 4, border: '1px solid var(--border)',
          }}>
            {datasetLabel}
          </span>
        </div>

        <button
          onClick={() => generate()}
          disabled={loading}
          title="Regenerar análisis"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, padding: '3px 8px',
            border: '1px solid var(--border)', borderRadius: 6,
            background: 'transparent', cursor: loading ? 'wait' : 'pointer',
            color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={10} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Regenerar
        </button>
      </div>

      {/* Estado: cargando */}
      {loading && !text && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Generando análisis</span>
          <LoadingDots />
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger, #c0392b)', margin: 0 }}>{error}</p>
      )}

      {/* Narrativa (streaming) */}
      {text && (
        <p style={{
          fontSize: 13, lineHeight: 1.7, margin: 0,
          color: 'var(--text-primary)',
        }}>
          {text}
          {loading && <span style={{ opacity: 0.4 }}>▌</span>}
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function LoadingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--text-tertiary)',
          display: 'inline-block',
          animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </span>
  )
}
