"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

import styles from './Globe.module.css';
import gsap from 'gsap';
import * as THREE from 'three';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

// Types
interface CountryData {
    name: string;
    iso: string;
    level: 'H' | 'M' | 'L';
    lat: number;
    lng: number;
    desc: string;
}

interface GeoJsonFeature {
    properties: {
        ISO_A3?: string;
        ADM0_A3?: string;
        sov_a3?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

// Constants
const COLORS = {
    charcoal: "#28536b",
    rosy: "#c2948a",
    steel: "#7ea8be",
    parchment: "#f6f0ed",
    khaki: "#bbb193",
    globeWater: "#09121a",
    globeGlow: "#1a2e3b",
};

const EXP_LEVELS = {
    H: { color: COLORS.rosy, label: "High" },
    M: { color: COLORS.khaki, label: "Medium" },
    L: { color: COLORS.steel, label: "Low" },
};

const TARGET_COUNTRIES: CountryData[] = [
    {
        name: "India",
        iso: "IND",
        level: "H",
        lat: 22.0,
        lng: 79.0,
        desc: "Spearheaded a digital transformation initiative for a leading fintech conglomerate. Over 15 years of localized architectural implementation ensuring 99.99% uptime across Mumbai and Bangalore hubs.",
    },
    {
        name: "Australia",
        iso: "AUS",
        level: "H",
        lat: -25.0,
        lng: 135.0,
        desc: "Developed critical infrastructure software for logistics networks in Sydney and Melbourne. Our teams have integrated legacy banking systems with modern cloud solutions.",
    },
    {
        name: "New Zealand",
        iso: "NZL",
        level: "H",
        lat: -42.0,
        lng: 172.0,
        desc: "Partnered with agricultural tech firms to deploy IoT sensor networks across the South Island. Full stack development and data analytics support since 2016.",
    },
    {
        name: "Thailand",
        iso: "THA",
        level: "H",
        lat: 16.0,
        lng: 101.0,
        desc: "Established a regional HQ in Bangkok focusing on e-commerce scalability. Successfully migrated 50+ enterprise applications to microservices architectures.",
    },
    {
        name: "Vietnam",
        iso: "VNM",
        level: "M",
        lat: 16.0,
        lng: 107.5,
        desc: "Growing presence in Ho Chi Minh City's tech park. Currently deploying AI-driven customer support modules for telecommunications partners.",
    },
    {
        name: "Indonesia",
        iso: "IDN",
        level: "L",
        lat: -4.0,
        lng: 120.0,
        desc: "Initial market entry phase. Conducting feasibility studies and pilot programs for renewable energy software management systems in Jakarta.",
    },
    {
        name: "Singapore",
        iso: "SGP",
        level: "H",
        lat: 1.35,
        lng: 103.8,
        desc: "Our APAC command center. High-frequency trading algorithms and secure blockchain ledger implementation for sovereign wealth funds.",
    },
    {
        name: "Sri Lanka",
        iso: "LKA",
        level: "H",
        lat: 7.5,
        lng: 80.5,
        desc: "Robust offshore development center in Colombo. Specializing in enterprise resource planning (ERP) customization and QA automation.",
    },
    {
        name: "Bangladesh",
        iso: "BGD",
        level: "H",
        lat: 24.0,
        lng: 90.0,
        desc: "Large scale fintech integration for mobile banking platforms. Empowering rural connectivity through low-latency transaction processing.",
    },
    {
        name: "Malaysia",
        iso: "MYS",
        level: "H",
        lat: 4.0,
        lng: 102.0,
        desc: "Cybersecurity operations center based in Kuala Lumpur. Providing 24/7 threat monitoring and compliance auditing for multinational clients.",
    },
    {
        name: "Cambodia",
        iso: "KHM",
        level: "M",
        lat: 12.5,
        lng: 105.0,
        desc: "Collaborating with NGO partners to build educational platforms. Mid-tier development involving React Native mobile applications.",
    },
    {
        name: "Laos",
        iso: "LAO",
        level: "H",
        lat: 19.5,
        lng: 102.0,
        desc: "Unexpectedly high volume of hydroelectric power grid management software. Systems engineering and SCADA integration experts on site.",
    },
];

export const GlobeSection = () => {
    const globeEl = useRef<any>(null);
    const [countries, setCountries] = useState<GeoJsonFeature[]>([]);
    const [hoveredIso, setHoveredIso] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState(true);

    // UI Refs
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const contentBlockRef = useRef<HTMLDivElement>(null);

    const getIso = useCallback((d: GeoJsonFeature) =>
        d.properties.ISO_A3 || d.properties.ADM0_A3 || d.properties.sov_a3, []);

    const getCountryData = useCallback((d: GeoJsonFeature | null) => {
        if (!d) return null;
        const iso = getIso(d);
        return TARGET_COUNTRIES.find((c) => c.iso === iso);
    }, [getIso]);

    // Fetch Data
    useEffect(() => {
        fetch("https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
            .then((res) => res.json())
            .then((data) => {
                setCountries(data.features);
                setLoading(false);

                // Animate content block in
                if (contentBlockRef.current) {
                    gsap.to(contentBlockRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        delay: 0.5,
                    });
                }
            });
    }, []);

    // Handle Resize
    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window === 'undefined') return;

            const isMobile = window.innerWidth <= 768;
            const width = isMobile ? window.innerWidth : window.innerWidth * 0.65;
            const height = isMobile ? window.innerHeight * 0.55 : window.innerHeight;

            setDimensions({ width, height });

            if (globeEl.current) {
                const targetAlt = isMobile ? 1.45 : 1.7;
                const currentPos = globeEl.current.pointOfView();
                if (Math.abs(currentPos.altitude - targetAlt) > 0.02) {
                    globeEl.current.pointOfView(
                        {
                            lat: currentPos.lat,
                            lng: currentPos.lng,
                            altitude: targetAlt,
                        },
                        400
                    );
                }
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Robust Initial Setup via Callback
    // This replaces the previous useEffect to guarantee execution when the globe instance is ready
    const handleGlobeReady = useCallback(() => {
        if (!globeEl.current) return;

        const world = globeEl.current;
        const controls = world.controls();

        if (controls) {
            // CRITICAL: Disable zoom to prevent scroll hijacking / shrinking effect
            controls.enableZoom = false; 
            controls.autoRotate = false;
            
            // Set limits
            controls.minAzimuthAngle = 0.8;
            controls.maxAzimuthAngle = 2.8;
            controls.minPolarAngle = 0.5;
            controls.maxPolarAngle = 2.5;

            // Add listener to enforce these settings if interaction attempts to reset them
            controls.addEventListener("start", () => {
                controls.enableZoom = false;
                controls.autoRotate = false;
            });
        }

        // Set initial Point of View
        const isMobile = window.innerWidth <= 768;
        world.pointOfView({
            lat: 10,
            lng: 100,
            altitude: isMobile ? 1.45 : 1.7
        }, 0); // 0ms duration for instant set
    }, []);

    const updateUI = (title: string, desc: string, color: string) => {
        if (!titleRef.current || !descRef.current) return;

        gsap.killTweensOf([titleRef.current, descRef.current]);
        const tl = gsap.timeline();
        tl.to([titleRef.current, descRef.current], { opacity: 0.4, duration: 0.1 })
            .call(() => {
                if (titleRef.current) {
                    titleRef.current.textContent = title;
                    titleRef.current.style.color = color;
                }
                if (descRef.current) {
                    descRef.current.textContent = desc;
                    descRef.current.style.borderColor = color;
                }
            })
            .to([titleRef.current, descRef.current], { opacity: 1, duration: 0.2 });
    };

    // Globe Props
    const globeMaterial = useMemo(() => {
        return new THREE.MeshPhongMaterial({
            color: COLORS.globeWater,
            shininess: 50,
            specular: new THREE.Color("#333333"),
            side: THREE.DoubleSide,
        });
    }, []);

    return (
        <section className={styles.globeSection}>
            {/* UI Layer */}
            <div className={styles.uiLayer}>
                <div ref={contentBlockRef} className={`${styles.contentBlock} w-full max-w-lg mx-auto md:mx-0`}>
                    <div className="mb-3 md:mb-8">
                        <span className="text-[10px] md:text-xs font-semibold tracking-widest text-[#7ea8be] uppercase">
                            Global Operations
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mt-1 leading-tight text-[#f6f0ed]">
                            APAC Region<br />Experience
                        </h1>
                    </div>

                    <div id="dynamic-content" className="prose prose-invert max-w-md">
                        <h2
                            ref={titleRef}
                            id="country-name"
                            className="text-xl md:text-3xl font-semibold mb-1 md:mb-4 min-h-[1.75rem] md:min-h-[2.5rem] text-[#c2948a]"
                        >
                            Explore the Map
                        </h2>
                        <p
                            ref={descRef}
                            id="country-desc"
                            className="text-sm md:text-lg leading-relaxed min-h-[90px] md:min-h-[160px] text-[#f6f0ed]"
                        >
                            Hover over (or tap on mobile) the highlighted countries to reveal
                            detailed case studies and infrastructure projects.
                        </p>
                    </div>

                    <div className="mt-2 md:mt-12 pt-2 md:pt-6">
                        <h3 className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-[#7ea8be] mb-2 md:mb-4">
                            Experience Intensity
                        </h3>
                        <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-medium">
                            <div className="flex items-center text-[#f6f0ed]">
                                <span className={styles.legendDot} style={{ backgroundColor: "#c2948a" }}></span>High
                            </div>
                            <div className="flex items-center text-[#f6f0ed]">
                                <span className={styles.legendDot} style={{ backgroundColor: "#bbb193" }}></span>Medium
                            </div>
                            <div className="flex items-center text-[#f6f0ed]">
                                <span className={styles.legendDot} style={{ backgroundColor: "#7ea8be" }}></span>Low
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loader */}
            {loading && <div className={styles.loader}>Loading Geo Data...</div>}

            {/* Globe Container */}
            <div className={styles.globeContainer}>
                {dimensions.width > 0 && (
                    <Globe
                        ref={globeEl}
                        onGlobeReady={handleGlobeReady}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="rgba(0,0,0,0)"
                        showGlobe={true}
                        showAtmosphere={true}
                        atmosphereColor={COLORS.globeGlow}
                        atmosphereAltitude={0.15}
                        globeMaterial={globeMaterial}
                        polygonsData={countries}
                        polygonsTransitionDuration={200}
                        polygonCapColor={(d: any) => {
                            const data = getCountryData(d);
                            const iso = getIso(d);
                            if (iso === hoveredIso && data) return "#f6f0ed";
                            else if (data) return EXP_LEVELS[data.level].color;
                            else return "rgba(120, 160, 180, 0.08)";
                        }}
                        polygonSideColor={(d: any) => {
                            const data = getCountryData(d);
                            const iso = getIso(d);
                            if (iso === hoveredIso && data) return "#ffffff";
                            if (data) return "rgba(0,0,0,0.6)";
                            return "rgba(0,0,0,0)";
                        }}
                        polygonStrokeColor={(d: any) => {
                            const data = getCountryData(d);
                            const iso = getIso(d);
                            if (iso === hoveredIso && data) return "#ffffff";
                            if (data) return "rgba(246, 240, 237, 0.6)";
                            return "rgba(126, 168, 190, 0.15)";
                        }}
                        polygonAltitude={(d: any) => {
                            const data = getCountryData(d);
                            const iso = getIso(d);
                            if (iso === hoveredIso && data) return 0.15;
                            if (data) return 0.02;
                            return 0.005;
                        }}
                        onPolygonHover={(d: any) => {
                            const iso = d ? (getIso(d) as string) || null : null;
                            if (iso === hoveredIso) return;

                            setHoveredIso(iso);
                            const data = getCountryData(d);

                            // Update cursor
                            if (globeEl.current) {
                                const canvas = globeEl.current.renderer().domElement;
                                canvas.style.cursor = data ? "pointer" : "default";
                            }

                            if (data) {
                                updateUI(data.name, data.desc, EXP_LEVELS[data.level].color);
                            }
                        }}
                        onPolygonClick={(d: any) => {
                            const data = getCountryData(d);
                            if (data) {
                                updateUI(data.name, data.desc, EXP_LEVELS[data.level].color);
                            }
                        }}
                    />
                )}
            </div>
        </section>
    );
};
