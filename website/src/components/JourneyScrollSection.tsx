"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CARDS = [
  {
    eyebrow: "PRACTICAL LEARNING",
    heading: "Learn Skills Built for the Real World.",
    description:
      "Move beyond scattered tutorials and random online courses. ZetaGrow helps you build practical digital skills through structured learning paths designed for real work, career growth and everyday professional challenges.",
    points: ["Structured learning paths", "Practical, job-relevant skills", "Learn from beginner to advanced"],
    cta: "Explore Programs",
    ctaHref: "/programs",
    imageSrc: "/box info sections/Learn Skills Built for the Real World.png",
    imageAlt: "Professional learning practical digital skills on a laptop",
    reverse: false,
  },
  {
    eyebrow: "BUILD YOUR EDGE",
    heading: "Turn New Skills Into Professional Confidence.",
    description:
      "Learning is more valuable when you can show what you know. Build your knowledge step by step, track your progress and create stronger proof of the skills you are developing for your professional journey.",
    points: ["Track your learning progress", "Build practical confidence", "Strengthen your professional profile"],
    cta: "Start Your Journey",
    ctaHref: "/signup",
    imageSrc: "/box info sections/Turn New Skills Into Professional Confidence.png",
    imageAlt: "Building professional confidence through verified certificates and progress tracking",
    reverse: true,
  },
  {
    eyebrow: "LEARN YOUR WAY",
    heading: "Grow at Your Own Pace.",
    description:
      "Whether you are a student, working professional or someone starting again, build new skills around your own schedule. Learn step by step and move forward when you are ready.",
    points: ["Flexible learning", "Learn around your schedule", "Progress without rushing"],
    cta: "Browse Learning Paths",
    ctaHref: "/programs",
    imageSrc: "/box info sections/Grow at Your Own Pace.png",
    imageAlt: "Flexible self-paced learning on a tablet from anywhere",
    reverse: false,
  },
  {
    eyebrow: "PUT SKILLS TO WORK",
    heading: "Learn Today. Build for Real Opportunities.",
    description:
      "The goal is not simply to complete another course. Build practical skills, develop proof of what you can do and take the next step towards real projects, professional work and future opportunities.",
    points: ["Apply your skills", "Build real-world experience", "Move towards professional opportunities"],
    cta: "Explore Opportunities",
    ctaHref: "/work",
    imageSrc: "/box info sections/Learn Today. Build for Real Opportunities.png",
    imageAlt: "Digital skills applied to real professional projects and opportunities",
    reverse: true,
  },
];

function CardContent({ card }: { card: (typeof CARDS)[number] }) {
  return (
    <div className="flex flex-col gap-5 lg:gap-6 justify-center">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider w-fit">
        {card.eyebrow}
      </span>
      <h3 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold tracking-tight text-textMain leading-[1.15]">
        {card.heading}
      </h3>
      <p className="text-sm sm:text-base text-textMuted leading-relaxed max-w-lg">
        {card.description}
      </p>
      <ul className="space-y-2" role="list">
        {card.points.map((p) => (
          <li key={p} className="flex items-center gap-2.5 text-sm text-textMain">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={card.ctaHref}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800 mt-1 w-fit"
      >
        <span>{card.cta}</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function JourneyScrollSection() {
  return (
    <section
      id="journey-scroll"
      aria-labelledby="journey-scroll-title"
      className="relative bg-bgWarm"
    >
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider">
            The ZetaGrow Journey
          </span>
          <h2
            id="journey-scroll-title"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textMain"
          >
            From Learning to Real Opportunities.
          </h2>
          <p className="text-base sm:text-lg text-textMuted max-w-xl mx-auto">
            Build practical skills, strengthen your professional confidence and
            take meaningful steps towards real-world opportunities — all through
            one structured journey.
          </p>
        </header>
      </div>

      {/* Stacking cards */}
      <div className="journey-stack relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {CARDS.map((card, i) => (
          <article
            key={i}
            className="journey-card"
            style={{ zIndex: i + 1 }}
          >
            <div className="journey-card-inner bg-white border border-borderSubtle rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Desktop: alternating layout */}
              <div
                className={`hidden lg:grid grid-cols-2 gap-0 min-h-[420px] ${
                  card.reverse ? "" : ""
                }`}
                style={card.reverse ? { direction: "rtl" } : undefined}
              >
                {/* Image */}
                <div className="journey-img-wrap relative bg-bgWarm flex items-center justify-center rounded-l-2xl" style={{ direction: "ltr" }}>
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </div>
                {/* Content */}
                <div className="p-8 lg:p-10 flex items-center" style={{ direction: "ltr" }}>
                  <CardContent card={card} />
                </div>
              </div>

              {/* Mobile / tablet: stacked vertical */}
              <div className="lg:hidden">
                <div className="journey-img-wrap relative bg-bgWarm">
                  <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 50vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <CardContent card={card} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
