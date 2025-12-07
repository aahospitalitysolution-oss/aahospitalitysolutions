"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

import styles from './Globe.module.css';
import gsap from 'gsap';
import * as THREE from 'three';
import { isMobileDevice } from '@/utils/deviceUtils';

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
    color: string;
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
        desc: "Driving operational excellence and robust owner relationships across major hubs. We have successfully implemented pre-opening frameworks that streamline development and maximize business growth potential.",
        color: COLORS.rosy,
    },
    {
        name: "Australia",
        iso: "AUS",
        level: "H",
        lat: -25.0,
        lng: 135.0,
        desc: "Delivering strategic pre-opening frameworks and operational oversight in key metropolitan markets. Our focus on sustainable business development has fostered enduring partnerships with asset owners.",
        color: COLORS.steel,
    },
    {
        name: "New Zealand",
        iso: "NZL",
        level: "H",
        lat: -42.0,
        lng: 172.0,
        desc: "Enhancing asset value through tailored operational strategies and owner-centric relationship management. We provide comprehensive support from pre-opening planning to long-term business development.",
        color: COLORS.khaki,
    },
    {
        name: "Thailand",
        iso: "THA",
        level: "H",
        lat: 16.0,
        lng: 101.0,
        desc: "Optimizing hospitality assets with a focus on operational precision and market expansion. Our team leads pre-opening initiatives that align owner vision with sustainable business performance.",
        color: COLORS.rosy,
    },
    {
        name: "Vietnam",
        iso: "VNM",
        level: "M",
        lat: 16.0,
        lng: 107.5,
        desc: "Facilitating market entry through structured pre-opening frameworks and strategic business development. We build strong owner relationships to navigate the evolving local landscape effectively.",
        color: COLORS.rosy,
    },
    {
        name: "Indonesia",
        iso: "IDN",
        level: "L",
        lat: -4.0,
        lng: 120.0,
        desc: "Supporting new ventures with rigorous pre-opening protocols and dynamic business development strategies. Our approach centers on cultivating transparent and productive relationships with property owners.",
        color: COLORS.khaki,
    },
    {
        name: "Singapore",
        iso: "SGP",
        level: "H",
        lat: 1.35,
        lng: 103.8,
        desc: "Setting the standard for operational excellence in a high-stakes market. We manage complex pre-opening phases and drive business development while maintaining close alignment with owner objectives.",
        color: COLORS.rosy,
    },
    {
        name: "Sri Lanka",
        iso: "LKA",
        level: "H",
        lat: 7.5,
        lng: 80.5,
        desc: "Revitalizing operations and guiding properties through critical pre-opening stages. We focus on strengthening owner relationships and identifying new avenues for business growth.",
        color: COLORS.khaki,
    },
    {
        name: "Maldives",
        iso: "MDV",
        level: "H",
        lat: 3.2,
        lng: 73.2,
        desc: "Elevating resort operations through bespoke pre-opening frameworks and excellence in service delivery. We partner closely with owners to drive business development in this premier destination.",
        color: COLORS.steel,
    },
    {
        name: "Bangladesh",
        iso: "BGD",
        level: "H",
        lat: 24.0,
        lng: 90.0,
        desc: "Implementing robust operational standards and pre-opening strategies for emerging properties. Our work emphasizes solid owner relationships and proactive business development.",
        color: COLORS.steel,
    },
    {
        name: "Malaysia",
        iso: "MYS",
        level: "H",
        lat: 4.0,
        lng: 102.0,
        desc: "Streamlining operations and executing precise pre-opening plans across diverse assets. We are dedicated to fostering owner trust and accelerating business development opportunities.",
        color: COLORS.steel,
    },
    {
        name: "Cambodia",
        iso: "KHM",
        level: "M",
        lat: 12.5,
        lng: 105.0,
        desc: "Guiding projects from concept to launch with comprehensive pre-opening frameworks. We prioritize owner collaboration and strategic business development to ensure long-term success.",
        color: COLORS.khaki,
    },
    {
        name: "Laos",
        iso: "LAO",
        level: "H",
        lat: 19.5,
        lng: 102.0,
        desc: "Delivering operational expertise and structured pre-opening support for unique market entries. We build lasting owner relationships that underpin successful business development.",
        color: COLORS.steel,
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

            // Width is full width on mobile
            const width = isMobile ? window.innerWidth : window.innerWidth * 0.65;

            // Height aligns with CSS 50vh on mobile
            const height = isMobile ? window.innerHeight * 0.5 : window.innerHeight;

            setDimensions({ width, height });

            if (globeEl.current) {
                // Adjust altitude: Mobile needs to be further out (higher altitude) to see the curve 
                // since it occupies a smaller relative vertical space
                const targetAlt = isMobile ? 2.5 : 1.7;

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
            altitude: isMobile ? 2.5 : 1.7
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

    const getPolygonCapColor = useCallback((d: any) => {
        const data = getCountryData(d);
        const iso = getIso(d);
        if (iso === hoveredIso && data) return "#f6f0ed";
        else if (data) return data.color;
        else return "rgba(120, 160, 180, 0.08)";
    }, [getCountryData, getIso, hoveredIso]);

    const getPolygonSideColor = useCallback((d: any) => {
        const data = getCountryData(d);
        const iso = getIso(d);
        if (iso === hoveredIso && data) return "#ffffff";
        if (data) return "rgba(0,0,0,0.6)";
        return "rgba(0,0,0,0)";
    }, [getCountryData, getIso, hoveredIso]);

    const getPolygonStrokeColor = useCallback((d: any) => {
        const data = getCountryData(d);
        const iso = getIso(d);
        if (iso === hoveredIso && data) return "#ffffff";
        if (data) return "rgba(246, 240, 237, 0.6)";
        return "rgba(126, 168, 190, 0.15)";
    }, [getCountryData, getIso, hoveredIso]);

    const getPolygonAltitude = useCallback((d: any) => {
        const data = getCountryData(d);
        const iso = getIso(d);
        if (iso === hoveredIso && data) return 0.15;
        if (data) return 0.02;
        return 0.005;
    }, [getCountryData, getIso, hoveredIso]);

    const handlePolygonHover = useCallback((d: any) => {
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
            updateUI(data.name, data.desc, data.color);
        }
    }, [getIso, hoveredIso, getCountryData]); // updateUI is not memoized but stable enough as a class method or we can omit it if it's not a dependency

    const handlePolygonClick = useCallback((d: any) => {
        const data = getCountryData(d);
        if (data) {
            updateUI(data.name, data.desc, data.color);
        }
    }, [getCountryData]);

    return (
        <section id="global-reach" className={styles.globeSection}>
            {/* UI Layer */}
            <div className={styles.uiLayer}>
                <div ref={contentBlockRef} className={`${styles.contentBlock} w-full max-w-lg mx-auto md:mx-0`}>
                    <div className="mb-3 md:mb-8">
                        <span className="text-[10px] md:text-xs font-semibold tracking-widest text-[#7ea8be] uppercase">
                            Regional Impact
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mt-1 leading-tight text-[#f6f0ed]">
                            Pan-Asian<br />Excellence
                        </h1>
                    </div>

                    <div id="dynamic-content" className="prose prose-invert max-w-md">
                        <h2
                            ref={titleRef}
                            id="country-name"
                            className="text-xl md:text-3xl font-semibold mb-4 md:mb-8 min-h-[1.75rem] md:min-h-[2.5rem] text-[#c2948a]"
                        >
                            Decades of Expertise
                        </h2>
                        <p
                            ref={descRef}
                            id="country-desc"
                            className="text-sm md:text-lg leading-relaxed min-h-[90px] md:min-h-[160px] text-[#f6f0ed]/80 text-justify"
                        >
                            We deliver transformative results for owners across Asia Pacific's most dynamic markets. Hover over the highlighted regions to explore our specific engagements.
                        </p>
                    </div>


                </div>
            </div>

            {/* Loader */}
            {loading && <div className={styles.loader}>Loading Geo Data...</div>}

            {/* Globe Container */}
            <div className={styles.globeContainer}>
                {dimensions.width > 0 && (() => {
                    // Mobile optimization: disable transition animations for polygons
                    const isMobile = isMobileDevice();
                    const transitionDuration = isMobile ? 0 : 200;

                    return (
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
                            polygonsTransitionDuration={transitionDuration}
                            polygonCapColor={getPolygonCapColor}
                            polygonSideColor={getPolygonSideColor}
                            polygonStrokeColor={getPolygonStrokeColor}
                            polygonAltitude={getPolygonAltitude}
                            onPolygonHover={handlePolygonHover}
                            onPolygonClick={handlePolygonClick}
                        />
                    );
                })()}
            </div>
        </section>
    );
};
