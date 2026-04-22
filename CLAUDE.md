# CLAUDE.md — Briefing para Claude Code
> Este archivo es leído automáticamente por Claude Code al iniciar en esta carpeta.
> Contiene TODO el contexto del proyecto para que puedas trabajar autónomamente.

---

## 🎯 Contexto del proyecto

Estás construyendo la prueba técnica **"AI-Powered Dashboard"** para **Rappi Engineering 2026**.

### La prueba pide:
1. **Dashboard de visualización** — mostrar datos históricos de disponibilidad de tiendas de forma clara y visual
2. **Chatbot semántico** — asistente conversacional que responda preguntas sobre los datos del dashboard
3. Debe funcionar **localmente** (no necesita deploy)
4. Usar **AI de forma estratégica** (no solo copiar/pegar)

### Criterios de evaluación:
| Criterio | Peso |
|---|---|
| Uso efectivo de AI | 30% |
| Funcionalidad | 25% |
| Creatividad y UX | 20% |
| Presentación | 15% |
| Calidad del código | 10% |

---

## 📊 Los datos

**Archivo CSV:** `synthetic_monitoring_visible_stores`
**Fuente:** Google Drive del candidato (archivos ya procesados en `src/data/availabilityData.js`)

### Estructura del CSV original:
- Formato wide: cada columna es un timestamp, cada fila es una métrica
- Timestamps en formato: `Sun Feb 01 2026 06:11:20 GMT-0500 (hora estándar de Colombia)`
- Intervalo: **10 segundos** entre cada punto
- Métrica principal: `synthetic_monitoring_visible_stores` — número de tiendas Rappi visibles/online en ese instante

### Archivos disponibles en Google Drive:
| Archivo | Fecha | Ventana horaria |
|---|---|---|
| AVAILABILITY-data.csv | Feb 1, 2026 | 06:11–07:00 (datos reales cargados) |
| AVAILABILITY-data - 2026-02-11T163356.970.csv | Feb 11 | 06:59–07:59 |
| AVAILABILITY-data - 2026-02-11T163407.924.csv | Feb 11 | 07:59–08:59 |
| AVAILABILITY-data - 2026-02-11T163412.206.csv | Feb 11 | 08:59–09:59 |
| AVAILABILITY-data - 2026-02-11T163416.336.csv | Feb 11 | 09:59–10:59 |
| AVAILABILITY-data - 2026-02-11T163420.714.csv | Feb 11 | 10:59–11:59 |
| AVAILABILITY-data - 2026-02-11T163424.575.csv | Feb 11 | 11:59–12:59 |
| AVAILABILITY-data - 2026-02-11T163429.048.csv | Feb 11 | 12:59–13:59 |
| AVAILABILITY-data - 2026-02-11T163433.165.csv | Feb 11 | 13:59–14:59 |

### Estadísticas de los datos de Feb 1 (06:11–07:00):
- **Mínimo:** 37 tiendas (inicio, 06:11:20)
- **Máximo:** 20,762 tiendas (pico, 06:46:20)
- **Promedio:** ~13,200 tiendas
- **Final (07:00):** 18,751 tiendas
- **Total puntos:** 290 (cada 10 segundos)

### Patrón identificado:
1. **Ramp-up agresivo** (06:11–06:30): 37 → 6,034 — tiendas abriendo al inicio del día
2. **Aceleración / pico** (06:30–06:46): 6,034 → 20,762 — momento de máxima actividad
3. **Estabilización** (06:46–07:00): 20,762 → 18,751 — leve descenso post-pico

### Anomalías detectadas por AI:
- **Meseta 06:33–06:39**: valores estancados 6,600–7,100 sin crecimiento (~1 min). Posible throttling o saturación temporal
- **Descenso post-pico**: -9.7% en 14 minutos. Comportamiento esperado

---

## 🏗 Arquitectura actual del proyecto

```
rappi-dashboard/
├── index.html
├── package.json              ← React 19 + Vite 6 + Recharts + Papaparse + Lucide
├── vite.config.js
├── .env.example              ← Copiar como .env con VITE_ANTHROPIC_API_KEY
├── README.md
└── src/
    ├── main.jsx              ← Entry point
    ├── App.jsx               ← Layout principal (5 KPIs + chart + chatbot + bottom row)
    ├── index.css             ← Design system con CSS variables (light/dark mode)
    ├── data/
    │   └── availabilityData.js  ← 290 valores reales + estadísticas + anomalías
    └── components/
        ├── Header.jsx           ← Sticky header + dark mode toggle
        ├── KpiCard.jsx          ← Tarjeta métrica con sparkline SVG
        ├── AvailabilityChart.jsx ← Recharts: serie temporal / distribución / delta
        ├── GoldenSignals.jsx    ← Panel Google SRE Golden Signals
        ├── AnomalyPanel.jsx     ← Anomalías detectadas con severidad
        ├── SloSummary.jsx       ← SLO/SLI/Error Budget table
        └── ChatBot.jsx          ← Claude API chatbot con quick questions
```

---

## ⚙️ Cómo correr el proyecto

```bash
npm install
cp .env.example .env
# Editar .env: VITE_ANTHROPIC_API_KEY=sk-ant-...
npm run dev
# → http://localhost:5173
```

