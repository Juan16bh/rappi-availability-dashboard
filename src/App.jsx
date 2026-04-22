// App.jsx — Layout principal del dashboard
import React, { useState, useEffect, useMemo } from 'react'
import Header          from './components/Header'
import KpiCard         from './components/KpiCard'
import AvailabilityChart from './components/AvailabilityChart'
import SloSummary      from './components/SloSummary'
import AnomalyPanel    from './components/AnomalyPanel'
import GoldenSignals   from './components/GoldenSignals'
import ChatBot         from './components/ChatBot'
import NarrativePanel  from './components/NarrativePanel'
import { STATS, FEB01_SERIES } from './data/availabilityData'
import SplashScreen from './components/SplashScreen'

const DEFAULT_DATASET = {
  series: FEB01_SERIES,
  stats:  STATS,
  label:  'Feb 1, 2026 — 06:11–07:00',
}

// ── Skeleton KPI card ──────────────────────────────────────────────────────
function SkeletonKpiCard() {
  return (
    <div className="surface" style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="skeleton" style={{ height: 10, width: '55%' }} />
      <div className="skeleton" style={{ height: 22, width: '75%' }} />
      <div className="skeleton" style={{ height: 9,  width: '65%' }} />
      <div className="skeleton" style={{ height: 3,  width: '100%', marginTop: 4 }} />
    </div>
  )
}

// ── Tech stack pills para el footer ───────────────────────────────────────
const TECH_STACK = [
  { label: 'React',         color: '#61DAFB', bg: 'rgba(97,218,251,0.12)'  },
  { label: 'Vite',          color: '#BD34FE', bg: 'rgba(189,52,254,0.10)'  },
  { label: 'Recharts',      color: '#E84510', bg: 'rgba(232,69,16,0.10)'   },
  { label: 'Claude AI',     color: '#CC785C', bg: 'rgba(204,120,92,0.12)'  },
  { label: 'Anthropic API', color: '#1A1814', bg: 'rgba(26,24,20,0.07)'    },
]

export default function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [dataset,  setDataset]  = useState(DEFAULT_DATASET)
  const [loading,  setLoading]  = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
  }, [darkMode])

  // Skeleton: 800 ms después de que el splash termina
  useEffect(() => {
    if (showSplash) return
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [showSplash])

  const { stats, series, label } = dataset
  const spark = useMemo(
    () => series.filter((_, i) => i % 5 === 0).map(d => d.value),
    [series]
  )
  const deltaPct = stats.max > 0
    ? ((stats.final - stats.max) / stats.max * 100).toFixed(1)
    : '0.0'

  return (
    <div className={showSplash ? '' : 'app-ready'} style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Header darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <main className="layout-main">

        {/* ── KPI Cards (skeleton o reales) ── */}
        <section className="grid-kpis">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonKpiCard key={i} />)
          ) : (
            <>
              <KpiCard index={0}
                label="Pico de tiendas"
                value={stats.max.toLocaleString('es')}
                sub={`${stats.peakTime} · Golden Signal: Traffic`}
                fillPct={100}
                severity="default"
                spark={spark.slice(-20)}
              />
              <KpiCard index={1}
                label="Tiendas al cierre"
                value={stats.final.toLocaleString('es')}
                sub={`${deltaPct}% respecto al pico`}
                fillPct={Math.round((stats.final / stats.max) * 100)}
                severity="info"
              />
              <KpiCard index={2}
                label="Promedio ventana"
                value={stats.avg.toLocaleString('es')}
                sub={`${stats.total} puntos · intervalo 10s`}
                fillPct={Math.round((stats.avg / stats.max) * 100)}
                severity="default"
              />
              <KpiCard index={3}
                label="SLO Compliance"
                value={`${stats.sloCompliance}%`}
                sub={`${stats.aboveSLO}/${stats.total} puntos ≥ 15k`}
                fillPct={stats.sloCompliance}
                severity={stats.sloCompliance >= 80 ? 'success' : 'warning'}
              />
              <KpiCard index={4}
                label="Anomalías (AI)"
                value="2"
                sub="1 warning · 1 info"
                fillPct={20}
                severity="warning"
              />
            </>
          )}
        </section>

        {/* ── Gráfico principal + Chatbot ── */}
        <section className="grid-chart">
          <AvailabilityChart
            series={series}
            stats={stats}
            datasetLabel={label}
            onDataLoad={setDataset}
          />
          <ChatBot />
        </section>

        {/* ── Narrativa AI ── */}
        <NarrativePanel series={series} stats={stats} datasetLabel={label} />

        {/* ── Bottom row: Golden Signals + Anomalías + SLO ── */}
        <section className="grid-bottom">
          <GoldenSignals />
          <AnomalyPanel />
          <SloSummary />
        </section>

        {/* ── Footer ── */}
        <footer style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px 16px',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Rappi Engineering · Prueba Técnica AI Dashboard 2026
          </span>

          {/* Tech stack pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {TECH_STACK.map(({ label: tech, color, bg }) => (
              <span key={tech} style={{
                fontSize: 10, fontWeight: 500, padding: '2px 8px',
                borderRadius: 20, border: `1px solid ${color}33`,
                background: bg, color,
                fontFamily: 'var(--font-sans)',
              }}>
                {tech}
              </span>
            ))}
          </div>

          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            synthetic_monitoring_visible_stores · COT (UTC−5)
          </span>
        </footer>
      </main>
    </div>
  )
}
