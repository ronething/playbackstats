import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://playbackstats.com"

  return [
    {
      url: baseUrl,
      lastModified: "2026-08-11",
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/spotify`,
      lastModified: "2026-08-11",
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides/youtube-watch-history-json`,
      lastModified: "2026-08-11",
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides/how-to-see-most-watched-youtube-channels`,
      lastModified: "2026-08-11",
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: "2025-05-04",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: "2025-05-04",
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ]
}