---

## ✅ Qué está implementado

- [x] 5 KPI cards con sparklines y barra de progreso
- [x] Gráfico Recharts con 3 vistas: serie temporal / distribución / tasa de cambio
- [x] Línea de SLO (≥15,000 stores) en el gráfico
- [x] Zona de anomalía marcada (06:33–06:39)
- [x] Dark mode / Light mode toggle
- [x] Panel Golden Signals (Google SRE Book)
- [x] Panel de anomalías con severidad
- [x] Tabla SLO/SLI/Error Budget con compliance %
- [x] ChatBot Claude con contexto del dataset embebido
- [x] Quick questions en el chatbot

---

## 🚀 Mejoras pendientes (orden de prioridad)

### Alta prioridad (impacto directo en evaluación):
1. **CSV uploader** — botón para cargar cualquiera de los archivos de Feb 11 y que el gráfico se actualice
2. **Selector de archivo / periodo** — dropdown para cambiar entre Feb 1 y los 8 archivos de Feb 11
3. **Anotaciones en el gráfico** — marcadores clickeables sobre los puntos de anomalía
4. **Narrativa AI auto-generada** — al cargar datos, Claude genera automáticamente un párrafo de resumen
5. **Tabla de datos raw** — tabla paginada con los 290 valores, búsqueda y export CSV

### Media prioridad (mejoran el puntaje):
6. **Comparación multi-periodo** — gráfico overlay de Feb 1 vs Feb 11 (mismo eje X, horas)
7. **Responsive layout** — que funcione bien en pantalla pequeña/laptop
8. **Export a PNG/PDF** — botón para exportar el gráfico como imagen
9. **Loading skeleton** — mientras carga el CSV mostrar skeletons animados

### Baja prioridad (toques finales):
10. **Tooltips mejorados** — mostrar más contexto al hacer hover en puntos específicos
11. **Micro-animaciones** — entrada de los KPI cards con stagger
12. **Favicon** — ícono de Rappi en la pestaña del navegador

---

## 🤖 Cómo usar AI de forma estratégica (para la presentación)

La arquitectura de uso de AI en este proyecto es:

```
Claude chat (claude.ai)
  → Analizó los CSVs de Google Drive
  → Diseñó la arquitectura del componentes
  → Generó todo el código base
  → Investigó best practices (SRE, observabilidad, dashboards)

Claude Code (terminal)
  → Itera sobre el código existente
  → Implementa nuevas features por orden
  → Corre tests, instala dependencias, refactoriza

Claude API (en la app)
  → ChatBot semántico en tiempo real
  → Responde preguntas sobre los datos con contexto embebido
  → Narrativa auto-generada al cargar nuevos datasets
```

---

## 📋 Conceptos técnicos para explicar en la presentación

| Concepto | Definición simple | Aplicación en el proyecto |
|---|---|---|
| **SLO** (Service Level Objective) | Meta de disponibilidad que el equipo se compromete a cumplir | ≥15,000 tiendas online |
| **SLI** (Service Level Indicator) | La métrica que mides para saber si cumples el SLO | `synthetic_monitoring_visible_stores` |
| **Error Budget** | % de tiempo que puedes "fallar" sin romper el SLO | 100% - SLO compliance % |
| **Golden Signals** | Las 4 métricas esenciales de Google SRE | Traffic, Saturation, Errors, Latency |
| **Anomaly Detection** | Identificar comportamientos inusuales automáticamente | Meseta 06:33–06:39 |
| **Ramp-up** | Periodo de crecimiento rápido al inicio de operaciones | 06:11–06:30: 37→6,034 tiendas |
| **RAG simplificado** | Dar contexto de datos al modelo AI en el system prompt | ChatBot con dataset embebido |

---

## 🎨 Design system

- **Fuente:** IBM Plex Sans (texto) + IBM Plex Mono (números)
- **Color primario:** `#E84510` (Rappi orange)
- **Tema:** Light por defecto, Dark mode disponible
- **Tokens:** CSS variables en `:root` y `[data-theme="dark"]`
- **Componentes:** Todos con `border-radius: var(--radius-lg)` y `border: 1px solid var(--border)`

---

## 💬 Instrucciones para Claude Code

Cuando el usuario te dé una orden, sigue este flujo:
1. Lee los archivos relevantes antes de modificar
2. Implementa el cambio de forma limpia y coherente con el design system existente
3. No rompas funcionalidades existentes
4. Si agregas una dependencia nueva, ejecuta `npm install <pkg>` automáticamente
5. Confirma que la app sigue corriendo con `npm run dev` si haces cambios estructurales
6. Usa siempre español en comentarios y strings de UI

**Ordenes de ejemplo que el usuario puede darte:**
- "Agrega el CSV uploader para cargar los archivos de Feb 11"
- "Haz el layout responsive para laptop pequeña"
- "Agrega animaciones de entrada a las KPI cards"
- "Implementa la comparación multi-periodo entre Feb 1 y Feb 11"
- "Genera la narrativa AI automática cuando se carga un nuevo CSV"
- "Agrega un botón de exportar el gráfico como PNG"
