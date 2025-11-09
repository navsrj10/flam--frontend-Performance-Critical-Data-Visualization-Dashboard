"use client";
import { useContext, useMemo, useRef, useEffect } from "react";
import { DataContext } from "../providers/DataProvider";

type Props = {
  range: "live" | "1m" | "5m" | "1h";
  width?: number;
  height?: number;
};

export default function BarChart({ range, width = 800, height = 400 }: Props) {
  const ctx = useContext(DataContext);
  const data = ctx?.data ?? [];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter by range (same window map as LineChart)
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    c.clearRect(0, 0, width, height);
    if (filtered.length === 0) return;

    const n = filtered.length;
    const barW = Math.max(2, width / n);

    for (let i = 0; i < n; i++) {
      const v = filtered[i].value;
      const barH = (v / 100) * height;
      const x = i * barW;
      const y = height - barH;

      // orange gradient fill
      const grad = c.createLinearGradient(0, y, 0, height);
      grad.addColorStop(0, "#ffb800");
      grad.addColorStop(1, "rgba(255,184,0,0.12)");
      c.fillStyle = grad;

      c.fillRect(x + 1, y, barW - 2, barH);
      c.strokeStyle = "rgba(255,184,0,0.35)";
      c.strokeRect(x + 1, y, barW - 2, barH);
    }
  }, [filtered, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
