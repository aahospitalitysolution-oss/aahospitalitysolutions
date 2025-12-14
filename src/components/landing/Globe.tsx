"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';

import styles from './Globe.module.css';
import gsap from 'gsap';
import * as THREE from 'three';
import { isMobileDevice } from '@/utils/deviceUtils';
import { useLanguage } from '@/contexts/LanguageContext';

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


export const GlobeSection = () => {
    const { t } = useLanguage();
    const globeEl = useRef<any>(null);
    const [countries, setCountries] = useState<GeoJsonFeature[]>([]);
    const [hoveredIso, setHoveredIso] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState(true);

    const TARGET_COUNTRIES = useMemo<CountryData[]>(() => [
        { name: t.globe.countries.india.name, iso: "IND", level: "H", lat: 22.0, lng: 79.0, desc: t.globe.countries.india.desc, color: COLORS.rosy },
        { name: t.globe.countries.australia.name, iso: "AUS", level: "H", lat: -25.0, lng: 135.0, desc: t.globe.countries.australia.desc, color: COLORS.steel },
        { name: t.globe.countries.newZealand.name, iso: "NZL", level: "H", lat: -42.0, lng: 172.0, desc: t.globe.countries.newZealand.desc, color: COLORS.khaki },
        { name: t.globe.countries.thailand.name, iso: "THA", level: "H", lat: 16.0, lng: 101.0, desc: t.globe.countries.thailand.desc, color: COLORS.rosy },
        { name: t.globe.countries.vietnam.name, iso: "VNM", level: "M", lat: 16.0, lng: 107.5, desc: t.globe.countries.vietnam.desc, color: COLORS.rosy },
        { name: t.globe.countries.indonesia.name, iso: "IDN", level: "L", lat: -4.0, lng: 120.0, desc: t.globe.countries.indonesia.desc, color: COLORS.khaki },
        { name: t.globe.countries.singapore.name, iso: "SGP", level: "H", lat: 1.35, lng: 103.8, desc: t.globe.countries.singapore.desc, color: COLORS.rosy },
        { name: t.globe.countries.sriLanka.name, iso: "LKA", level: "H", lat: 7.5, lng: 80.5, desc: t.globe.countries.sriLanka.desc, color: COLORS.khaki },
        { name: t.globe.countries.maldives.name, iso: "MDV", level: "H", lat: 3.2, lng: 73.2, desc: t.globe.countries.maldives.desc, color: COLORS.steel },
        { name: t.globe.countries.bangladesh.name, iso: "BGD", level: "H", lat: 24.0, lng: 90.0, desc: t.globe.countries.bangladesh.desc, color: COLORS.steel },
        { name: t.globe.countries.malaysia.name, iso: "MYS", level: "H", lat: 4.0, lng: 102.0, desc: t.globe.countries.malaysia.desc, color: COLORS.steel },
        { name: t.globe.countries.cambodia.name, iso: "KHM", level: "M", lat: 12.5, lng: 105.0, desc: t.globe.countries.cambodia.desc, color: COLORS.khaki },
        { name: t.globe.countries.laos.name, iso: "LAO", level: "H", lat: 19.5, lng: 102.0, desc: t.globe.countries.laos.desc, color: COLORS.steel },
    ], [t]);

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
    }, [getIso, TARGET_COUNTRIES]);

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
        <section className={styles.globeSection}>
            {/* UI Layer */}
            <div className={styles.uiLayer}>
                <div ref={contentBlockRef} className={`${styles.contentBlock} w-full max-w-lg mx-auto md:mx-0`}>
                    <div className="mb-3 md:mb-8">
                        <span className="text-[10px] md:text-xs font-semibold tracking-widest text-[#7ea8be] uppercase">
                            {t.globe.tag}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold mt-1 leading-tight text-[#f6f0ed]" dangerouslySetInnerHTML={{ __html: t.globe.title }}>
                        </h2>
                    </div>

                    <div id="dynamic-content" className="prose prose-invert max-w-md">
                        <h3
                            ref={titleRef}
                            id="country-name"
                            className="text-xl md:text-3xl font-semibold mb-4 md:mb-8 min-h-[1.75rem] md:min-h-[2.5rem] text-[#c2948a]"
                        >
                            {t.globe.subtitle}
                        </h3>
                        <p
                            ref={descRef}
                            id="country-desc"
                            className="text-sm md:text-lg leading-relaxed min-h-[90px] md:min-h-[160px] text-[#f6f0ed]/80 text-justify"
                        >
                            {t.globe.description}
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
