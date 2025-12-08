import type { Metadata, Viewport } from "next";
import { Spectral, DM_Sans, Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { MenuProvider } from "@/contexts/MenuContext";
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
        <AnimationProvider>
          <MenuProvider>
            <FullScreenMenu />
            <FloatingContactIcons />
            {children}
            <Footer />
          </MenuProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}
