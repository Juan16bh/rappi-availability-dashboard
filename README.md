# Rappi Store Availability Dashboard
**Prueba Técnica AI-Powered Dashboard — Rappi Engineering 2026**

Dashboard de disponibilidad de tiendas con chatbot semántico integrado usando Claude AI.

---

## Stack
- **React 19** + **Vite 6** — framework y build tool
- **Recharts** — gráficos interactivos (serie temporal, distribución, tasa de cambio)
- **Anthropic Claude API** — chatbot semántico sobre los datos
- **IBM Plex Sans/Mono** — tipografía
- CSS variables puras — sin frameworks CSS externos

---

## Instalación rápida (5 pasos)

```bash
# 1. Entra a la carpeta
cd rappi-dashboard

# 2. Instala dependencias
npm install

# 3. Crea el archivo de variables de entorno
cp .env.example .env

# 4. Edita .env y pon tu API key de Anthropic
#    Obtenerla en: https://console.anthropic.com/
#    VITE_ANTHROPIC_API_KEY=sk-ant-...

# 5. Corre el servidor de desarrollo
npm run dev
# → Abre http://localhost:5173
```

---

## Funcionalidades

| Feature                        | Descripción                                                  |
|-------------------------------|--------------------------------------------------------------|
| KPI Cards con sparklines       | 5 métricas clave con mini-gráfico de tendencia               |
| Gráfico multi-vista            | Serie temporal / Distribución / Tasa de cambio (delta)       |
| Línea de SLO                  | Referencia visual del target ≥ 15,000 stores                  |
| Zonas de anomalía             | Marcadas en el gráfico (06:33–06:39)                         |
| Dark / Light mode             | Toggle en el header                                          |
| Golden Signals (Google SRE)   | Traffic, Saturation, Errors, Latency                         |
| Anomaly Detection             | 2 anomalías detectadas con severidad y descripción           |
| SLO / SLI / Error Budget      | Compliance %, puntos sobre el objetivo, estado del budget    |
| Chatbot AI (Claude)           | Preguntas libres + quick questions sobre los datos           |

---

## Estructura del proyecto

```
rappi-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── .env.example          ← Copia como .env y pon tu API key
└── src/
    ├── main.jsx           ← Entry point
    ├── App.jsx            ← Layout principal
    ├── index.css          ← Estilos globales + tokens de diseño
    ├── data/
    │   └── availabilityData.js  ← Datos reales del CSV + constantes
    └── components/
        ├── Header.jsx           ← Barra superior + dark mode
        ├── KpiCard.jsx          ← Tarjeta de métrica con sparkline
        ├── AvailabilityChart.jsx ← Gráfico Recharts multi-vista
        ├── GoldenSignals.jsx    ← Panel Golden Signals SRE
        ├── AnomalyPanel.jsx     ← Anomalías detectadas
        ├── SloSummary.jsx       ← SLO/SLI/Error Budget table
        └── ChatBot.jsx          ← Asistente Claude AI
```

---

## Conceptos técnicos utilizados (para la presentación)

- **SLO (Service Level Objective):** ≥15,000 tiendas online como mínimo operacional
- **SLI (Service Level Indicator):** `synthetic_monitoring_visible_stores` — la métrica medida
- **Error Budget:** % del tiempo que el sistema estuvo por debajo del SLO
- **Golden Signals (Google SRE Book):** Traffic, Saturation, Errors, Latency
- **Anomaly Detection:** Identificación de la meseta 06:33–06:39 como evento inusual
- **RAG simplificado:** El contexto del dataset va en el system prompt de Claude

---

## Uso de AI en la construcción

1. **Claude (claude.ai)** — Analizó los CSVs, diseñó la arquitectura, generó todo el código
2. **Claude API (chatbot)** — Responde preguntas en tiempo real sobre los datos
3. **Patrón:** Humano define los objetivos → Claude los ejecuta iterativamente

---

*Rappi Engineering · 2026*
