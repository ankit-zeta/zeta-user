"use client";

import React, { useLayoutEffect, useRef, useState, ReactNode } from "react";

/**
 * Renders children at full width, centered. On narrow screens, scales a
 * fixed-width version to fit. No aspect-ratio clipping.
 */
export function ScaledCertificate({
  children,
  className = "",
  certWidth = 896,
}: {
  children: ReactNode;
  className?: string;
  certWidth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const cw = container.clientWidth;
      if (cw === 0) return;
      // Scale down only when container is narrower than cert
      setScale(Math.min(1, cw / certWidth));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [certWidth]);

  return (
    <div ref={containerRef} className={className}>
      <div
        style={{
          width: certWidth,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top center",
          margin: scale < 1 ? "0 auto" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
