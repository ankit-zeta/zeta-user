"use client";

import React, { useLayoutEffect, useEffect, useRef, useState, ReactNode } from "react";
import { CERT_CANONICAL_WIDTH, CERT_CANONICAL_HEIGHT } from "./CertificateDesign";

// Universal landscape scaler:
// Dynamically scales the fixed 1000x700 master canvas to fit any container width
// or max-height while keeping the container dimensions exactly synchronized with the scale.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ScaledCertificate({
  children,
  className = "",
  certWidth = CERT_CANONICAL_WIDTH,
  certHeight = CERT_CANONICAL_HEIGHT,
  maxHeight,
}: {
  children: ReactNode;
  className?: string;
  certWidth?: number;
  certHeight?: number;
  maxHeight?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [mounted, setMounted] = useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const cw = container.clientWidth;
      if (cw === 0) return;

      let s = Math.min(1, cw / certWidth);
      if (maxHeight && maxHeight > 0) {
        const heightScale = maxHeight / certHeight;
        s = Math.min(s, heightScale);
      }
      setScale(Math.max(0.15, s));
    };

    measure();

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(container);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [certWidth, certHeight, maxHeight]);

  const scaledHeight = Math.round(certHeight * scale);

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center items-start overflow-hidden ${className}`}
      style={{
        height: mounted ? `${scaledHeight}px` : "auto",
        minHeight: mounted ? `${scaledHeight}px` : "200px",
        transition: "height 0.15s ease-out",
      }}
    >
      <div
        style={{
          width: `${certWidth}px`,
          height: `${certHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
