'use client'
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

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
    const hasAnimatedRef = useRef(false);

    useEffect(() => {
        if (disableArrivalAnimation) {
            return;
        }

        if (startAnimation && !hasAnimatedRef.current && backgroundRef.current && titleRef.current && overlayRef.current && arrowRef.current && sectionRef.current) {
            hasAnimatedRef.current = true;

            // Séquence d'animation complète
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
        }
    }, [startAnimation, disableArrivalAnimation]);

    return (
        <section ref={sectionRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Top racing stripe */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-700 to-transparent z-50" />

            {/* Background Image */}
            <div ref={backgroundRef} className="absolute inset-0">
                <Image
                    src="/img/piste.png"
                    alt="Race Track Background"
                    fill
                    priority
                    quality={90}
                    sizes="100vw"
                    className="object-cover"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-20">
                <div className="relative overflow-hidden">
                    <h1
                        ref={titleRef}
                        className="text-white text-[120px] md:text-[180px] font-normal tracking-wide leading-none drop-shadow-xl select-none"
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
                    id="hero-line"
                    className="w-32 md:w-48 h-[3px] bg-purple-700 mt-6 origin-center"
                    style={{ transform: 'scaleX(0)' }}
                />
            </div>

            {/* Scroll Indicator */}
            <div ref={arrowRef} className="absolute bottom-10 z-10" style={{ opacity: disableArrivalAnimation ? 1 : 0 }}>
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center animate-bounce">
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
