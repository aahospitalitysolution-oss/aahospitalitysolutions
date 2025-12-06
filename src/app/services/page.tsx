import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import ServicesClient from "./ServicesClient";

export const metadata: Metadata = createMetadata({
  title: "Services - A&A Hospitality Solutions",
  description:
    "Comprehensive hospitality advisory services for owners and operators. Strategic asset management, operational excellence, and specialized solutions to maximize your property's performance and value.",
  image: "/og-image.png",
  url: "/services",
  keywords: [
    "hospitality services",
    "hotel advisory",
    "asset management",
    "operational consulting",
    "owner services",
    "operator services",
    "hotel optimization",
    "A&A Hospitality",
  ],
});

export default function ServicesPage() {
  return <ServicesClient />;
}
