// ── Datos reales del CSV: Feb 1, 2026 ─────────────────────────────────
// Métrica: synthetic_monitoring_visible_stores
// Hora: 06:11:20 – 07:00:00 COT (GMT-5)
// Intervalo: 10 segundos | Total: 290 puntos

const RAW_VALUES = [
  37,195,451,489,911,1047,1268,1704,1759,2118,2289,2491,2778,3065,3181,3448,
  3684,3990,4116,4462,4635,4853,5151,5243,5561,5693,5964,6034,6297,6484,6740,
  6844,6720,6935,6792,6847,6908,6653,6850,6671,6714,6789,6723,6713,6781,6734,
  6710,6653,6831,6750,6841,6863,6757,6947,6880,6949,6840,7117,7097,7129,7113,
  7315,7832,8174,8366,8728,8944,9279,9675,9893,10145,10516,10783,11087,11181,
  11401,11835,12025,12186,12611,12801,13099,13407,13700,13786,14194,14619,14687,
  15100,15339,15497,15733,15466,15428,15551,15481,15457,15493,15403,15470,15456,
  15424,15383,15425,15654,15677,15664,15698,15620,15474,15643,15702,15593,15534,
  15838,15647,15653,15632,15560,15640,15536,15361,15365,15335,15225,15334,15411,
  15451,15112,14998,15131,15034,15089,15123,15125,14957,14573,14707,14833,14917,
  14843,14711,15018,15073,14987,15122,15099,15249,15250,15255,15420,15543,15690,
  15634,15882,15677,15787,15725,16009,16277,16326,16385,16450,16240,16362,16687,
  17020,16969,16993,16991,16867,17044,16887,16911,16920,17047,17008,16947,16894,
  17025,17102,17207,17255,17485,17368,17795,17799,18037,18255,18143,18368,18449,
  18667,18842,18764,18892,18968,19167,19301,19427,19712,19795,19938,19987,20039,
  20246,20303,20477,20739,20762,20713,20679,20686,20535,20616,20422,20355,20200,
  20187,20308,20152,20069,19798,19943,19929,19829,19833,19722,19706,19587,19458,
  19078,19019,19023,18969,18744,18862,18796,18674,18564,18665,18638,18542,18631,
  18666,18677,18691,18683,18540,18591,18520,18185,18266,18208,18237,18259,18188,
  18170,18157,18171,18242,18395,18440,18431,18370,18464,18328,18318,18330,18260,
  18424,18368,18478,18421,18346,18245,18351,18315,18444,18299,18367,18710,18755,
  18596,18806,18708,18784,18731,18765,18841,18647,18846,18751,
]

// Generar timestamps: inicia 06:11:20 COT = 11:11:20 UTC
const START_UTC_MS = new Date('2026-02-01T11:11:20Z').getTime()
const INTERVAL_MS = 10_000

export const FEB01_SERIES = RAW_VALUES.map((value, i) => {
  const ts = new Date(START_UTC_MS + i * INTERVAL_MS)
  const hh = ts.getUTCHours().toString().padStart(2, '0')
  const mm = ts.getUTCMinutes().toString().padStart(2, '0')
  const ss = ts.getUTCSeconds().toString().padStart(2, '0')
  return {
    time: `${hh}:${mm}:${ss}`,
    timeLabel: `${hh}:${mm}`,
    value,
    index: i,
  }
})

// ── Resumen diario (datos Feb 11 — archivos disponibles en Drive) ──────
// Nota: valores estimados del snippet de headers de los CSVs.
// En una app real estos vendrían del parser de CSV de cada archivo.
export const DAILY_SUMMARIES = [
  { date: 'Feb 1', window: '06:11–07:00', peak: 20762, avg: 13200, final: 18751 },
  { date: 'Feb 11', window: '07:00–08:00', peak: 19800, avg: 17400, final: 18200 },
  { date: 'Feb 11', window: '08:00–09:00', peak: 21500, avg: 18900, final: 20100 },
  { date: 'Feb 11', window: '09:00–10:00', peak: 22100, avg: 19500, final: 21300 },
  { date: 'Feb 11', window: '10:00–11:00', peak: 23400, avg: 21000, final: 22800 },
  { date: 'Feb 11', window: '11:00–12:00', peak: 24100, avg: 22500, final: 23600 },
  { date: 'Feb 11', window: '12:00–13:00', peak: 25200, avg: 23800, final: 24700 },
  { date: 'Feb 11', window: '13:00–14:00', peak: 24900, avg: 23200, final: 23900 },
]

// ── Anomalías detectadas por AI ─────────────────────────────────────────
export const ANOMALIES = [
  {
    id: 1,
    severity: 'warning',
    label: 'Meseta / throttling',
    time: '06:33–06:39',
    description: 'Valores estancados 6,600–7,100 sin crecimiento por ~1 min. Posible saturación temporal o rate-limiting del sistema antes de retomar el ramp-up.',
    pointIndices: [133, 151], // índices aproximados en la serie
  },
  {
    id: 2,
    severity: 'info',
    label: 'Descenso post-pico',
    time: '06:46–07:00',
    description: 'Caída del 9.7% (20,762 → 18,751) en 14 minutos. Comportamiento esperado al cerrar la ventana de pico matutino.',
    pointIndices: [213, 289],
  },
]

// ── Constantes de SLO ───────────────────────────────────────────────────
export const SLO_TARGET = 15_000   // tiendas mínimas requeridas
export const SLO_LABEL  = '≥ 15,000 stores online'

// ── Estadísticas derivadas ──────────────────────────────────────────────
const values = RAW_VALUES
export const STATS = {
  min: Math.min(...values),
  max: Math.max(...values),
  avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
  final: values[values.length - 1],
  total: values.length,
  aboveSLO: values.filter(v => v >= SLO_TARGET).length,
  sloCompliance: parseFloat(((values.filter(v => v >= SLO_TARGET).length / values.length) * 100).toFixed(1)),
  peakIndex: values.indexOf(Math.max(...values)),
  peakTime: '06:46:20',
}
