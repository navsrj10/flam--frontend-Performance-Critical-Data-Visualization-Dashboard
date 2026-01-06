#  FLAM Performance Dashboard

A **real-time performance visualization dashboard** built using **Next.js 14 (App Router)** and **TypeScript**, designed to render and update **10,000+ data points at 60 FPS** without freezing.

This project simulates live streaming telemetry data (like system metrics or network stats) and visualizes it with **Canvas-based custom charts** — all without using any external chart libraries.

---

##  Overview

This dashboard demonstrates:
- High-FPS, smooth data visualization
- Real-time simulation and aggregation
- Fully custom canvas rendering (no Chart.js, no D3)
- Clean React + Next.js structure with hooks and context
- Performance-focused UI with KPI tiles and zoomable charts

---

##  Getting Started

###  Clone and install

```bash
git clone https://github.com/your-username/flam-performance-dashboard.git
cd flam-performance-dashboard
npm install        # or: yarn install / pnpm install


2️ Run locally
npm run dev



3️ Build for production
npm run build
npm start

 Features
Feature	Description
Real-time Updates	Data points generated every 100ms
Canvas Rendering	Fast, memory-efficient custom drawing
Multiple Chart Types	Line, Bar, Scatter, and Heatmap
Data Aggregation	Filtered views for 1m, 5m, and 1h time windows
KPI Dashboard	Throughput, Latency (p95), Active Users, Error Rate
Zoomable Overlay	Expand any chart on click or hover
Performance Monitor	Live FPS counter & performance check
Responsive Layout	Works on desktop, tablet, and mobile
No External Chart Libraries	100% custom implementation
 Architecture
app/
  dashboard/page.tsx         # Main dashboard page
components/
  charts/
    LineChart.tsx            # Line chart (Canvas)
    BarChart.tsx             # Bar chart (Canvas)
    ScatterPlot.tsx          # Scatter plot (Canvas)
    Heatmap.tsx              # Heatmap (Canvas)
  controls/
    TimeRangeSelector.tsx    # Live / 1M / 5M / 1H filter buttons
  providers/
    DataProvider.tsx         # Synthetic data generator + context
  ui/
    ZoomableCard.tsx         # Expanding overlay wrapper for charts
    TopRightControls.tsx     # Theme, view, and clock controls
    PerformanceMonitor.tsx   # FPS and performance metrics
hooks/
  useKpis.ts                 # Calculates KPIs from data
lib/
  dataGenerator.ts           # Random synthetic data simulation
styles/
  globals.css                # Dashboard layout and theme

 Data Simulation

The DataProvider continuously emits synthetic data points like this:

{ t: number; value: number }


Each chart filters points based on the selected time window:

const latest = data[data.length - 1]?.t ?? 0;
const windowMs = { live: 60000, '1m': 60000, '5m': 300000, '1h': 3600000 }[range];
const filtered = data.filter(d => d.t >= latest - windowMs);

 KPI Metrics (useKpis.ts)
Metric	Formula / Meaning
Throughput	Data points per second
Latency (p95)	95th percentile of values
Active Users	Avg value × scaling factor
Error Rate	% of values below a threshold

Example predefined (static) values for demo:

const throughput = 120; // /s
const p95 = 42;         // ms
const active = 320;     // users
const errRate = 0.7;    // %

 Controls

Time range buttons: LIVE / 1M / 5M / 1H

Theme toggle & clock: Top-right corner

Chart overlay: Click a chart to zoom into full-screen view

FPS Monitor: Top-right corner (PerformanceMonitor)

 Zoom Overlay Behavior

Hover or click a chart to open it in a modal overlay (ZoomableCard.tsx).

Overlay does not affect the grid layout — it’s rendered using createPortal on top of the page.

Background blur + close button for an immersive experience.

 If charts vertically expand the page, ensure you’ve copied the CSS fix:

.zoom-card {
  height: 100%;
  overflow: hidden;
}

⚙️ Technical Stack
Area	Technology
Framework	Next.js 14 (App Router)
Language	TypeScript
Rendering	HTML Canvas + React hooks
State Mgmt	React Context + custom hooks
Data Source	Synthetic time-series generator
Styling	CSS Modules / Tailwind-like utility classes
Performance	Memoized draws, windowing, FPS monitor
 Performance Targets

- 60 FPS during real-time updates

- <100ms UI response latency

- 10,000+ points without UI freeze

- No memory leaks during continuous streaming

 Performance Hints

Use useMemo for filtered datasets.

Draw only visible points per frame.

Lock canvas sizes to prevent re-layout.

Disable expensive gradients or shadows if FPS drops.

 Theming

Supports dark mode by default.
You can easily change the palette in globals.css or your theme provider.

Example:

body {
  background-color: #0f1218;
  color: #eaeefb;
}

 Scripts
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
