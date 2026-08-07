import type { MetadataRoute } from "next";

const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "hourly",
    },
    {
      url: `${SITE_URL}/sign-in`,
      changeFrequency: "monthly",
    },
  ];
}
