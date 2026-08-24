import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://zetagrow.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/login", "/signup", "/api"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
