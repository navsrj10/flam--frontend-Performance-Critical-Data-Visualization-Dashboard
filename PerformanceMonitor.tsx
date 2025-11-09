'use client';

import { useEffect, useRef, useState } from 'react';

export default function PerformanceMonitor() {
  const [fps, setFps] = useState<number>(60);

  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number>(performance.now());
  const samples = useRef<number[]>([]);

  // Target 60 FPS
  const TARGET_FPS = 60;
  const TARGET_DT = 1000 / TARGET_FPS;

  // Only update the displayed FPS ~4x per second (nice + stable)
  const lastUiUpdate = useRef<number>(performance.now());
  const UI_UPDATE_MS = 250;

  useEffect(() => {
    function tick(now: number) {
      const dt = now - lastTime.current;
      lastTime.current = now;

      // record dt sample (cap buffer to 60)
      samples.current.push(dt);
      if (samples.current.length > 60) samples.current.shift();

      // compute average FPS
      const avgDt =
        samples.current.reduce((s, v) => s + v, 0) / samples.current.length;
      const currentFps = 1000 / avgDt;

      // clamp the *displayed* FPS to 60 so it never shows 120/144 etc
      const clamped = Math.min(currentFps, TARGET_FPS);

      // Update UI at a modest rate
      if (now - lastUiUpdate.current >= UI_UPDATE_MS) {
        setFps(Math.round(clamped));
        lastUiUpdate.current = now;
      }

      // Always request next frame (RAF frequency may be >60 on some monitors)
      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 14,
        right: 14,
        zIndex: 9999,
        padding: '6px 10px',
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        color: '#b4ffb4',
        background:
          'linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.35))',
        border: '1px solid rgba(80,120,80,.45)',
        boxShadow: '0 10px 24px rgba(0,0,0,.35)',
        userSelect: 'none',
      }}
      aria-label="Frame rate monitor"
    >
      FPS: {fps}
    </div>
  );
}
