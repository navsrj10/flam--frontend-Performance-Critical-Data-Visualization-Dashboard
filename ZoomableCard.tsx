"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  title?: string;
  children: React.ReactNode;
  /** Open overlay on hover, not just click */
  autoOpenOnHover?: boolean;
  className?: string;
};

export default function ZoomableCard({
  title,
  children,
  autoOpenOnHover = false,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Create portal root
  useEffect(() => {
    setPortalEl(document.body);
  }, []);

  // Lock scroll when overlay is open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Card interaction handlers
  const smallCardProps = useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () => ({
      onClick: () => setOpen(true),
      onMouseEnter: autoOpenOnHover ? () => setOpen(true) : undefined,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") setOpen(true);
      },
      role: "button",
      tabIndex: 0,
    }),
    [autoOpenOnHover]
  );

  // Keep grid layout consistent when expanded
  const reserveHeightStyle: React.CSSProperties | undefined = open
    ? { visibility: "hidden" }
    : undefined;

  return (
    <>
      {/* Main chart card */}
      <div
        ref={cardRef}
        className={["zoom-card", className].filter(Boolean).join(" ")}
        {...smallCardProps}
        style={reserveHeightStyle}
        aria-label={title ? `Open ${title}` : "Open chart"}
      >
        {children}
      </div>

      {/* Overlay portal */}
      {open && portalEl
        ? createPortal(
            <div className="zoom-overlay" aria-modal="true" role="dialog">
              <div
                className="zoom-backdrop"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="zoom-modal">
                <div className="zoom-header">
                  <div className="zoom-title">{title ?? "Chart"}</div>
                  <button
                    className="zoom-close"
                    onClick={() => setOpen(false)}
                    aria-label="Close enlarged chart"
                  >
                    ×
                  </button>
                </div>

                <div className="zoom-content">{children}</div>
              </div>
            </div>,
            portalEl
          )
        : null}
    </>
  );
}
