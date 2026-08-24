import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in"),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-bgWarm text-textMain antialiased`}>
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
