'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sportsCategories } from '@/data/sportsData'

gsap.registerPlugin(ScrollTrigger)

export default function SportsCategories() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const titleOverlayRef = useRef<HTMLDivElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
    const lineRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title block reveal animation (same style as About section)
            if (titleRef.current && titleOverlayRef.current) {
                gsap.set(titleRef.current, { opacity: 0 })

                const titleTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: 'top 80%',
                    },
                })

                titleTl
                    .fromTo(
                        titleOverlayRef.current,
                        { x: '-100%' },
                        { x: '100%', duration: 1.2, ease: 'power2.inOut' }
                    )
                    .set(titleRef.current, { opacity: 1 }, 0.6)
            }

            // Subtitle fade-in
            if (subtitleRef.current) {
                gsap.fromTo(subtitleRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: subtitleRef.current,
                            start: 'top 85%',
                        }
                    }
                )
            }

            // Decorative line animation
            if (lineRef.current) {
                gsap.fromTo(lineRef.current,
                    { scaleX: 0 },
                    {
                        scaleX: 1,
                        duration: 1.2,
                        ease: 'power3.inOut',
                        scrollTrigger: {
                            trigger: lineRef.current,
                            start: 'top 85%',
                        }
                    }
                )
            }

            // Cards stagger reveal with parallax
            cardsRef.current.forEach((card, index) => {
                if (!card) return

                const image = card.querySelector('.sport-card-image') as HTMLElement
                const overlay = card.querySelector('.sport-card-overlay') as HTMLElement
                const content = card.querySelector('.sport-card-content') as HTMLElement

                // Card slide up + fade in
                gsap.fromTo(card,
                    { opacity: 0, y: 100 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 90%',
                        },
                        delay: (index % 3) * 0.15,
                    }
                )

                // Parallax on the background image
                if (image) {
                    gsap.fromTo(image,
                        { y: '-15%' },
                        {
                            y: '15%',
                            ease: 'none',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: 1,
                            }
                        }
                    )
                }

                // Content reveal
                if (content) {
                    gsap.fromTo(content,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: card,
                                start: 'top 80%',
                            },
                            delay: 0.3 + (index % 3) * 0.15,
                        }
                    )
                }
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen py-20 md:py-32 px-4 sm:px-6 md:px-16 overflow-hidden"
            id="sports-categories"
        >
            {/* Background subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto mb-12 md:mb-20">
                {/* Decorative line */}
                <div
                    ref={lineRef}
                    className="w-24 h-[3px] bg-gradient-to-r from-purple-600 to-purple-400 mb-10 origin-left"
                    style={{ transform: 'scaleX(0)' }}
                />

                {/* Title with block reveal */}
                <div className="relative overflow-hidden inline-block">
                    <h2
                        ref={titleRef}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white uppercase tracking-tight leading-none"
                        style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                    >
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Sports</span>
                    </h2>
                    <div
                        ref={titleOverlayRef}
                        className="absolute inset-0 bg-purple-600 z-30"
                        style={{ transform: 'translateX(-100%)' }}
                    />
                </div>

                {/* Subtitle */}
                <p
                    ref={subtitleRef}
                    className="text-lg md:text-xl text-gray-400 mt-6 max-w-lg font-light tracking-wide"
                    style={{ fontFamily: 'var(--font-barlow)', opacity: 0 }}
                >
                    Dive into the world of motorsport. Choose your discipline and get immersed.
                </p>
            </div>

            {/* Cards Grid — Magazine layout */}
            <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sportsCategories.map((sport, index) => {
                    // First two cards span full width on tablet
                    const isFeature = index < 2
                    return (
                        <Link
                            key={sport.name}
                            href={sport.path}
                            ref={(el) => { cardsRef.current[index] = el }}
                            className={`group relative overflow-hidden rounded-2xl cursor-pointer
                                ${isFeature ? 'md:col-span-1 lg:col-span-1' : ''}
                                ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}
                            `}
                            style={{
                                height: index === 0 ? 'clamp(400px, 50vh, 700px)' : 'clamp(280px, 35vh, 450px)',
                                opacity: 0,
                            }}
                        >
                            {/* Background image with parallax */}
                            <div className="sport-card-image absolute inset-[-30%] w-[160%] h-[160%]">
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                    style={{ backgroundImage: `url(${sport.image})` }}
                                />
                            </div>

                            {/* Gradient overlay */}
                            <div className="sport-card-overlay absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-700 group-hover:from-black/70 group-hover:via-black/20" />

                            {/* Purple glow on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-purple-900/30 via-transparent to-transparent" />

                            {/* Border glow on hover */}
                            <div className="absolute inset-0 rounded-2xl border border-white/5 group-hover:border-purple-500/30 transition-all duration-700" />

                            {/* Content */}
                            <div className="sport-card-content absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col gap-3" style={{ opacity: 0 }}>
                                {/* Index number */}
                                <span
                                    className="text-xs font-mono tracking-[0.4em] text-purple-400/60 group-hover:text-purple-400 transition-colors duration-500"
                                >
                                    0{index + 1}
                                </span>

                                {/* Sport name */}
                                <h3
                                    className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide text-white leading-none group-hover:translate-x-2 transition-transform duration-700"
                                    style={{
                                        fontFamily: 'var(--font-outfit)',
                                        transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                                    }}
                                >
                                    {sport.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-400 font-light tracking-wider uppercase group-hover:text-gray-300 transition-colors duration-500"
                                    style={{ fontFamily: 'var(--font-barlow)' }}
                                >
                                    {sport.description}
                                </p>

                                {/* Animated underline */}
                                <div className="h-[2px] w-full relative overflow-hidden mt-2">
                                    <div className="absolute inset-0 bg-white/5" />
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-purple-400 w-0 group-hover:w-full transition-all duration-700"
                                        style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                    />
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500 mt-1">
                                    <span className="text-xs text-purple-400 tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        Explore
                                    </span>
                                    <svg
                                        className="w-4 h-4 text-purple-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={1.5}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
