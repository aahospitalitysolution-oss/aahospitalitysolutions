"use client";

import React, { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import Link from "next/link";
import { useAnimationContext } from "@/contexts/AnimationContext";
import { useMenuContext } from "@/contexts/MenuContext";
import { usePageTransition } from "@/hooks/usePageTransition";
import { MenuButton } from "@/components/MenuButton/MenuButton";
import { AdaptiveItem } from "@/components/AdaptiveItem";
import { LanguageToggle } from "@/components/LanguageToggle";
import BlogCard from "@/components/blog/BlogCard";
import type { BlogPost } from "@/lib/blog";

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { loaderComplete, shouldPlayLoader, boxRef, blueRef, stageRef } =
    useAnimationContext();
  const { isMenuOpen } = useMenuContext();
  const logoTargetRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Page transition (plays after loader completes or immediately if loader was skipped)
  usePageTransition({
    shouldPlay: !shouldPlayLoader || loaderComplete,
    stageRef,
    boxRef,
    blueRef,
    logoTargetRef,
  });

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Reveal
      const heroTl = gsap.timeline();
      heroTl
        .to(".hero-anim", {
          y: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out",
        })
        .to(".hero-anim", { opacity: 1 }, "<");

      // Cards Fade Up
      gsap.from(".blog-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      });
    }, rootRef);

    return () => ctx.revert();
  }, [loaderComplete, shouldPlayLoader]); // Re-run if loader state changes to ensure correct timing

  return (
    <div
      ref={rootRef}
      className="min-h-screen text-[#f6f0ed] relative z-20"
      style={{ backgroundColor: "#09121a", color: "#f6f0ed" }}
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
            transition: `opacity 0.3s ease, visibility 0s linear ${
              isMenuOpen ? "0.3s" : "0s"
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
          <AdaptiveItem lightColor="var(--parchment)" darkColor="#f6f0ed">
            <LanguageToggle className="reveal" />
          </AdaptiveItem>
          <AdaptiveItem lightColor="var(--parchment)" darkColor="#f6f0ed">
            <MenuButton className="reveal" />
          </AdaptiveItem>
        </div>
        <div className="nav-divider" aria-hidden="true" />
      </nav>

      <div className="pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <div className="overflow-hidden mb-4">
            <span className="block text-[#c2948a] text-sm font-semibold tracking-[0.2em] uppercase hero-anim translate-y-full opacity-0">
              Thought Leadership
            </span>
          </div>
          <div className="overflow-hidden mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f6f0ed] hero-anim translate-y-full opacity-0">
              Insights & <span className="text-[#7ea8be]">Advisory</span>
            </h1>
          </div>
          <div className="overflow-hidden">
            <p className="max-w-2xl mx-auto text-lg text-[#f6f0ed]/70 leading-relaxed hero-anim translate-y-full opacity-0">
              Navigating the complexities of modern hospitality with data-driven
              strategies and owner-centric expertise.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.slug} className="blog-card">
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
