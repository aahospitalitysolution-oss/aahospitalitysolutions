import type { Metadata } from "next";

/**
 * Configuration for creating metadata
 */
interface MetadataConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  keywords?: string[];
  robots?: Metadata["robots"];
}

/**
 * Converts a relative URL to an absolute URL using the site's base URL
 * @param path - Relative or absolute URL path
 * @returns Absolute URL with domain
 */
export function getAbsoluteUrl(path: string): string {
  // If already absolute, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Get base URL from environment variable with fallback
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Remove trailing slash from baseUrl and combine
  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

/**
 * Creates a complete metadata object with Open Graph, Twitter Card, and PWA configuration
 * @param config - Metadata configuration options
 * @returns Next.js Metadata object
 */
export function createMetadata(config: MetadataConfig): Metadata {
  const {
    title,
    description,
    image = "/og-image.png",
    url = "/",
    keywords = ["hospitality", "solutions", "A&A", "business"],
    robots,
  } = config;

  const absoluteImageUrl = getAbsoluteUrl(image);
  const absoluteUrl = getAbsoluteUrl(url);

  return {
    metadataBase: new URL(absoluteUrl),
    title,
    description,
    keywords,
    robots,
    authors: [{ name: "A&A Hospitality Solutions" }],
    alternates: {
      canonical: absoluteUrl,
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        {
          url: "/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "A&A Hospitality Solutions",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImageUrl],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title,
    },
    manifest: "/manifest.json",
  };
}

/**
 * Default metadata configuration for the application
 */
const defaultMetadata: Metadata = createMetadata({
  title: "A&A Hospitality Solutions",
  description:
    "Experience elegant animations and modern design solutions for your hospitality business",
  image: "/og-image.png",
  url: "/",
  keywords: ["hospitality", "solutions", "business", "A&A"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
});

export default defaultMetadata;
