import React from 'react';
import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = createMetadata({
    title: "Terms of Service - A&A Hospitality Solutions",
    description:
        "Review the terms and conditions for using A&A Hospitality Solutions website and services. Understand your rights and responsibilities when accessing our platform.",
    image: "/og-image.png",
    url: "/terms-of-service",
    keywords: [
        "terms of service",
        "terms and conditions",
        "user agreement",
        "A&A Hospitality",
        "legal",
    ],
});

import TermsClient from './TermsClient';

export default function TermsOfService() {
    return <TermsClient />;
}
