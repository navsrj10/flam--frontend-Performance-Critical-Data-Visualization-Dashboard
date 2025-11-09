"use client";
import { useContext, useMemo, useRef, useEffect } from "react";
import { DataContext } from "../providers/DataProvider";

type Props = {
  range: "live" | "1m" | "5m" | "1h";
  width?: number;
  height?: number;
};

export default function ScatterPlot({
  range,
  width = 800,
  height = 400,
}: Props) {
  const ctx = useContext(DataContext);
  const data = ctx?.data ?? [];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    for (let i = 0; i < n; i++) {
      const p = filtered[i];
      const x = (i / (n - 1)) * width;
      const y = height - (p.value / 100) * height;

      c.beginPath();
      c.fillStyle = "#ffb800"; // warm orange points
      c.arc(x, y, 3.2, 0, Math.PI * 2);
      c.fill();
    }
  }, [filtered, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
