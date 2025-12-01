import type { Metadata, Viewport } from "next";
import { Spectral, DM_Sans } from "next/font/google";
import "./globals.css";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { FullScreenMenu } from "@/components/FullScreenMenu/FullScreenMenu";

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

export const metadata: Metadata = {
  title: "A&A Hospitality Solutions",
  description:
    "Experience elegant animations and modern design solutions for your hospitality business",
  keywords: ["hospitality", "animations", "design", "web solutions"],
  authors: [{ name: "A&A Hospitality Solutions" }],
  openGraph: {
    title: "A&A Hospitality Solutions",
    description: "Experience elegant animations and modern design solutions",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F5EFE6",
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
        className={`${spectral.variable} ${dmSans.variable} antialiased`}
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
            {children}
          </MenuProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}
