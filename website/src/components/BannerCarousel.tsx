"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type BannerCarouselProps = {
  targetPage: "affiliate" | "work";
};

export default function BannerCarousel({ targetPage }: BannerCarouselProps) {
  const banners = useQuery(api.banners.getActiveBanners, { targetPage });
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!banners || banners.length <= 1 || paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners, paused]);

  const goTo = useCallback(
    (idx: number) => {
      if (!banners) return;
      setCurrent(((idx % banners.length) + banners.length) % banners.length);
    },
    [banners]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  if (!banners || banners.length === 0 || !mounted) return null;

  return (
    <div
      className="relative w-full max-w-[1200px] mx-auto overflow-hidden rounded-xl border border-borderSubtle bg-neutral-100"
      style={{ height: "200px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Banner slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, idx) => {
          const isActive = idx === current;
          const Wrapper = banner.linkUrl ? "a" : "div";
          const wrapperProps = banner.linkUrl
            ? {
                href: banner.linkUrl,
                target: banner.openInNewTab ? "_blank" : "_self",
                rel: banner.openInNewTab ? "noopener noreferrer" : undefined,
              }
            : {};

          return (
            <Wrapper
              key={banner._id}
              {...wrapperProps}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading={idx === 0 ? "eager" : "lazy"}
              />
              {/* Content overlay */}
              {(banner.title || banner.subtitle || banner.ctaText) && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />
              )}
              {/* Text content */}
              {(banner.title || banner.subtitle || banner.ctaText) && (
                <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12 pointer-events-none">
                  {banner.title && (
                    <h3 className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg leading-tight">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-xs sm:text-sm text-white/90 mt-1 sm:mt-2 max-w-md drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.ctaText && banner.linkUrl && (
                    <div
                      className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white shadow-lg pointer-events-auto"
                      style={{ backgroundColor: banner.ctaColor || "#16a34a" }}
                    >
                      {banner.ctaText}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )}
            </Wrapper>
          );
        })}
      </div>

      {/* Navigation arrows — only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-textMain transition-colors shadow-sm"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-textMain transition-colors shadow-sm"
            aria-label="Next banner"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-white w-5"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
