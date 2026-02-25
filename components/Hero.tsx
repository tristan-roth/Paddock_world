'use client'
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
    startAnimation: boolean
    disableArrivalAnimation?: boolean
}

export default function Hero({ startAnimation, disableArrivalAnimation = false }: HeroProps) {
    const backgroundRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const arrowRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    // Use gsap.context to properly handle animations and cleanup in React Strict Mode / Fast Refresh
    useEffect(() => {
        if (!backgroundRef.current || !sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Scroll animation for the oval bottom effect
            const bg = backgroundRef.current;
            if (bg) {
                // Start with no clip-path (fully visible)
                bg.style.clipPath = 'none';

                ScrollTrigger.create({
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5,
                    onUpdate: (self) => {
                        const progress = self.progress; // 0 → 1
                        if (progress < 0.01) {
                            bg.style.clipPath = 'none';
                            return;
                        }
                        // Bottom border radius effect using border-radius approach
                        // At progress 0: flat (no curve)
                        // At progress 1: fully oval bottom
                        const curveAmount = Math.round(progress * 50); // 0 to 50%
                        bg.style.clipPath = 'none';
                        bg.style.borderRadius = `0 0 ${curveAmount}% ${curveAmount}% / 0 0 ${Math.round(progress * 30)}% ${Math.round(progress * 30)}%`;
                    },
                });
            }

            // Entry Arrival Animation
            if (!disableArrivalAnimation && startAnimation && titleRef.current && overlayRef.current && arrowRef.current && lineRef.current) {
                const timeline = gsap.timeline();

                // Le texte WELCOME est invisible au début
                gsap.set(titleRef.current, { opacity: 0 });

                timeline
                    // 1. Animation du bloc rouge traverse l'écran → WELCOME apparaît
                    .fromTo(overlayRef.current,
                        { x: '-100%' },
                        { x: '100%', duration: 1.8, ease: "power2.inOut" },
                        "reveal"
                    )
                    .set(titleRef.current, { opacity: 1 }, "reveal+=0.9")
                    // 2. Animation de la ligne rouge
                    .fromTo(lineRef.current,
                        { scaleX: 0 },
                        { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
                        "reveal+=1.1"
                    )
                    // 3. Apparition de la flèche de scroll
                    .fromTo(arrowRef.current,
                        { opacity: 0, y: -15 },
                        { opacity: 1, y: 0, duration: 0.6 },
                        "reveal+=1.8"
                    );
            }
        }, sectionRef);

        return () => ctx.revert(); // Automatically kills ScrollTriggers and reverts timeline animations
    }, [startAnimation, disableArrivalAnimation]);

    return (
        <section ref={sectionRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Top racing stripe */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-700 to-transparent z-50" />

            {/* Background Video */}
            <div ref={backgroundRef} className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                <video
                    src="/video/home.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-20 px-4">
                <div className="relative overflow-hidden">
                    <h1
                        ref={titleRef}
                        className="text-white text-[64px] sm:text-[100px] md:text-[180px] font-normal tracking-wide leading-none drop-shadow-xl select-none"
                        style={{ fontFamily: 'var(--font-shrikhand)', opacity: disableArrivalAnimation ? 1 : 0 }}
                    >
                        WELCOME
                    </h1>
                    {!disableArrivalAnimation && (
                        <div
                            ref={overlayRef}
                            className="absolute inset-0 bg-purple-800 z-10"
                            style={{ transform: 'translateX(-100%)' }}
                        />
                    )}
                </div>

                {/* Red decorative line */}
                <div
                    ref={lineRef}
                    id="hero-line"
                    className="w-32 md:w-48 h-[3px] bg-purple-700 mt-6 origin-center"
                    style={{ transform: 'scaleX(0)' }}
                />
            </div>

            {/* Scroll Indicator */}
            <div ref={arrowRef} className="absolute bottom-10 z-10" style={{ opacity: disableArrivalAnimation ? 1 : 0 }}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-white"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
}
