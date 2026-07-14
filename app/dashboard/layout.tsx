import { Metadata } from "next"

export const metadata: Metadata = {
  title: "YouTube Dashboard | Playback Stats",
  description: "Explore private insights and charts generated from your local YouTube watch history export.",
  openGraph: {
    title: "YouTube Dashboard | Playback Stats",
    description: "Explore private insights and charts generated from your local YouTube watch history export.",
    url: "https://playbackstats.com/dashboard",
    siteName: "Playback Stats",
  },
  twitter: {
    title: "YouTube Dashboard | Playback Stats",
    description: "Explore private insights and charts generated from your local YouTube watch history export.",
  },
  alternates: {
    canonical: "https://playbackstats.com/dashboard",
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
