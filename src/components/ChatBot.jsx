// ChatBot.jsx — Asistente AI con Claude (Anthropic API)
import React, { useState, useRef, useEffect } from 'react'
import { STATS, SLO_TARGET } from '../data/availabilityData'

// ── Contexto del dataset para el system prompt ─────────────────────────
const DATA_CONTEXT = `
Dataset: synthetic_monitoring_visible_stores de Rappi.
Fecha: 1 febrero 2026. Hora: 06:11:20–07:00:00 (COT, GMT-5). Intervalo: 10s. Total: 290 puntos.

Estadísticas clave:
- Mínimo: ${STATS.min.toLocaleString('es')} (inicio 06:11:20)
- Máximo: ${STATS.max.toLocaleString('es')} (≈06:46:20 — pico absoluto)
- Promedio ventana: ${STATS.avg.toLocaleString('es')} tiendas
- Valor final (07:00): ${STATS.final.toLocaleString('es')} tiendas
- SLO target: ≥${SLO_TARGET.toLocaleString('es')} tiendas
- SLO compliance: ${STATS.sloCompliance}% del tiempo
- Error budget consumido: ${(100 - STATS.sloCompliance).toFixed(1)}%

Fases identificadas:
1. Ramp-up agresivo (06:11–06:30): 37 → 6,034 tiendas — ascenso muy rápido (~16 tiendas/s)
2. Aceleración / pico (06:30–06:46): 6,034 → 20,762 — continúa subiendo
3. Estabilización (06:46–07:00): 20,762 → 18,751 — leve descenso (-9.7%)

Anomalías detectadas:
- Meseta 06:33–06:39: valores estancados 6,600–7,100 sin crecimiento. Posible throttling o saturación del sistema de monitoreo antes de retomar el ramp-up.
- Descenso post-pico: -9.7% (20,762→18,751) en 14 minutos. Comportamiento normal al cerrar la ventana de apertura matutina de tiendas.

Golden Signals (Google SRE):
- Traffic: ${STATS.max.toLocaleString('es')} peak
- Saturation: ${Math.round((STATS.final / STATS.max) * 100)}% al cierre
- Errors: N/A (no hay datos de error rate en el CSV)
- Latency: 10s intervalo de sondeo

También existen archivos de Feb 11 2026 (07:00–14:00 aprox.) con patrones similares pero no cargados en detalle.
Rappi es una plataforma de delivery en Latinoamérica. La disponibilidad de tiendas impacta directamente la experiencia del usuario y los ingresos.
`.trim()

const SYSTEM_PROMPT = `Eres un experto SRE (Site Reliability Engineer) de Rappi especializado en store availability y observabilidad operacional. 
Responde en español, de forma concisa y técnica. 
Usa conceptos como SLO, SLI, error budget, Golden Signals, anomaly detection, ramp-up cuando sea relevante.
Si el usuario pregunta algo fuera del dataset, indícalo honestamente y ofrece lo que sí puedes calcular con los datos disponibles.

Datos del sistema:\n${DATA_CONTEXT}`

const QUICK_QUESTIONS = [
  '¿Cuándo fue el pico y qué significa operacionalmente?',
  'Explica la anomalía de 06:33–06:39',
  '¿Cumplimos el SLO? ¿Cuánto error budget queda?',
  '¿Qué son los Golden Signals y cómo aplican aquí?',
  'Compara el ramp-up con estándares de la industria',
]

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hola! Soy el asistente AI de disponibilidad de Rappi. Tengo acceso a los datos reales de tiendas del 1 de febrero 2026 — SLOs, anomalías y Golden Signals incluidos. ¿Qué quieres analizar?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  async function sendMessage(text) {
    if (!text.trim() || loading) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setShowQuick(false)

    // Historial para la API (excluir el mensaje de bienvenida inicial)
    const apiHistory = newMessages.slice(1)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: SYSTEM_PROMPT,
          messages: apiHistory,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const reply = data.content?.[0]?.text || 'Sin respuesta del modelo.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      const errMsg = apiKey
        ? `Error al conectar con la API: ${err.message}`
        : '⚠ Falta la API key. Crea un archivo .env con VITE_ANTHROPIC_API_KEY=sk-ant-...'
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 460,
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Availability AI</span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Claude · claude-sonnet-4</span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 12,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            padding: '8px 11px',
            borderRadius: 10,
            fontSize: 12,
            lineHeight: 1.55,
            maxWidth: m.role === 'user' ? '85%' : '95%',
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? '#E84510' : 'var(--bg-subtle)',
            color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
          }}>
            {m.content}
          </div>
        ))}

        {loading && (
          <div style={{
            padding: '8px 11px', borderRadius: 10, fontSize: 12,
            background: 'var(--bg-subtle)', alignSelf: 'flex-start',
            color: 'var(--text-tertiary)',
          }}>
            Analizando datos...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      {showQuick && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 5,
          padding: '0 10px 8px',
        }}>
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} style={{
              fontSize: 10, padding: '3px 8px',
              border: '1px solid var(--border)', borderRadius: 12,
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => e.target.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {q.length > 38 ? q.slice(0, 38) + '…' : q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, padding: 10,
        borderTop: '1px solid var(--border)', flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Pregunta sobre los datos..."
          disabled={loading}
          style={{
            flex: 1, fontSize: 12, borderRadius: 8, padding: '6px 10px',
            border: '1px solid var(--border)', background: 'var(--bg-subtle)',
            color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 500,
            background: loading || !input.trim() ? 'var(--bg-subtle)' : '#E84510',
            color: loading || !input.trim() ? 'var(--text-tertiary)' : '#fff',
            border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-sans)',
          }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
