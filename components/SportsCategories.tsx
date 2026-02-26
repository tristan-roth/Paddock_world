'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sportsCategories } from '@/data/sportsData'

gsap.registerPlugin(ScrollTrigger)

// Each card has a unique scattered position (Y offset, rotation, size) for the "disordered" look
const scatteredConfigs = [
    { yOffset: -30, rotate: -2.5, width: 400, height: 480, },
    { yOffset: 40, rotate: 1.8, width: 360, height: 420, },
    { yOffset: -20, rotate: -1, width: 380, height: 470, },
    { yOffset: 50, rotate: 2.2, width: 350, height: 440, },
    { yOffset: -35, rotate: -1.5, width: 420, height: 460, },
    { yOffset: 30, rotate: 1.2, width: 370, height: 450, },
]

export default function SportsCategories() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const pinRef = useRef<HTMLDivElement>(null)
    const trackRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const titleOverlayRef = useRef<HTMLDivElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const lineRef = useRef<HTMLDivElement>(null)
    const cardsRef = useRef<(HTMLAnchorElement | null)[]>([])
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const mouseRef = useRef({ x: 0, y: 0 })
    const rafRef = useRef<number>(0)

    // Mouse tracking
    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY }
    }, [])

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [handleMouseMove])

    // Mouse-reactive parallax loop
    useEffect(() => {
        const tick = () => {
            cardsRef.current.forEach((card, index) => {
                if (!card) return
                const rect = card.getBoundingClientRect()
                const cx = rect.left + rect.width / 2
                const cy = rect.top + rect.height / 2
                const dx = (mouseRef.current.x - cx) / 50
                const dy = (mouseRef.current.y - cy) / 50
                const isHovered = hoveredIndex === index
                const config = scatteredConfigs[index % scatteredConfigs.length]

                // Card subtle mouse follow
                gsap.to(card, {
                    y: config.yOffset + dy * (isHovered ? 2 : 0.6),
                    rotation: config.rotate + dx * 0.08,
                    scale: isHovered ? 1.05 : 1,
                    duration: 1,
                    ease: 'power3.out',
                    overwrite: 'auto',
                })

                // Inner image parallax (opposite direction)
                const img = card.querySelector('.sport-img') as HTMLElement
                if (img) {
                    gsap.to(img, {
                        x: -dx * (isHovered ? 3 : 1),
                        y: -dy * (isHovered ? 3 : 1),
                        scale: isHovered ? 1.12 : 1.05,
                        duration: 1.2,
                        ease: 'power3.out',
                        overwrite: 'auto',
                    })
                }
            })
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [hoveredIndex])

    // GSAP: horizontal scroll + reveals
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title block reveal
            if (titleRef.current && titleOverlayRef.current) {
                gsap.set(titleRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: titleRef.current, start: 'top 80%' },
                })
                tl.fromTo(titleOverlayRef.current,
                    { x: '-100%' },
                    { x: '100%', duration: 1.2, ease: 'power2.inOut' }
                ).set(titleRef.current, { opacity: 1 }, 0.6)
            }

            // Subtitle fade
            if (subtitleRef.current) {
                gsap.fromTo(subtitleRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: subtitleRef.current, start: 'top 85%' } }
                )
            }

            // Decorative line
            if (lineRef.current) {
                gsap.fromTo(lineRef.current,
                    { scaleX: 0 },
                    { scaleX: 1, duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: lineRef.current, start: 'top 85%' } }
                )
            }

            // Two-phase seamless horizontal scroll using DIFFERENT CSS properties
            // Phase 1: animates `left` (no pin) — cards start sliding before pin
            // Phase 2: animates `x` (with pin) — continues seamlessly
            // Since left + translateX stack in CSS, there's zero pause
            if (pinRef.current && trackRef.current) {
                // Phase 1: Slide track from left:65vw to left:30vw as pinRef enters viewport
                // Starts early ('top bottom') so cards are visible when title is on screen
                gsap.to(trackRef.current, {
                    left: '30vw',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: pinRef.current,
                        scrub: 1,
                        start: 'top bottom',
                        end: 'top top',
                    },
                })

                // Phase 2: Pin + continue horizontal scroll via `x` property
                // At pin start: track is at left:30vw, x:0
                // Need to move x so last card's right edge = viewport right edge
                // Last card right = 30vw + x + scrollWidth = 100vw
                // x = 100vw - 30vw - scrollWidth = 0.70*W - scrollWidth
                const getPinnedDistance = () =>
                    trackRef.current!.scrollWidth - window.innerWidth * 0.70

                gsap.to(trackRef.current, {
                    x: () => -getPinnedDistance(),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: pinRef.current,
                        pin: true,
                        scrub: 1,
                        start: 'top top',
                        end: () => `+=${getPinnedDistance()}`,
                        invalidateOnRefresh: true,
                    },
                })

                // Cards fade in as they enter viewport during horizontal scroll
                cardsRef.current.forEach((card, index) => {
                    if (!card) return
                    gsap.fromTo(card,
                        { opacity: 0, scale: 0.85, rotation: (Math.random() - 0.5) * 10 },
                        {
                            opacity: 1,
                            scale: 1,
                            rotation: scatteredConfigs[index % scatteredConfigs.length].rotate,
                            duration: 1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: card,
                                containerAnimation: undefined, // uses main scroll
                                start: 'top 95%',
                            },
                            delay: index * 0.1,
                        }
                    )
                })
            }
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden"
            id="sports-categories"
        >
            {/* Header — scrolls normally before the pin */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-16 pt-24 md:pt-40 pb-16 md:pb-24">
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/8 rounded-full blur-[150px] pointer-events-none" />

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
                        className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tight leading-none"
                        style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                    >
                        Explore{' '}
                        <span
                            className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            Sports
                        </span>
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

            {/* Pinned horizontal scroll zone */}
            <div ref={pinRef} className="relative h-screen">
                {/* Ambient background effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-purple-900/6 rounded-full blur-[180px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-800/4 rounded-full blur-[120px]" />
                </div>

                {/* Horizontal track — starts off-screen right, slides left */}
                <div
                    ref={trackRef}
                    className="absolute top-0 h-full flex items-center gap-10 md:gap-16"
                    style={{ left: '65vw', paddingLeft: '5vw' }}
                >
                    {sportsCategories.map((sport, index) => {
                        const config = scatteredConfigs[index % scatteredConfigs.length]
                        const isHovered = hoveredIndex === index

                        return (
                            <Link
                                key={sport.name}
                                href={sport.path}
                                ref={(el) => { cardsRef.current[index] = el }}
                                className="group relative block shrink-0"
                                style={{
                                    width: `clamp(280px, ${config.width}px, 85vw)`,
                                    height: `clamp(340px, ${config.height}px, 65vh)`,
                                    transform: `translateY(${config.yOffset}px) rotate(${config.rotate}deg)`,
                                    opacity: 0,
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Card */}
                                <div
                                    className={`relative w-full h-full overflow-hidden rounded-2xl transition-shadow duration-700
                                        ${isHovered
                                            ? 'shadow-[0_25px_80px_-15px_rgba(147,51,234,0.35)]'
                                            : 'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]'
                                        }`}
                                >
                                    {/* Background image with parallax */}
                                    <div className="sport-img absolute inset-[-15%] w-[130%] h-[130%]">
                                        <div
                                            className="w-full h-full bg-cover bg-center transition-transform duration-[1.5s] ease-out"
                                            style={{ backgroundImage: `url(${sport.image})` }}
                                        />
                                    </div>

                                    {/* Dark overlay — lighter on hover */}
                                    <div className={`absolute inset-0 transition-all duration-700
                                        ${isHovered
                                            ? 'bg-gradient-to-t from-black/50 via-black/10 to-transparent'
                                            : 'bg-gradient-to-t from-black/85 via-black/40 to-black/10'
                                        }`}
                                    />

                                    {/* Purple glow on hover */}
                                    <div className={`absolute inset-0 transition-opacity duration-700
                                        ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/25 via-transparent to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                                    </div>

                                    {/* Border */}
                                    <div className={`absolute inset-0 rounded-2xl border transition-all duration-500
                                        ${isHovered ? 'border-purple-500/40' : 'border-white/5'}`}
                                    />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                        {/* Index */}
                                        <span className={`text-xs font-mono tracking-[0.4em] transition-colors duration-500 block mb-3
                                            ${isHovered ? 'text-purple-400' : 'text-purple-400/40'}`}
                                        >
                                            0{index + 1}
                                        </span>

                                        {/* Sport name */}
                                        <h3
                                            className={`text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-white leading-none transition-all duration-700 mb-2
                                                ${isHovered ? 'translate-x-2' : ''}`}
                                            style={{
                                                fontFamily: 'var(--font-outfit)',
                                                transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
                                            }}
                                        >
                                            {sport.name}
                                        </h3>

                                        {/* Description */}
                                        <p className={`text-sm tracking-wider uppercase font-light transition-all duration-500
                                            ${isHovered ? 'text-gray-300 translate-x-1' : 'text-gray-500'}`}
                                            style={{ fontFamily: 'var(--font-barlow)' }}
                                        >
                                            {sport.description}
                                        </p>

                                        {/* Animated underline */}
                                        <div className="h-[2px] w-full relative overflow-hidden mt-4">
                                            <div className="absolute inset-0 bg-white/5" />
                                            <div
                                                className={`absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700
                                                    ${isHovered ? 'w-full' : 'w-0'}`}
                                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                            />
                                        </div>

                                        {/* CTA Arrow */}
                                        <div className={`flex items-center gap-2 mt-3 transition-all duration-500
                                            ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}
                                        >
                                            <span className="text-xs text-purple-400 tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                Explore
                                            </span>
                                            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
