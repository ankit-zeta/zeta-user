"use client";

import React, { useRef, useEffect, useCallback, useState, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const AUDIENCES = [
  {
    eyebrow: "STUDENTS & FRESHERS",
    heading: "Build Skills That Help You Stand Out.",
    description:
      "Go beyond theory with practical digital skills and structured learning designed to help you build confidence for your first professional opportunities.",
    cta: "Start Learning",
    imageSrc: "/Who Is ZetaGrow For/Students & Freshers.png",
    imageAlt: "Student learning practical digital skills on a laptop",
  },
  {
    eyebrow: "WORKING PROFESSIONALS",
    heading: "Upskill Without Putting Life on Hold.",
    description:
      "Learn practical skills around your schedule and continue growing without stepping away from your current professional journey.",
    cta: "Explore Programs",
    imageSrc: "/Who Is ZetaGrow For/Working Professionals.png",
    imageAlt: "Working professional upskilling with self-paced digital courses",
  },
  {
    eyebrow: "FREELANCERS",
    heading: "Strengthen Your Skills. Grow Your Opportunities.",
    description:
      "Build a stronger service stack, improve your professional confidence and develop practical skills that can help you take on better work.",
    cta: "Build Your Edge",
    imageSrc: "/Who Is ZetaGrow For/Freelancers.png",
    imageAlt: "Freelancer building professional skills and client trust",
  },
  {
    eyebrow: "SMALL BUSINESS OWNERS",
    heading: "Learn More. Do More for Your Business.",
    description:
      "Understand practical digital skills like online business, marketing, advertising and analytics so you can make smarter decisions with confidence.",
    cta: "Explore Skills",
    imageSrc: "/Who Is ZetaGrow For/Small Business Owners.png",
    imageAlt: "Small business owner learning digital marketing and analytics",
  },
  {
    eyebrow: "CAREER RESTARTERS",
    heading: "Restart With Skills and Confidence.",
    description:
      "Return to your professional journey with structured, beginner-friendly learning and practical skills that help you move forward step by step.",
    cta: "Begin Again",
    imageSrc: "/Who Is ZetaGrow For/Career Restarters.png",
    imageAlt: "Career restarter gaining new professional skills with confidence",
  },
  {
    eyebrow: "CONTENT CREATORS",
    heading: "Turn Creative Skills Into Professional Growth.",
    description:
      "Build the strategy, marketing and digital skills behind stronger content and turn your creative potential into meaningful professional growth.",
    cta: "Grow Your Skills",
    imageSrc: "/Who Is ZetaGrow For/Content Creators.png",
    imageAlt: "Content creator developing strategy and marketing skills",
  },
];

const N = AUDIENCES.length;
const CLONES = 2;
const TOTAL = N + CLONES * 2;
const SPEED = 520;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const AUTO_MS = 2500;

// Slides array with 2 clones before and 2 clones after
const SLIDES = [
  AUDIENCES[N - 2],
  AUDIENCES[N - 1],
  ...AUDIENCES,
  AUDIENCES[0],
  AUDIENCES[1],
];

export default function AudienceCarousel() {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLElement | null)[]>([]);

  // Carousel engine state
  const state = useRef({
    active: CLONES, // Starts on real Category 0 (Students & Freshers)
    isAnimating: false,
    paused: false,
    dragPause: false,
    dragging: false,
    dragStartX: 0,
    dragDeltaX: 0,
    hasMoved: false,
    timer: null as ReturnType<typeof setInterval> | null,
    teleportTimeout: null as ReturnType<typeof setTimeout> | null,
    resumeTimerTimeout: null as ReturnType<typeof setTimeout> | null,
    reducedMotion: false,
  });

  // Single state for React pagination dots
  const [activeRealDot, setActiveRealDot] = useState(0);

  /* ── Geometry measurement ── */
  const getCardWidth = useCallback(() => {
    const el = cardEls.current[CLONES] || cardEls.current[0];
    return el ? el.offsetWidth : 720;
  }, []);

  const getGap = useCallback(() => {
    const t = trackRef.current;
    if (!t) return 24;
    const computed = window.getComputedStyle(t).gap;
    return computed ? parseFloat(computed) || 24 : 24;
  }, []);

  const getViewportWidth = useCallback(() => {
    return outerRef.current ? outerRef.current.clientWidth : (typeof window !== "undefined" ? window.innerWidth : 1200);
  }, []);

  const calcTranslateX = useCallback((index: number) => {
    const vw = getViewportWidth();
    const cw = getCardWidth();
    const gap = getGap();
    const step = cw + gap;
    // Exactly center the card at index in the viewport:
    // (viewportWidth - cardWidth) / 2 is the offset so index 0 is centered.
    // Each step moves by step px.
    return (vw - cw) / 2 - index * step;
  }, [getViewportWidth, getCardWidth, getGap]);

  const realIndexOf = useCallback((idx: number) => {
    return ((idx - CLONES) % N + N) % N;
  }, []);

  /* ── Visual card styling update ── */
  const updateCardFocus = useCallback((targetIndex: number, instant: boolean) => {
    const dur = instant ? "0ms" : `${SPEED}ms`;

    for (let i = 0; i < TOTAL; i++) {
      const el = cardEls.current[i];
      if (!el) continue;

      const dist = Math.abs(i - targetIndex);

      let scale = 0.92;
      let opacity = 0.22;
      let zIndex = 1;
      let isCenter = false;
      let isNeighbor = false;

      if (dist === 0) {
        scale = 1.06;
        opacity = 1;
        zIndex = 10;
        isCenter = true;
      } else if (dist === 1) {
        scale = 0.94;
        opacity = 0.58;
        zIndex = 3;
        isNeighbor = true;
      }

      el.style.transition = `transform ${dur} ${EASE}, opacity ${dur} ${EASE}`;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = `${opacity}`;
      el.style.zIndex = `${zIndex}`;

      const inner = el.querySelector(".audience-card-inner") as HTMLElement | null;
      if (inner) {
        inner.style.transition = `box-shadow ${dur} ease, border-color ${dur} ease`;
        if (isCenter) {
          inner.style.borderColor = "rgba(23, 107, 77, 0.35)";
          inner.style.boxShadow = "0 18px 40px -8px rgba(23, 107, 77, 0.14), 0 4px 16px -2px rgba(0, 0, 0, 0.04)";
        } else if (isNeighbor) {
          inner.style.borderColor = "var(--brand-border)";
          inner.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.02)";
        } else {
          inner.style.borderColor = "var(--brand-border)";
          inner.style.boxShadow = "none";
        }
      }
    }
  }, []);

  /* ── Move track ── */
  const applyTrackPosition = useCallback((tx: number, instant: boolean) => {
    const t = trackRef.current;
    if (!t) return;
    if (instant) {
      t.style.transition = "none";
      t.style.transform = `translate3d(${tx}px, 0, 0)`;
      // Force synchronous reflow
      void t.offsetHeight;
    } else {
      t.style.transition = `transform ${SPEED}ms ${EASE}`;
      t.style.transform = `translate3d(${tx}px, 0, 0)`;
    }
  }, []);

  /* ── Core Navigation ── */
  const goTo = useCallback((idx: number, instant = false) => {
    const st = state.current;
    if (st.teleportTimeout) {
      clearTimeout(st.teleportTimeout);
      st.teleportTimeout = null;
    }

    st.active = idx;
    const realIdx = realIndexOf(idx);
    setActiveRealDot(realIdx);

    const tx = calcTranslateX(idx);
    applyTrackPosition(tx, instant);
    updateCardFocus(idx, instant);

    if (!instant) {
      st.isAnimating = true;

      // Teleport seamlessly if we landed on a clone slide
      st.teleportTimeout = setTimeout(() => {
        st.isAnimating = false;
        if (st.active < CLONES) {
          const resetIdx = st.active + N;
          st.active = resetIdx;
          const resetTx = calcTranslateX(resetIdx);
          applyTrackPosition(resetTx, true);
          updateCardFocus(resetIdx, true);
        } else if (st.active >= CLONES + N) {
          const resetIdx = st.active - N;
          st.active = resetIdx;
          const resetTx = calcTranslateX(resetIdx);
          applyTrackPosition(resetTx, true);
          updateCardFocus(resetIdx, true);
        }
      }, SPEED + 20);
    } else {
      st.isAnimating = false;
    }
  }, [calcTranslateX, applyTrackPosition, updateCardFocus, realIndexOf]);

  /* ── Autoplay timer ── */
  const stopAutoplay = useCallback(() => {
    if (state.current.timer) {
      clearInterval(state.current.timer);
      state.current.timer = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (state.current.reducedMotion) return;
    state.current.timer = setInterval(() => {
      const st = state.current;
      if (st.paused || st.dragging || st.dragPause || st.isAnimating) return;
      goTo(st.active + 1);
    }, AUTO_MS);
  }, [goTo, stopAutoplay]);

  const scheduleAutoplayResume = useCallback((delay = 3500) => {
    const st = state.current;
    if (st.resumeTimerTimeout) {
      clearTimeout(st.resumeTimerTimeout);
    }
    st.resumeTimerTimeout = setTimeout(() => {
      st.dragPause = false;
      startAutoplay();
    }, delay);
  }, [startAutoplay]);

  /* ── Click on pagination dots ── */
  const onDotClick = useCallback((targetCategoryIdx: number) => {
    const st = state.current;
    st.dragPause = true;
    stopAutoplay();

    // Find the closest slide index in SLIDES corresponding to targetCategoryIdx
    const currentActive = st.active;
    const candidates = [
      targetCategoryIdx + CLONES,
      targetCategoryIdx + CLONES - N,
      targetCategoryIdx + CLONES + N,
    ].filter((cand) => cand >= 0 && cand < TOTAL);

    let bestIndex = targetCategoryIdx + CLONES;
    let minDiff = Infinity;
    for (const cand of candidates) {
      const diff = Math.abs(cand - currentActive);
      if (diff < minDiff) {
        minDiff = diff;
        bestIndex = cand;
      }
    }

    goTo(bestIndex);
    scheduleAutoplayResume(4000);
  }, [goTo, stopAutoplay, scheduleAutoplayResume]);

  /* ── Pointer / Drag Interaction ── */
  const handleDragStart = useCallback((clientX: number) => {
    const st = state.current;
    if (st.isAnimating) return;
    st.dragging = true;
    st.hasMoved = false;
    st.dragStartX = clientX;
    st.dragDeltaX = 0;
    st.dragPause = true;
    stopAutoplay();

    if (trackRef.current) {
      trackRef.current.style.transition = "none";
    }
  }, [stopAutoplay]);

  const handleDragMove = useCallback((clientX: number) => {
    const st = state.current;
    if (!st.dragging || !trackRef.current) return;
    const delta = clientX - st.dragStartX;
    st.dragDeltaX = delta;
    if (Math.abs(delta) > 5) {
      st.hasMoved = true;
    }
    const baseTx = calcTranslateX(st.active);
    trackRef.current.style.transform = `translate3d(${baseTx + delta}px, 0, 0)`;
  }, [calcTranslateX]);

  const handleDragEnd = useCallback(() => {
    const st = state.current;
    if (!st.dragging) return;
    st.dragging = false;

    const delta = st.dragDeltaX;
    const cw = getCardWidth();
    const threshold = Math.min(cw * 0.15, 60);

    if (delta < -threshold) {
      goTo(st.active + 1);
    } else if (delta > threshold) {
      goTo(st.active - 1);
    } else {
      goTo(st.active);
    }

    scheduleAutoplayResume(3500);
  }, [getCardWidth, goTo, scheduleAutoplayResume]);

  /* ── Event handlers ── */
  const onMouseDown = (e: React.MouseEvent) => {
    // Only drag with main left click
    if (e.button !== 0) return;
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    const st = state.current;
    if (st.dragging) {
      handleDragEnd();
    }
    st.paused = false;
    if (!st.dragPause) {
      startAutoplay();
    }
  };

  const onMouseEnter = () => {
    state.current.paused = true;
    stopAutoplay();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      state.current.dragPause = true;
      stopAutoplay();
      goTo(state.current.active - 1);
      scheduleAutoplayResume(4000);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      state.current.dragPause = true;
      stopAutoplay();
      goTo(state.current.active + 1);
      scheduleAutoplayResume(4000);
    }
  };

  /* ── Initial mount & layout ── */
  useLayoutEffect(() => {
    // Check reduced motion
    if (typeof window !== "undefined") {
      state.current.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    // Set initial position instantly to category 0 (CLONES)
    goTo(CLONES, true);
  }, [goTo]);

  useEffect(() => {
    startAutoplay();

    const handleResize = () => {
      goTo(state.current.active, true);
    };

    window.addEventListener("resize", handleResize);

    // Also observe container size changes via ResizeObserver
    let ro: ResizeObserver | null = null;
    if (outerRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        goTo(state.current.active, true);
      });
      ro.observe(outerRef.current);
    }

    return () => {
      stopAutoplay();
      if (state.current.teleportTimeout) clearTimeout(state.current.teleportTimeout);
      if (state.current.resumeTimerTimeout) clearTimeout(state.current.resumeTimerTimeout);
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
    };
  }, [goTo, startAutoplay, stopAutoplay]);

  return (
    <section aria-labelledby="audience-title" className="audience-section">
      <div className="audience-header">
        <span className="audience-eyebrow">BUILT FOR DIFFERENT JOURNEYS</span>
        <h2 id="audience-title" className="audience-title">
          Find Your Starting Point.
        </h2>
        <p className="audience-subtitle">
          Whether you&apos;re starting fresh, growing your career or building
          something of your own, ZetaGrow gives you a practical path forward.
        </p>
      </div>

      <div
        ref={outerRef}
        className="audience-carousel"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
        role="region"
        aria-roledescription="carousel"
        aria-label="Audience categories carousel"
        tabIndex={0}
      >
        <div
          ref={trackRef}
          className="audience-track"
        >
          {SLIDES.map((item, i) => {
            const realIdx = realIndexOf(i);
            return (
              <article
                key={i}
                ref={(el) => {
                  cardEls.current[i] = el;
                }}
                className="audience-card"
                aria-label={item.eyebrow}
                aria-hidden={realIdx !== activeRealDot}
              >
                <div className="audience-card-inner">
                  <div className="audience-card-img">
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 75vw, 60vw"
                      className="object-cover"
                      loading={i >= CLONES && i < CLONES + 2 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                  <div className="audience-card-content">
                    <span className="audience-card-eyebrow">{item.eyebrow}</span>
                    <h3 className="audience-card-heading">{item.heading}</h3>
                    <p className="audience-card-desc">{item.description}</p>
                    <Link
                      href="/programs"
                      className="audience-card-cta group"
                      onClick={(e) => {
                        if (state.current.hasMoved) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <span>{item.cta}</span>
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Exactly 6 dots representing the 6 real categories */}
      <nav className="audience-dots" role="tablist" aria-label="Audience categories pagination">
        {AUDIENCES.map((item, i) => {
          const isActive = activeRealDot === i;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to ${item.eyebrow}`}
              className={`audience-dot ${isActive ? "audience-dot--active" : ""}`}
              onClick={() => onDotClick(i)}
            />
          );
        })}
      </nav>
    </section>
  );
}

