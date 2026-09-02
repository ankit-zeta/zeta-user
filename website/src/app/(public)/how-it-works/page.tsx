import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Award,
  Briefcase,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Users,
  TrendingUp,
  Wallet,
  Target,
  Zap,
  Star,
  Building2,
  GraduationCap,
  Handshake,
  BarChart3,
  UserCheck,
  Clock,
  IndianRupee,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How ZetaGrow Works — Earn Online with Freelancing, Partner Program & Skill Certification",
  description:
    "Learn how ZetaGrow works: enroll in skill-building programs, get certified, freelance for real clients, earn through our partner program, and grow into our team. Start earning from home with verified digital skills.",
  keywords:
    "how zetagrow works, earn from home, freelance work online, online earning platform, skill certification, partner program, performance marketing, work from home jobs, digital skills, earn money online India, freelancing platform India, online courses with jobs, certification with work, earn with skills, zetagrow review",
  openGraph: {
    title: "How ZetaGrow Works — Freelancing, Partner Program & Skill Certification",
    description:
      "Join ZetaGrow to learn digital skills, get certified, freelance for real clients, and earn through our partner program. Start earning from home today.",
    url: "https://zetagrow.in/how-it-works",
    siteName: "ZetaGrow",
    type: "website",
  },
  alternates: {
    canonical: "https://zetagrow.in/how-it-works",
  },
};

const works = [
  {
    icon: Briefcase,
    title: "Freelance for Our Clients",
    description:
      "We bring in direct clients who need content, marketing, design, web development, e-commerce management, and operations support. You apply for projects that match your skills, deliver the work, and get paid through your platform wallet.",
    highlights: [
      "Real client projects — not hypothetical assignments",
      "Work categories: Content, Marketing, Design, Web Dev, E-Commerce, Operations",
      "Merit-based selection — best skills win",
      "Milestone-based payouts to your wallet",
    ],
    color: "brand",
  },
  {
    icon: Users,
    title: "Partner Program — Earn from Home",
    description:
      "Share ZetaGrow programs with your network through your unique partner link. When someone purchases a program through your link, you earn partner remuneration. It's performance marketing you can do entirely from home.",
    highlights: [
      "Single-level partner remuneration on genuine purchases",
      "Work from anywhere — phone or laptop",
      "No inventory, no recruitment, no forced selling",
      "Real-time tracking in your partner dashboard",
    ],
    color: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Grow Into Our Team",
    description:
      "Your work quality, consistency, and growth on the platform matter. As you complete more projects, build a track record, and demonstrate expertise, you become eligible for in-team opportunities with higher-value clients and ongoing engagements.",
    highlights: [
      "Performance-based progression",
      "Access to higher-value client projects",
      "Ongoing engagements for top performers",
      "Your growth ratio determines your opportunities",
    ],
    color: "violet",
  },
  {
    icon: GraduationCap,
    title: "Skill Up & Get Certified",
    description:
      "ZetaGrow programs teach you practical, job-ready digital skills — from content marketing and social media to web development and e-commerce operations. Complete a program and earn a verifiable digital certificate that proves your skills to clients.",
    highlights: [
      "Structured, self-paced curriculum",
      "Practical assignments and real-world projects",
      "Verifiable digital certificate upon completion",
      "Certificate recognized by our client network",
    ],
    color: "amber",
  },
];

const steps = [
  {
    num: "01",
    title: "Create Your Free Account",
    description:
      "Sign up in seconds. No purchase required to join, explore, or apply for work. Your account is free forever.",
    icon: UserCheck,
  },
  {
    num: "02",
    title: "Choose Your Path",
    description:
      "Start freelancing directly if you already have skills, or enroll in a ZetaGrow program to build new ones. Both paths are open from day one.",
    icon: Target,
  },
  {
    num: "03",
    title: "Learn & Get Certified",
    description:
      "Complete program modules and assessments to earn your ZetaGrow certificate — a verified credential that clients trust.",
    icon: Award,
  },
  {
    num: "04",
    title: "Apply for Client Work",
    description:
      "Browse our work portal, find projects that match your skills, and apply. Selection is based on merit — your CV, portfolio, and deliverable quality.",
    icon: Briefcase,
  },
  {
    num: "05",
    title: "Deliver & Get Paid",
    description:
      "Complete milestones, get client approval, and receive payment directly to your platform wallet. Withdraw to your bank account anytime.",
    icon: Wallet,
  },
  {
    num: "06",
    topTitle: "Optionally:",
    title: "Share & Earn as a Partner",
    description:
      "Share your partner link with your network. Earn remuneration when someone purchases a program through your link. Completely optional.",
    icon: Handshake,
  },
];

const categories = [
  { name: "Content & Writing", icon: "✍️" },
  { name: "Social & Marketing", icon: "📱" },
  { name: "Web & Technical", icon: "💻" },
  { name: "Design & Creative", icon: "🎨" },
  { name: "E-Commerce", icon: "🛒" },
  { name: "Operations", icon: "⚙️" },
];

