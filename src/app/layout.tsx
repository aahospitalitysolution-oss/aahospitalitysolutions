import type { Metadata, Viewport } from "next";
import { Spectral, DM_Sans, Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FullScreenMenu } from "@/components/FullScreenMenu/FullScreenMenu";
import FloatingContactIcons from "@/components/FloatingContactIcons";
import Footer from "@/components/Footer";
import { createMetadata } from "@/lib/metadata";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

import { ScrollProvider } from "@/contexts/ScrollContext";

export const metadata: Metadata = createMetadata({
  title: "A&A Hospitality Solutions",
  description:
    "Experience elegant animations and modern design solutions for your hospitality business",
  image: "/og-image.png",
  url: "/",
  keywords: ["hospitality", "animations", "design", "web solutions"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#28536b",
  viewportFit: "cover", // Required for env(safe-area-inset-*) to work on notched iOS devices
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${spectral.variable} ${dmSans.variable} ${playfair.variable} ${manrope.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "ProfessionalService",
                "name": "A&A Hospitality Solutions",
                "url": "https://aahospitalitysolutions.com",
                "logo": "https://aahospitalitysolutions.com/logo.png",
                "priceRange": "$$$",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+66-6-1415-7942",
                  "contactType": "customer service",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "388 Exchange Tower, 29th Floor, Unit 2901 - 2904, Sukhumvit Road, Khlong Toey",
                    "addressLocality": "Bangkok",
                    "postalCode": "10110",
                    "addressCountry": "TH"
                  }
                },
                "sameAs": [
                  "https://www.linkedin.com/company/anahospitality",
                  "https://twitter.com/anahospitality"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "A&A Hospitality Solutions",
                "url": "https://aahospitalitysolutions.com"
              }
            ])
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add("is-loading");
                } catch (e) {}
              })();
            `,
          }}
        />
        <LanguageProvider>
          <AnimationProvider>
            <MenuProvider>
              <ScrollProvider>
                <FloatingContactIcons />
                {children}
                <Footer />
                <FullScreenMenu />
              </ScrollProvider>
            </MenuProvider>
          </AnimationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
