import React from 'react';
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = createMetadata({
    title: "Privacy Policy - A&A Hospitality Solutions",
    description:
        "Learn how A&A Hospitality Solutions collects, uses, and protects your personal information. Our commitment to privacy and data security for our clients and website visitors.",
    image: "/og-image.png",
    url: "/privacy-policy",
    keywords: [
        "privacy policy",
        "data protection",
        "personal information",
        "A&A Hospitality",
        "privacy",
    ],
});

import PrivacyClient from './PrivacyClient';

export default function PrivacyPolicy() {
    return <PrivacyClient />;
}
