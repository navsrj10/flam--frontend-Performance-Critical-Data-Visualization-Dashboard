"use client";
import {
  useContext,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { DataContext } from "../providers/DataProvider";

type Props = {
  range: "live" | "1m" | "5m" | "1h";
  // optional: override number of buckets if you like
  cols?: number | "auto";
  rows?: number | "auto";
};

// simple green→yellow→red ramp by 0..1
function rampColor01(t: number): string {
  t = Math.max(0, Math.min(1, t));
  let r = 0, g = 0, b = 0;
  if (t < 0.5) {
    const k = t / 0.5; // 0..1
    r = Math.round(60 + 195 * k);
    g = 200;
    b = 60;
  } else {
    const k = (t - 0.5) / 0.5; // 0..1
    r = 255;
    g = Math.round(200 - 180 * k);
    b = Math.round(60 - 60 * k);
  }
  return `rgb(${r},${g},${b})`;
}

export default function Heatmap({ range, cols = "auto", rows = "auto" }: Props) {
  const ctx = useContext(DataContext);
  const data = ctx?.data ?? [];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // track container size + DPR
  const [{ w, h, dpr }, setSize] = useState({ w: 0, h: 0, dpr: 1 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      const dprNow = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      setSize({
        w: Math.max(1, Math.floor(r.width)),
        h: Math.max(1, Math.floor(r.height)),
        dpr: dprNow,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 1) filter by time range (same as other charts)
  const filtered = useMemo(() => {
    const latestT = data[data.length - 1]?.t ?? 0;
    const windowMap: Record<string, number> = {
      live: 60_000,
      "1m": 60_000,
      "5m": 300_000,
      "1h": 3_600_000,
    };
    const windowMs = windowMap[range] || 60_000;
    return data.filter((d) => d.t >= latestT - windowMs);
  }, [data, range]);

  // 2) draw when size/data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w === 0 || h === 0) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    // set the drawing buffer to physical pixels
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // draw in CSS pixels
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);

    if (filtered.length === 0) return;

    // choose buckets based on current size if "auto"
    const colCount =
      cols === "auto" ? Math.max(60, Math.floor(w / 4)) : (cols as number);
    const rowCount =
      rows === "auto" ? Math.max(10, Math.floor(h / 20)) : (rows as number);

    // build count/total matrices
    const matCount = Array.from({ length: colCount }, () =>
      new Array<number>(rowCount).fill(0),
    );
    const matTotal = Array.from({ length: colCount }, () =>
      new Array<number>(rowCount).fill(0),
    );

    // time bucketing
    const n = filtered.length;
    const slice = Math.max(1, Math.floor(n / colCount));

    for (let i = 0; i < n; i++) {
      const col = Math.min(colCount - 1, Math.floor(i / slice));

      const v = filtered[i].value; // 0..100
      // top row = high value
      const row = Math.max(
        0,
        Math.min(rowCount - 1, rowCount - 1 - Math.floor((v / 100) * rowCount)),
      );

      matCount[col][row] += 1;
      matTotal[col][row] += v;
    }

    const maxCount = matCount.flat().reduce((m, x) => (x > m ? x : m), 0);

    // draw cells
    const cellW = w / colCount;
    const cellH = h / rowCount;

    for (let col = 0; col < colCount; col++) {
      for (let row = 0; row < rowCount; row++) {
        const count = matCount[col][row];
        if (count === 0) continue;

        // intensity from count (or switch to average value if you want)
        const intensity = maxCount > 0 ? count / maxCount : 0;
        c.fillStyle = rampColor01(intensity);

        const x = col * cellW;
        const y = row * cellH;
        c.fillRect(x, y, Math.ceil(cellW), Math.ceil(cellH));
      }
    }

    // subtle shading + grid to match your look
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(0,0,0,.05)");
    g.addColorStop(1, "rgba(0,0,0,.12)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);

    c.strokeStyle = "rgba(255,255,255,0.06)";
    c.lineWidth = 1;
    for (let col = 1; col < colCount; col++) {
      const x = Math.round(col * cellW) + 0.5;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, h);
      c.stroke();
    }
    for (let row = 1; row < rowCount; row++) {
      const y = Math.round(row * cellH) + 0.5;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y);
      c.stroke();
    }
  }, [filtered, w, h, dpr, cols, rows]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