const stats = [
  { label: "Work Categories", value: "6+", icon: BarChart3 },
  { label: "Programs Available", value: "10+", icon: BookOpen },
  { label: "Partner Remuneration", value: "Single-Level", icon: TrendingUp },
  { label: "Payout Method", value: "Bank / UPI", icon: IndianRupee },
];

export default function HowItWorksPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do I need to buy a program to start earning on ZetaGrow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Creating an account is free and no purchase is ever required. Many work listings don't require a certificate. If you already have skills, you can apply for work immediately. Programs are optional.",
        },
      },
      {
        "@type": "Question",
        name: "How does the partner program work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Share your unique partner link. When someone purchases a program through your link, you earn partner remuneration. Single-level only — no teams, no chain commissions, no multi-level structures.",
        },
      },
      {
        "@type": "Question",
        name: "What kind of work can I do on ZetaGrow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Content writing, social media marketing, web development, design, e-commerce management, and operations support. You apply for projects, deliver milestones, and get paid through your wallet.",
        },
      },
      {
        "@type": "Question",
        name: "How do I get paid?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When your work is approved, payment is credited to your platform wallet. Withdraw to your verified Indian bank account via NEFT/IMPS or UPI.",
        },
      },
      {
        "@type": "Question",
        name: "Is ZetaGrow a job or internship?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. ZetaGrow is an education platform with a work marketplace. We are not an employer. Work is as an independent contractor. We do not guarantee employment, salary, stipend, or internship.",
        },
      },
      {
        "@type": "Question",
        name: "Can I earn without doing any courses?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. If you already have digital skills, create a free account and apply for work directly. Programs are optional.",
        },
      },
      {
        "@type": "Question",
        name: "Is ZetaGrow an MLM or pyramid scheme?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely not. ZetaGrow is an education platform. The partner program is a single-level referral reward — no teams, no chain commissions, no multi-level structures.",
        },
      },
    ],
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ZetaGrow",
    url: "https://zetagrow.in",
    description:
      "ZetaGrow is a skill-first platform for learning digital skills, earning verified certifications, freelancing for real clients, and growing your career.",
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "How ZetaGrow Works — Earn Online with Freelancing, Partner Program & Skill Certification",
    description:
      "Learn how ZetaGrow works: enroll in skill-building programs, get certified, freelance for real clients, and earn through our partner program.",
    url: "https://zetagrow.in/how-it-works",
    publisher: {
      "@type": "Organization",
      name: "ZetaGrow",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="max-w-3xl space-y-5">
        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
          Platform Overview
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-textMain leading-tight">
          How ZetaGrow Works
        </h1>
        <p className="text-base sm:text-lg text-textMuted leading-relaxed">
          ZetaGrow is a <strong>skill-first platform</strong> where you learn practical digital
          skills, earn verified certifications, freelance for real clients, and grow your career
          — all from home. Here&apos;s everything you need to know.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/programs" className="btn-primary text-sm inline-flex items-center gap-2">
            Explore Programs <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/work" className="btn-secondary text-sm inline-flex items-center gap-2">
            Browse Work <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5 text-center space-y-2">
            <s.icon className="w-5 h-5 text-brand-600 mx-auto" />
            <p className="text-xl font-extrabold text-textMain">{s.value}</p>
            <p className="text-[11px] text-textMuted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── What We Offer (4 pillars) ─────────────────────── */}
      <section className="space-y-10">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            What We Offer
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            Four Ways to Earn &amp; Grow on ZetaGrow
          </h2>
          <p className="text-sm text-textMuted leading-relaxed">
            ZetaGrow isn&apos;t just courses — it&apos;s a complete ecosystem for learning,
            earning, and career growth. Here&apos;s how each part works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {works.map((w) => (
            <div
              key={w.title}
              className="card-surface p-6 sm:p-8 space-y-4 hover:border-brand-300 transition-colors"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  w.color === "brand"
                    ? "bg-brand-50 text-brand-600"
                    : w.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : w.color === "violet"
                    ? "bg-violet-50 text-violet-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                <w.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-textMain">{w.title}</h3>
              <p className="text-sm text-textMuted leading-relaxed">{w.description}</p>
              <ul className="space-y-2 pt-1">
                {w.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-xs text-textMuted">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Step-by-Step Flow ─────────────────────────────── */}
      <section className="space-y-10">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Step by Step
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            Your Journey on ZetaGrow
          </h2>
          <p className="text-sm text-textMuted leading-relaxed">
            From sign-up to your first payout — here&apos;s exactly how it works.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="card-surface p-6 space-y-3 relative">
              {s.topTitle && (
                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                  {s.topTitle}
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold text-brand-200">{s.num}</span>
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-textMain">{s.title}</h3>
              <p className="text-xs text-textMuted leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Work Categories ───────────────────────────────── */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Work Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            What Kind of Work Can You Do?
          </h2>
          <p className="text-sm text-textMuted leading-relaxed">
            We bring in direct clients who need real work done. Here are the categories you can
            apply for once you&apos;re on the platform.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <div
              key={c.name}
              className="card-surface p-5 text-center space-y-2 hover:border-brand-300 transition-colors"
            >
              <span className="text-2xl">{c.icon}</span>
              <p className="text-xs font-semibold text-textMain">{c.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why ZetaGrow ──────────────────────────────────── */}
      <section className="card-surface p-8 sm:p-10 bg-brand-50/40 border-brand-200 space-y-6">
        <div className="flex items-center gap-2 text-brand-800 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <span>Why ZetaGrow Is Different</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "Real client work — not hypothetical projects or practice assignments",
            "Skill-first approach — courses teach what clients actually need",
            "Verified certificates — proof of skills that clients trust",
            "No force selling — every purchase is entirely your choice",
            "Transparent partner program — single-level, no chain or team structures",
            "Performance-based growth — your work quality determines your opportunities",
            "Work from home — all projects are remote, flexible hours",
            "Direct payouts — money goes to your wallet, withdraw anytime",
            "No employment guarantee — selection is merit-based and competitive",
            "Ethical platform — we never call you to sell; our marketing is digital only",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-xs text-textMuted leading-relaxed">
              <CheckCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>{line}</span>
            </li>
          ))}
        </div>
      </section>

      {/* ── Who Is This For ───────────────────────────────── */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Who Is This For?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            Built for People Who Want to Earn with Skills
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: "Students & Fresh Graduates",
              desc: "Build job-ready skills, earn certificates, and start freelancing — even without prior experience.",
            },
            {
              title: "Freelancers & Side Hustlers",
              desc: "Find consistent client work without bidding on competitive marketplaces. We bring the clients to you.",
            },
            {
              title: "Working Professionals",
              desc: "Upskill in digital marketing, content, or web development and take on high-value client projects.",
            },
            {
              title: "Homemakers & Remote Workers",
              desc: "Earn from home on your own schedule. All work is remote, flexible, and paid per milestone.",
            },
            {
              title: "Performance Marketers",
              desc: "Share programs with your network and earn partner remuneration — no inventory, no cold calls.",
            },
            {
              title: "Career Changers",
              desc: "Learn new digital skills, get certified, and transition into a new career path with real project experience.",
            },
          ].map((p) => (
            <div key={p.title} className="card-surface p-5 space-y-2">
              <h3 className="text-sm font-bold text-textMain">{p.title}</h3>
              <p className="text-xs text-textMuted leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ (SEO) ────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
            Common Questions About ZetaGrow
          </h2>
        </div>

        <div className="space-y-4 max-w-3xl">
          {[
            {
              q: "Do I need to buy a program to start earning on ZetaGrow?",
              a: "No. Creating an account is free and no purchase is ever required. Many work listings don't require a certificate. If you already have skills, you can apply for work immediately. Programs are optional — they help you build new skills and earn a verified certificate.",
            },
            {
              q: "How does the partner program work?",
              a: "Share your unique partner link with your network. When someone purchases a program through your link, you earn partner remuneration. It's single-level — you earn only on direct referrals. There are no team structures, chain commissions, or multi-level earnings. Completely optional.",
            },
            {
              q: "What kind of work can I do on ZetaGrow?",
              a: "We bring in direct clients who need content writing, social media marketing, web development, design, e-commerce management, and operations support. You apply for projects that match your skills, deliver milestones, and get paid through your wallet.",
            },
            {
              q: "How do I get paid?",
              a: "When your work is approved by the client (or auto-approved after the review window), payment is credited to your platform wallet. You can withdraw to your verified Indian bank account via NEFT/IMPS or UPI. Minimum withdrawal threshold applies.",
            },
            {
              q: "Is ZetaGrow a job or internship?",
              a: "No. ZetaGrow is an education platform with a work marketplace. We are not an employer. Work through the platform is as an independent contractor. We do not guarantee employment, salary, stipend, internship, or any specific income.",
            },
            {
              q: "Can I earn without doing any courses?",
              a: "Yes. If you already have digital skills, you can create a free account and apply for work directly. Programs are optional — they help you learn new skills or earn a verified certificate for work listings that require one.",
            },
            {
              q: "Is ZetaGrow an MLM or pyramid scheme?",
              a: "Absolutely not. ZetaGrow is an education platform. We sell courses. The partner program is a single-level referral reward for genuine course purchases — no teams, no chain commissions, no multi-level structures of any kind.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="card-surface group"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary className="p-5 cursor-pointer text-sm font-bold text-textMain hover:text-brand-700 transition-colors list-none flex items-center justify-between">
                <span itemProp="name">{faq.q}</span>
                <span className="text-textMuted group-open:rotate-180 transition-transform ml-2">▾</span>
              </summary>
              <div
                className="px-5 pb-5 text-xs text-textMuted leading-relaxed"
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <div itemProp="text">{faq.a}</div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="text-center space-y-5 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-textMain">
          Ready to Start Earning with Your Skills?
        </h2>
        <p className="text-sm text-textMuted max-w-xl mx-auto leading-relaxed">
          Create your free account, explore the work portal, and apply for your first client
          project. No purchase required. Your skills are your currency.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="btn-primary text-sm inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/work" className="btn-secondary text-sm inline-flex items-center gap-2">
            Browse Work Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
    </>
  );
}
