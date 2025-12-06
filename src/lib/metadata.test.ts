import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getAbsoluteUrl, createMetadata } from "./metadata";

describe("metadata utilities", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });

  describe("getAbsoluteUrl", () => {
    it("should return absolute URLs unchanged", () => {
      expect(getAbsoluteUrl("https://example.com/path")).toBe(
        "https://example.com/path"
      );
      expect(getAbsoluteUrl("http://example.com/path")).toBe(
        "http://example.com/path"
      );
    });

    it("should convert relative URLs to absolute with environment variable", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://anahospitality.com";
      expect(getAbsoluteUrl("/og-image.png")).toBe(
        "https://anahospitality.com/og-image.png"
      );
    });

    it("should handle paths without leading slash", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://anahospitality.com";
      expect(getAbsoluteUrl("og-image.png")).toBe(
        "https://anahospitality.com/og-image.png"
      );
    });

    it("should use localhost fallback when environment variable is not set", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;
      expect(getAbsoluteUrl("/og-image.png")).toBe(
        "http://localhost:3000/og-image.png"
      );
    });

    it("should handle trailing slash in base URL", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://anahospitality.com/";
      expect(getAbsoluteUrl("/og-image.png")).toBe(
        "https://anahospitality.com/og-image.png"
      );
    });
  });

  describe("createMetadata", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://anahospitality.com";
    });

    it("should create metadata with all required fields", () => {
      const metadata = createMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.title).toBe("Test Page");
      expect(metadata.description).toBe("Test description");
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
      expect(metadata.appleWebApp).toBeDefined();
      expect(metadata.manifest).toBe("/manifest.json");
    });

    it("should use absolute URLs for images", () => {
      const metadata = createMetadata({
        title: "Test Page",
        description: "Test description",
        image: "/custom-image.png",
      });

      expect(metadata.openGraph?.images).toEqual([
        {
          url: "https://anahospitality.com/custom-image.png",
          width: 1200,
          height: 630,
          alt: "Test Page",
        },
      ]);
      expect(metadata.twitter?.images).toEqual([
        "https://anahospitality.com/custom-image.png",
      ]);
    });

    it("should use default values when not provided", () => {
      const metadata = createMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.keywords).toEqual([
        "hospitality",
        "solutions",
        "A&A",
        "business",
      ]);
      expect(metadata.openGraph?.images?.[0]?.url).toBe(
        "https://anahospitality.com/og-image.png"
      );
    });

    it("should set Open Graph properties correctly", () => {
      const metadata = createMetadata({
        title: "Test Page",
        description: "Test description",
        url: "/test-page",
      });

      expect(metadata.openGraph?.title).toBe("Test Page");
      expect(metadata.openGraph?.description).toBe("Test description");
      expect(metadata.openGraph?.type).toBe("website");
      expect(metadata.openGraph?.url).toBe(
        "https://anahospitality.com/test-page"
      );
      expect(metadata.openGraph?.siteName).toBe("A&A Hospitality Solutions");
    });

    it("should set Twitter Card properties correctly", () => {
      const metadata = createMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.twitter?.card).toBe("summary_large_image");
      expect(metadata.twitter?.title).toBe("Test Page");
      expect(metadata.twitter?.description).toBe("Test description");
    });

    it("should set Apple Web App properties correctly", () => {
      const metadata = createMetadata({
        title: "Test Page",
        description: "Test description",
      });

      expect(metadata.appleWebApp?.capable).toBe(true);
      expect(metadata.appleWebApp?.statusBarStyle).toBe("black-translucent");
      expect(metadata.appleWebApp?.title).toBe("Test Page");
    });
  });
});
