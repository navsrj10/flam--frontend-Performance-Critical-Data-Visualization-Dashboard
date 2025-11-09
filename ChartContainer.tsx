"use client";
import React, { useLayoutEffect, useRef, useState } from "react";

type Props = {
  children?: (els: { canvas: HTMLCanvasElement; overlay: SVGSVGElement }) => React.ReactNode;
};

export default function ChartContainer({ children }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    if (canvasRef.current && svgRef.current) setReady(true);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      <svg ref={svgRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
      {ready && children ? children({ canvas: canvasRef.current!, overlay: svgRef.current! }) : null}
    </div>
  );
}
