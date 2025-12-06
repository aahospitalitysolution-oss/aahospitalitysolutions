import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import HomeClient from "./HomeClient";

export const metadata: Metadata = createMetadata({
  title: "A&A Hospitality Solutions - Strategic Advisory & Operational Excellence",
  description:
    "Transform your hospitality asset with expert strategic advisory and operational excellence. Serving hotel owners and operators with proven solutions for maximizing performance and ROI.",
  image: "/og-image.png",
  url: "/",
  keywords: [
    "hospitality solutions",
    "hotel management",
    "strategic advisory",
    "operational excellence",
    "hotel consulting",
    "A&A Hospitality",
  ],
});

export default function Home() {
  return <HomeClient />;
}
