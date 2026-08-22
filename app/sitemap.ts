import { MetadataRoute } from "next"

const baseUrl = "https://playbackstats.com"
const homeLanguages = {
  en: baseUrl,
  de: `${baseUrl}/de`,
  fr: `${baseUrl}/fr`,
  "x-default": baseUrl,
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: "2026-08-22",
      changeFrequency: "monthly",
      priority: 1.0,
      alternates: { languages: homeLanguages },
    },
    {
      url: `${baseUrl}/de`,
      lastModified: "2026-08-22",
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: homeLanguages },
    },
    {
      url: `${baseUrl}/fr`,
      lastModified: "2026-08-22",
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages: homeLanguages },
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
