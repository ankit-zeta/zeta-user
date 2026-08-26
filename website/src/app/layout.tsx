import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in"),
  icons: {
    icon: "/zetagrow favicon.png",
    shortcut: "/zetagrow favicon.png",
    apple: "/zetagrow favicon.png",
  },
  title: {
    default: "ZetaGrow — Online Courses with Verified Certificates & Real Work Opportunities in India",
    template: "%s | ZetaGrow",
  },
  description:
    "Learn job-ready digital skills with text-based courses and verified certificates — digital marketing, e-commerce, coding, AI tools, sales and communication. Complete a course test, earn your certificate, and get matched with real client work opportunities.",
  keywords: [
    "online courses with certificates India",
    "digital marketing course with certificate",
    "learn digital marketing online India",
    "e-commerce course India",
    "Shopify course for beginners",
    "Meta ads course India",
    "Google Ads course for beginners",
    "AI prompt course India",
    "coding course from scratch",
    "freelancing training India",
    "sales communication course online",
    "lead generation course",
    "skill-based courses India",
    "verified online certificate courses",
    "work from home skills training India",
  ],
  authors: [{ name: "ZetaGrow" }],
  creator: "ZetaGrow",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "ZetaGrow",
    title: "ZetaGrow — Learn Job-Ready Digital Skills, Get Verified Certificates",
    description:
      "Text-based, self-paced courses across sales, e-commerce, marketing, coding and AI — each ending in a verifiable certificate. Plus a curated work portal for qualified learners.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZetaGrow — Learn. Work. Grow.",
    description:
      "Online certificate courses in digital marketing, e-commerce, coding and AI + real work opportunities for verified learners in India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "ZetaGrow",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in",
  description:
    "Online learning platform offering certificate courses in digital marketing, e-commerce, coding, AI tools, sales and communication, with a curated work marketplace for qualified learners.",
  areaServed: { "@type": "Country", name: "India" },
  sameAs: [],
};

// Google Tag Manager container id + Google Analytics 4 measurement id —
// public identifiers, not secrets. Never push PII (emails, tokens, user ids)
// into dataLayer.
const GTM_ID = "GTM-NVKRTJ7F";
const GA_ID = "G-K7J5K99VGY";

const GTM_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

const GA_INIT_SNIPPET = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Google Tag Manager — loaded async, never blocks rendering */}
        <Script id="gtm-init" strategy="afterInteractive">
          {GTM_SNIPPET}
        </Script>
        {/* Google tag (gtag.js) — GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {GA_INIT_SNIPPET}
        </Script>
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-bgWarm text-textMain antialiased`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
        />
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
