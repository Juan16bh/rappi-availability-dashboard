// CsvUploader.jsx — Carga y parsea archivos CSV de disponibilidad
import React, { useRef, useState } from 'react'
import Papa from 'papaparse'
import { Upload, FileText, X } from 'lucide-react'
import { SLO_TARGET } from '../data/availabilityData'

// Extrae time "HH:MM:SS" de un timestamp como "Sun Feb 11 2026 07:00:10 GMT-0500 (...)"
function parseTimestamp(tsStr) {
  const m = String(tsStr).match(/(\d{1,2}):(\d{2}):(\d{2})/)
  if (!m) return null
  return {
    time: `${m[1].padStart(2, '0')}:${m[2]}:${m[3]}`,
    timeLabel: `${m[1].padStart(2, '0')}:${m[2]}`,
  }
}

function parseSeries(results) {
  const rows = results.data.filter(row => Array.isArray(row) && row.length > 2)
  if (rows.length < 2) throw new Error('CSV vacío o formato inválido')

  // Primera fila = encabezados (primer celda vacía o "metric", resto son timestamps)
  const headerRow = rows[0]
  const timestamps = headerRow.slice(1)

  const dataRow = rows.find(r =>
    String(r[0]).includes('synthetic_monitoring_visible_stores')
  )
  if (!dataRow) throw new Error('Métrica "synthetic_monitoring_visible_stores" no encontrada')

  const rawValues = dataRow.slice(1)
  const series = []
  for (let i = 0; i < rawValues.length; i++) {
    const v = Number(rawValues[i])
    if (isNaN(v) || !timestamps[i]) continue
    const parsed = parseTimestamp(timestamps[i])
    series.push({
      value: v,
      index: series.length,
      time: parsed?.time ?? `T+${i}`,
      timeLabel: parsed?.timeLabel ?? `T+${i}`,
    })
  }
  if (series.length === 0) throw new Error('No se encontraron valores numéricos en el CSV')
  return series
}

export function computeStats(series) {
  const values = series.map(d => d.value)
  const max = Math.max(...values)
  const peakIndex = values.indexOf(max)
  const aboveSLO = values.filter(v => v >= SLO_TARGET).length
  return {
    min: Math.min(...values),
    max,
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    final: values[values.length - 1],
    total: values.length,
    aboveSLO,
    sloCompliance: parseFloat(((aboveSLO / values.length) * 100).toFixed(1)),
    peakIndex,
    peakTime: series[peakIndex]?.time ?? '—',
  }
}

export default function CsvUploader({ onDataLoad, currentLabel }) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)

    Papa.parse(file, {
      skipEmptyLines: true,
      complete(results) {
        try {
          const series = parseSeries(results)
          const stats = computeStats(series)
          // Nombre legible: quitar extensión y timestamp del filename
          const label = file.name.replace(/\.csv$/i, '').replace(/[-_]2026.*$/, '') || file.name
          onDataLoad({ series, stats, label })
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
          e.target.value = ''
        }
      },
      error(err) {
        setError(err.message)
        setLoading(false)
      },
    })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {/* Dataset activo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 8px', borderRadius: 6,
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-secondary)',
        maxWidth: 220, overflow: 'hidden',
      }}>
        <FileText size={11} style={{ flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentLabel}
        </span>
      </div>

      {/* Botón upload */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        title="Cargar archivo CSV de disponibilidad"
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', fontSize: 11, fontWeight: 500,
          border: '1px solid var(--border)', borderRadius: 6,
          cursor: loading ? 'wait' : 'pointer',
          background: 'var(--bg-surface)', color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
          transition: 'opacity 0.15s',
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Upload size={11} />
        {loading ? 'Procesando…' : 'Cargar CSV'}
      </button>

      {/* Error inline */}
      {error && (
        <span style={{
          display: 'flex', alignItems: 'center', gap: 3,
          fontSize: 10, color: 'var(--danger, #c0392b)',
          maxWidth: 180,
        }}>
          <X size={10} />
          {error}
        </span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  )
}
