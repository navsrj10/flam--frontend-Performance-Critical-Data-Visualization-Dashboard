"use client";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DataContext } from "../providers/DataProvider";

type RangeKey = "live" | "1m" | "5m" | "1h";

const RANGE_MS: Record<RangeKey, number> = {
  live: 60_000,
  "1m": 60_000,
  "5m": 300_000,
  "1h": 3_600_000,
};

type Bucket = { min: number; max: number; has: boolean };

/** Build min/max buckets in *time* space (1 bucket = 1px). */
function buildTimeBuckets(
  data: { t: number; value: number }[],
  startT: number,
  windowMs: number,
  widthPx: number
): Bucket[] {
  const w = Math.max(1, Math.floor(widthPx));
  const buckets: Bucket[] = new Array(w).fill(0).map(() => ({
    min: Infinity,
    max: -Infinity,
    has: false,
  }));

  const endT = startT + windowMs;
  const span = endT - startT;

  // put each point into its time bucket
  for (let i = 0; i < data.length; i++) {
    const { t, value } = data[i];
    if (t < startT || t > endT) continue;
    const nx = (t - startT) / span; // 0..1
    const px = Math.min(w - 1, Math.max(0, Math.floor(nx * w)));
    const b = buckets[px];
    b.has = true;
    if (value < b.min) b.min = value;
    if (value > b.max) b.max = value;
  }

  // ---- Backfill empty buckets with nearest seen value (not 0!) ----
  // 1) Forward pass: carry last seen value to the right
  let last = NaN;
  for (let x = 0; x < w; x++) {
    const b = buckets[x];
    if (b.has) {
      last = (b.min + b.max) * 0.5;
    } else if (!Number.isNaN(last)) {
      b.min = b.max = last;
      b.has = true;
    }
  }

  // 2) Backward pass: carry last seen value to the left (covers leading empties)
  let next = NaN;
  for (let x = w - 1; x >= 0; x--) {
    const b = buckets[x];
    if (b.has) {
      next = (b.min + b.max) * 0.5;
    } else if (!Number.isNaN(next)) {
      b.min = b.max = next;
      b.has = true;
    }
  }

  // If stream is completely empty, default to a midline
  if (!buckets.some((b) => b.has)) {
    for (let x = 0; x < w; x++) {
      buckets[x] = { min: 50, max: 50, has: true };
    }
  }

  return buckets;
}

export default function LineChart({ range }: { range: RangeKey }) {
  const ctx = useContext(DataContext);
  const stream = ctx?.data ?? [];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [{ w, h, dpr }, setSize] = useState({ w: 0, h: 0, dpr: 1 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({
        w: Math.max(1, Math.floor(r.width)),
        h: Math.max(1, Math.floor(r.height)),
        dpr: Math.max(1, Math.round(window.devicePixelRatio || 1)),
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // clip to selected time range
  const filtered = useMemo(() => {
    if (!stream.length) return [];
    const latestT = stream[stream.length - 1].t;
    const windowMs = RANGE_MS[range] ?? 60_000;
    const startT = latestT - windowMs;
    return stream.filter((d) => d.t >= startT);
  }, [stream, range]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || w === 0 || h === 0) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    // HiDPI
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Transparent canvas so it inherits the card background
    c.clearRect(0, 0, w, h);
    c.imageSmoothingEnabled = false;
    c.globalCompositeOperation = "source-over";

    if (!stream.length) return;

    const latestT = (filtered.at(-1)?.t ?? stream.at(-1)!.t);
    const windowMs = RANGE_MS[range] ?? 60_000;
    const startT = latestT - windowMs;

    const buckets = buildTimeBuckets(filtered, startT, windowMs, w);

    // draw line using bucket max (you can switch to avg)
    c.beginPath();
    c.strokeStyle = "#ffb800";
    c.lineWidth = 2;
    c.lineJoin = "round";
    c.lineCap = "round";

    for (let x = 0; x < buckets.length; x++) {
      const v = buckets[x].max;
      const y = h - (v / 100) * h;
      if (x === 0) c.moveTo(x + 0.5, y);
      else c.lineTo(x + 0.5, y);
    }
    c.stroke();
  }, [filtered, stream, w, h, dpr, range]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
