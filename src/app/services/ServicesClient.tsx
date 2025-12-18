"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Building2,
  Settings,
  ArrowRight,
  TrendingUp,
  Users,
  Gem,
  FileCheck,
  Compass,
  Search,
  Award,
  Coffee,
  PenTool,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import styles from "./Services.module.css";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { useMenuContext } from "@/contexts/MenuContext";
import { usePageTransition } from "@/hooks/usePageTransition";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { AdaptiveItem } from "@/components/AdaptiveItem";
import { LanguageToggle } from "@/components/LanguageToggle";
import SmartButton from "@/components/SmartButton";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ServicesClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const { loaderComplete, shouldPlayLoader, boxRef, blueRef, stageRef } =
    useAnimationContext();
  const { isMenuOpen } = useMenuContext();
  const logoTargetRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [activeDetail, setActiveDetail] = useState<"owner" | "operator" | null>(
    null
  );
  const lenisRef = useRef<Lenis | null>(null);

  // Page transition (plays after loader completes or immediately if loader was skipped)
  usePageTransition({
    shouldPlay: !shouldPlayLoader || loaderComplete,
    stageRef,
    boxRef,
    blueRef,
    logoTargetRef,
  });

  // Handle scroll locking when modal is open
  useEffect(() => {
    if (activeDetail) {
      lenisRef.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenisRef.current?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeDetail]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Handle initial hash scroll
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        // Small delay to ensure layout and Lenis are ready
        setTimeout(() => {
          lenis.scrollTo(target as HTMLElement, { offset: -100 });
        }, 500);
      }
    } else {
      // Force scroll to top if no hash
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    }

    // Context for animations to ensure cleanup
    const ctx = gsap.context(() => {
      // 1. Hero Reveal
      const heroTl = gsap.timeline();
      heroTl
        .to(".hero-anim", {
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
        })
        .to(".hero-anim", { opacity: 1 }, "<");

      // Branch Line Expansion Animation
      gsap.to(".branch-line-left", {
        scrollTrigger: {
          trigger: "#pathways",
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        },
        scaleX: 1,
        ease: "none",
      });

      gsap.to(".branch-line-right", {
        scrollTrigger: {
          trigger: "#pathways",
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        },
        scaleX: 1,
        ease: "none",
      });

      // Cards Fade Up
      gsap.from(".branch-card", {
        scrollTrigger: {
          trigger: "#pathways",
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Ancillary Cards Stagger
      gsap.from(".ancillary-card", {
        scrollTrigger: {
          trigger: "#ancillary",
          start: "top 75%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      });
    }, rootRef);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="antialiased selection:bg-[var(--khaki-beige)] selection:text-[var(--parchment)] bg-[var(--parchment)] text-[var(--charcoal-blue)] min-h-screen"
    >
      {/* Sticky Navbar */}
      <nav
        ref={navRef}
        className="site-nav"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="logo-link-wrapper"
          style={{
            pointerEvents: isMenuOpen ? "none" : "auto",
            visibility: isMenuOpen ? "hidden" : "visible",
            opacity: isMenuOpen ? 0 : 1,
            transition: `opacity 0.3s ease, visibility 0s linear ${isMenuOpen ? "0.3s" : "0s"
              }`,
          }}
          aria-label="Home"
        >
          <div
            className="logo-slot"
            ref={logoTargetRef}
            role="img"
            aria-label="A&A Hospitality logo animation"
          />
        </Link>
        <div
          className="nav-items"
          style={{ display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <AdaptiveItem
            lightColor="var(--parchment)"
            darkColor="var(--charcoal-blue)"
          >
            <LanguageToggle className="reveal" />
          </AdaptiveItem>
          <AdaptiveItem
            lightColor="var(--parchment)"
            darkColor="var(--charcoal-blue)"
          >
            <MenuButton className="reveal" />
          </AdaptiveItem>
        </div>
        <div className="nav-divider" aria-hidden="true" />
      </nav>

      {/* Main Container */}
      <main className="relative w-full">
        {/* TREE SVG LAYER */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible hidden md:block"
          id="tree-svg"
        >
          <path id="main-stem" className={styles.treeLine} d="" />
          <path id="branch-left" className={styles.treeLine} d="" />
          <path id="branch-right" className={styles.treeLine} d="" />
          <path id="stem-left" className={styles.treeLine} d="" />
          <path id="stem-right" className={styles.treeLine} d="" />
        </svg>

        {/* HERO SECTION */}
        <section
          className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative z-10 pt-20"
          id="hero"
        >
          <div className="overflow-hidden mb-4">
            <h2 className="text-[var(--khaki-beige)] uppercase tracking-[0.2em] text-sm font-semibold hero-anim translate-y-full opacity-0">
              {t.servicesPage.hero.tag}
            </h2>
          </div>
          <div className="overflow-hidden">
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-serif text-[var(--charcoal-blue)] mb-6 leading-tight hero-anim translate-y-full opacity-0"
              dangerouslySetInnerHTML={{ __html: t.servicesPage.hero.title }}
            />
          </div>
          <div className="max-w-2xl mx-auto overflow-hidden">
            <p className="text-lg md:text-xl text-[var(--charcoal-blue)]/80 font-light hero-anim translate-y-full opacity-0 leading-relaxed">
              {t.servicesPage.hero.description}
            </p>
          </div>
          <div className="mt-12 hero-anim opacity-0">
            <div className="w-[1px] h-24 bg-[var(--khaki-beige)]/50 mx-auto"></div>
          </div>
        </section>

        {/* THE FORK (Path Selection) */}
        <section className="py-20 px-4 md:px-12 relative z-10" id="pathways">
          {/* Central connection point marker */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 bg-[var(--khaki-beige)] rounded-full z-20 hidden md:block shadow-[0_0_20px_rgba(187,177,147,0.6)]"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 max-w-7xl mx-auto">
            {/* Owner Branch */}
            <div className="relative group branch-card" id="branch-owner">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-1/2 w-full md:w-1/2 h-[2px] bg-[var(--khaki-beige)]/30 hidden md:block origin-left scale-x-0 branch-line-left"></div>

              <div
                className={`bg-[var(--parchment)] p-10 md:p-14 shadow-lg border border-[var(--charcoal-blue)]/10 transition-all duration-500 hover:shadow-2xl h-full flex flex-col justify-between ${styles.cardHover}`}
              >
                <div>
                  <div className="mb-6 text-[var(--khaki-beige)]">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-serif text-[var(--charcoal-blue)] mb-4">
                    {t.servicesPage.cards.owner.title}
                  </h3>
                  <h4 className="text-sm uppercase tracking-widest text-[var(--charcoal-blue)]/50 mb-6">
                    {t.servicesPage.cards.owner.subtitle}
                  </h4>
                  <p className="text-[var(--charcoal-blue)]/70 mb-8 leading-relaxed">
                    {t.servicesPage.cards.owner.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <SmartButton
                    text={t.servicesPage.cards.owner.button}
                    alignment="left"
                    size="small"
                    onClick={() => setActiveDetail("owner")}
                  />
                </div>
              </div>
            </div>

            {/* Operator Branch */}
            <div className="relative group branch-card" id="branch-operator">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:right-auto md:left-0 md:-translate-x-1/2 w-full md:w-1/2 h-[2px] bg-[var(--khaki-beige)]/30 hidden md:block origin-right scale-x-0 branch-line-right"></div>

              <div
                className={`bg-[var(--charcoal-blue)] p-10 md:p-14 shadow-lg border border-[var(--parchment)]/20 text-[var(--parchment)] transition-all duration-500 hover:shadow-2xl h-full flex flex-col justify-between ${styles.cardHover}`}
              >
                <div>
                  <div className="mb-6 text-[var(--khaki-beige)]">
                    <Settings className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-serif mb-4">
                    {t.servicesPage.cards.operator.title}
                  </h3>
                  <h4 className="text-sm uppercase tracking-widest text-[var(--parchment)]/50 mb-6">
                    {t.servicesPage.cards.operator.subtitle}
                  </h4>
                  <p className="text-[var(--parchment)]/80 mb-8 leading-relaxed">
                    {t.servicesPage.cards.operator.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <SmartButton
                    text={t.servicesPage.cards.operator.button}
                    alignment="left"
                    theme="dark"
                    size="small"
                    onClick={() => setActiveDetail("operator")}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ANCILLARY SERVICES */}
        <section
          id="ancillary"
          className="py-32 px-4 bg-[var(--parchment)] relative z-10"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <span className="text-[var(--khaki-beige)] uppercase tracking-[0.2em] text-sm font-semibold">
                {t.servicesPage.ancillary.tag}
              </span>
              <h2 className="text-5xl font-serif text-[var(--charcoal-blue)] mt-4">
                {t.servicesPage.ancillary.title}
              </h2>
              <p className="text-[var(--charcoal-blue)]/70 mt-6 max-w-2xl mx-auto">
                {t.servicesPage.ancillary.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Ancillary Card 1 */}
              <div className="bg-[var(--parchment)] p-8 border border-[var(--charcoal-blue)]/5 hover:border-[var(--khaki-beige)]/50 transition-colors duration-300 shadow-sm ancillary-card">
                <div className="w-12 h-12 bg-[var(--parchment)] rounded-full flex items-center justify-center mb-6 text-[var(--khaki-beige)] border border-[var(--khaki-beige)]/20">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[var(--charcoal-blue)] mb-2">
                  {t.servicesPage.ancillary.items[0].title}
                </h3>
                <p className="text-sm text-[var(--charcoal-blue)]/70">
                  {t.servicesPage.ancillary.items[0].desc}
                </p>
              </div>

              {/* Ancillary Card 2 */}
              <div className="bg-[var(--parchment)] p-8 border border-[var(--charcoal-blue)]/5 hover:border-[var(--khaki-beige)]/50 transition-colors duration-300 shadow-sm ancillary-card">
                <div className="w-12 h-12 bg-[var(--parchment)] rounded-full flex items-center justify-center mb-6 text-[var(--khaki-beige)] border border-[var(--khaki-beige)]/20">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[var(--charcoal-blue)] mb-2">
                  {t.servicesPage.ancillary.items[1].title}
                </h3>
                <p className="text-sm text-[var(--charcoal-blue)]/70">
                  {t.servicesPage.ancillary.items[1].desc}
                </p>
              </div>

              {/* Ancillary Card 3 */}
              <div className="bg-[var(--parchment)] p-8 border border-[var(--charcoal-blue)]/5 hover:border-[var(--khaki-beige)]/50 transition-colors duration-300 shadow-sm ancillary-card">
                <div className="w-12 h-12 bg-[var(--parchment)] rounded-full flex items-center justify-center mb-6 text-[var(--khaki-beige)] border border-[var(--khaki-beige)]/20">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[var(--charcoal-blue)] mb-2">
                  {t.servicesPage.ancillary.items[2].title}
                </h3>
                <p className="text-sm text-[var(--charcoal-blue)]/70">
                  {t.servicesPage.ancillary.items[2].desc}
                </p>
              </div>

              {/* Ancillary Card 4 */}
              <div className="bg-[var(--parchment)] p-8 border border-[var(--charcoal-blue)]/5 hover:border-[var(--khaki-beige)]/50 transition-colors duration-300 shadow-sm ancillary-card">
                <div className="w-12 h-12 bg-[var(--parchment)] rounded-full flex items-center justify-center mb-6 text-[var(--khaki-beige)] border border-[var(--khaki-beige)]/20">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[var(--charcoal-blue)] mb-2">
                  {t.servicesPage.ancillary.items[3].title}
                </h3>
                <p className="text-sm text-[var(--charcoal-blue)]/70">
                  {t.servicesPage.ancillary.items[3].desc}
                </p>
              </div>

              {/* Ancillary Card 5 */}
              <div className="bg-[var(--parchment)] p-8 border border-[var(--charcoal-blue)]/5 hover:border-[var(--khaki-beige)]/50 transition-colors duration-300 shadow-sm ancillary-card">
                <div className="w-12 h-12 bg-[var(--parchment)] rounded-full flex items-center justify-center mb-6 text-[var(--khaki-beige)] border border-[var(--khaki-beige)]/20">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[var(--charcoal-blue)] mb-2">
                  {t.servicesPage.ancillary.items[4].title}
                </h3>
                <p className="text-sm text-[var(--charcoal-blue)]/70">
                  {t.servicesPage.ancillary.items[4].desc}
                </p>
              </div>

              {/* Ancillary Card 6 */}
              <div className="bg-[var(--parchment)] p-8 border border-[var(--charcoal-blue)]/5 hover:border-[var(--khaki-beige)]/50 transition-colors duration-300 shadow-sm ancillary-card">
                <div className="w-12 h-12 bg-[var(--parchment)] rounded-full flex items-center justify-center mb-6 text-[var(--khaki-beige)] border border-[var(--khaki-beige)]/20">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-[var(--charcoal-blue)] mb-2">
                  {t.servicesPage.ancillary.items[5].title}
                </h3>
                <p className="text-sm text-[var(--charcoal-blue)]/70">
                  {t.servicesPage.ancillary.items[5].desc}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER / CTA */}
        <section
          id="contact"
          className="bg-[var(--charcoal-blue)] text-[var(--parchment)] py-24 px-4 border-t border-[var(--parchment)]/10 relative z-10"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-8">
              {t.servicesPage.cta.title}
            </h2>
            <p className="text-[var(--parchment)]/60 mb-12 text-lg">
              {t.servicesPage.cta.subtitle}
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              <SmartButton
                text={t.servicesPage.cta.schedule}
                backgroundColor="var(--khaki-beige)"
                theme="light"
                onClick={() => router.push("/#contact")}
              />
            </div>
          </div>
        </section>

        {/* MODALS */}
        {activeDetail === "owner" && (
          <OwnerModal onClose={() => setActiveDetail(null)} />
        )}
        {activeDetail === "operator" && (
          <OperatorModal onClose={() => setActiveDetail(null)} />
        )}
      </main>
    </div>
  );
}

function OwnerModal({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".modal-anim", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    onClose();
    setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-[var(--parchment)] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 overscroll-contain"
      data-lenis-prevent
      style={{ touchAction: "pan-y" }}
    >
      <button
        onClick={onClose}
        className="fixed top-8 right-8 z-[310] p-2 bg-[var(--charcoal-blue)] text-[var(--parchment)] rounded-full hover:bg-[var(--khaki-beige)] transition-colors shadow-lg cursor-pointer"
        aria-label="Close details"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="min-h-screen py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 md:w-2/3 modal-anim">
            <h2
              className="text-5xl md:text-6xl font-serif text-[var(--charcoal-blue)] mb-6"
              dangerouslySetInnerHTML={{
                __html: t.servicesPage.modals.owner.title,
              }}
            />
            <p className="text-xl text-[var(--charcoal-blue)]/70 font-light">
              {t.servicesPage.modals.owner.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {/* Item 1 */}
            <div className="group modal-anim">
              <div className="border-t border-[var(--khaki-beige)]/30 pt-8">
                <span className="text-5xl font-serif text-[var(--charcoal-blue)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  01
                </span>
                <h3 className="text-2xl font-serif mb-4 flex items-center text-[var(--charcoal-blue)]">
                  <TrendingUp className="w-6 h-6 mr-3 text-[var(--khaki-beige)]" />{" "}
                  {t.servicesPage.modals.owner.items[0].title}
                </h3>
                <p className="text-[var(--charcoal-blue)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.owner.items[0].desc}
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group md:translate-y-12 modal-anim">
              <div className="border-t border-[var(--khaki-beige)]/30 pt-8">
                <span className="text-5xl font-serif text-[var(--charcoal-blue)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  02
                </span>
                <h3 className="text-2xl font-serif mb-4 flex items-center text-[var(--charcoal-blue)]">
                  <Users className="w-6 h-6 mr-3 text-[var(--khaki-beige)]" />{" "}
                  {t.servicesPage.modals.owner.items[1].title}
                </h3>
                <p className="text-[var(--charcoal-blue)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.owner.items[1].desc}
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group modal-anim">
              <div className="border-t border-[var(--khaki-beige)]/30 pt-8">
                <span className="text-5xl font-serif text-[var(--charcoal-blue)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  03
                </span>
                <h3 className="text-2xl font-serif mb-4 flex items-center text-[var(--charcoal-blue)]">
                  <Gem className="w-6 h-6 mr-3 text-[var(--khaki-beige)]" />{" "}
                  {t.servicesPage.modals.owner.items[2].title}
                </h3>
                <p className="text-[var(--charcoal-blue)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.owner.items[2].desc}
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="group md:translate-y-12 modal-anim">
              <div className="border-t border-[var(--khaki-beige)]/30 pt-8">
                <span className="text-5xl font-serif text-[var(--charcoal-blue)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  04
                </span>
                <h3 className="text-2xl font-serif mb-4 flex items-center text-[var(--charcoal-blue)]">
                  <FileCheck className="w-6 h-6 mr-3 text-[var(--khaki-beige)]" />{" "}
                  {t.servicesPage.modals.owner.items[3].title}
                </h3>
                <p className="text-[var(--charcoal-blue)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.owner.items[3].desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center modal-anim">
            <SmartButton
              text={t.servicesPage.modals.owner.button}
              alignment="center"
              theme="light"
              onClick={scrollToContact}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OperatorModal({ onClose }: { onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".modal-anim", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    onClose();
    setTimeout(() => {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[300] bg-[var(--charcoal-blue)] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 text-[var(--parchment)] overscroll-contain"
      data-lenis-prevent
      style={{ touchAction: "pan-y" }}
    >
      <button
        onClick={onClose}
        className="fixed top-8 right-8 z-[310] p-2 bg-[var(--parchment)] text-[var(--charcoal-blue)] rounded-full hover:bg-[var(--khaki-beige)] transition-colors shadow-lg cursor-pointer"
        aria-label="Close details"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="min-h-screen py-32 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 md:w-2/3 ml-auto text-right modal-anim">
            <h2
              className="text-5xl md:text-6xl font-serif mb-6"
              dangerouslySetInnerHTML={{
                __html: t.servicesPage.modals.operator.title,
              }}
            />
            <p className="text-xl text-[var(--parchment)]/70 font-light">
              {t.servicesPage.modals.operator.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {/* Item 1 */}
            <div className="group modal-anim">
              <div className="border-t border-[var(--parchment)]/20 pt-8">
                <span className="text-5xl font-serif text-[var(--parchment)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  01
                </span>
                <h3 className="text-2xl font-serif mb-4 text-[var(--khaki-beige)]">
                  {t.servicesPage.modals.operator.items[0].title}
                </h3>
                <p className="text-[var(--parchment)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.operator.items[0].desc}
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group md:translate-y-12 modal-anim">
              <div className="border-t border-[var(--parchment)]/20 pt-8">
                <span className="text-5xl font-serif text-[var(--parchment)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  02
                </span>
                <h3 className="text-2xl font-serif mb-4 text-[var(--khaki-beige)]">
                  {t.servicesPage.modals.operator.items[1].title}
                </h3>
                <p className="text-[var(--parchment)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.operator.items[1].desc}
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group modal-anim">
              <div className="border-t border-[var(--parchment)]/20 pt-8">
                <span className="text-5xl font-serif text-[var(--parchment)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  03
                </span>
                <h3 className="text-2xl font-serif mb-4 text-[var(--khaki-beige)]">
                  {t.servicesPage.modals.operator.items[2].title}
                </h3>
                <p className="text-[var(--parchment)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.operator.items[2].desc}
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="group md:translate-y-12 modal-anim">
              <div className="border-t border-[var(--parchment)]/20 pt-8">
                <span className="text-5xl font-serif text-[var(--parchment)]/20 absolute -mt-20 group-hover:text-[var(--khaki-beige)]/40 transition-colors">
                  04
                </span>
                <h3 className="text-2xl font-serif mb-4 text-[var(--khaki-beige)]">
                  {t.servicesPage.modals.operator.items[3].title}
                </h3>
                <p className="text-[var(--parchment)]/70 leading-relaxed mb-4">
                  {t.servicesPage.modals.operator.items[3].desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-32 text-center modal-anim">
            <SmartButton
              text={t.servicesPage.modals.operator.button}
              alignment="center"
              theme="dark"
              backgroundColor="var(--charcoal-blue)"
              onClick={scrollToContact}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
