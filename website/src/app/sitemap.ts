import type { MetadataRoute } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in";
const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://terrific-dove-836.convex.cloud"
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "", "/plans", "/programs", "/work", "/how-it-works", "/faq", "/about",
    "/contact", "/terms", "/privacy", "/refund-policy", "/disclaimer",
    "/acceptable-use", "/intellectual-property", "/cookie-policy",
    "/accessibility", "/security", "/payment-terms",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/plans" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/plans" || path === "/programs" ? 0.9 : 0.6,
  }));

  try {
    const plans = (await convex.query(api.plans.getPublicPlans, {})) as any[];
    const courses = (await convex.query(api.programs.getPublicPrograms, {})) as any[];

    const planRoutes: MetadataRoute.Sitemap = (plans || []).map((p) => ({
      url: `${BASE}/plans/${p.slug}`,
      lastModified: new Date(p.updatedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    const courseRoutes: MetadataRoute.Sitemap = (courses || []).map((c) => ({
      url: `${BASE}/programs/${c.slug}`,
      lastModified: new Date(c.updatedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...planRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
