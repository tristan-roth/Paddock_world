'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/RevealText'
import Navbar from '@/components/Navbar'

gsap.registerPlugin(ScrollTrigger)

const f1Tabs = [
    {
        name: 'THE CHAMPIONSHIP',
        path: '/sports/f1/championship',
        subTabs: [
            { name: 'The Drivers', anchor: 'drivers' },
            { name: 'The Teams', anchor: 'teams' },
            { name: 'The Calendar', anchor: 'calendar' },
            { name: 'The Standings', anchor: 'standings' },
        ],
    },
    {
        name: 'THE UNIVERS',
        path: '/sports/f1/univers',
        subTabs: [
            { name: 'The History', anchor: 'history' },
            { name: 'The Impact', anchor: 'impact' },
            { name: 'The Fans', anchor: 'fans' },
            { name: 'Follow a Race Week', anchor: 'race-week' },
        ],
    },
    {
        name: 'MASTERING F1',
        path: '/sports/f1/mastering',
        subTabs: [
            { name: 'The Rules', anchor: 'rules' },
            { name: 'The Strategy', anchor: 'strategy' },
            { name: 'The Technology', anchor: 'technology' },
            { name: 'The Driving', anchor: 'driving' },
        ],
    },
]

export default function F1Page() {
    const heroRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)
    const tabsRef = useRef<HTMLDivElement>(null)
    const scrollArrowRef = useRef<HTMLDivElement>(null)
    const bgImageRef = useRef<HTMLDivElement>(null)
    const accrocheSectionRef = useRef<HTMLElement>(null)
    const accrocheTextRef = useRef<HTMLDivElement>(null)
    const redLineRef = useRef<HTMLDivElement>(null)

    const [hoveredTab, setHoveredTab] = useState<number | null>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // ── Entry timeline ──
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

            // Title starts invisible
            gsap.set(titleRef.current, { opacity: 0 })

            // 1. Red block sweeps across to reveal FORMULA 1 (same as WELCOME on homepage)
            tl.fromTo(
                overlayRef.current,
                { x: '-100%' },
                { x: '100%', duration: 1.8, ease: 'power2.inOut' },
                0.4
            )
                // Text appears instantly at midpoint
                .set(titleRef.current, { opacity: 1 }, 0.4 + 0.9)

            // Red decorative line
            tl.fromTo(
                redLineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
                1.5
            )

            // Tab cards – stagger
            const tabCards = tabsRef.current?.querySelectorAll('.f1-tab-card')
            if (tabCards) {
                tl.fromTo(
                    tabCards,
                    { opacity: 0, y: 50 },
                    { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out' },
                    1.7
                )
            }

            // Scroll arrow
            tl.fromTo(
                scrollArrowRef.current,
                { opacity: 0, y: -15 },
                { opacity: 1, y: 0, duration: 0.6 },
                2.2
            )

            // ── Parallax on hero background ──
            gsap.to(bgImageRef.current, {
                y: 120,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            })

            // ── Accroche section animations ──
            if (accrocheSectionRef.current) {

                // Animate other elements (divider, cta) simply
                const simpleElements = accrocheSectionRef.current.querySelectorAll('.accroche-simple-animate')
                gsap.fromTo(simpleElements,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        scrollTrigger: {
                            trigger: accrocheSectionRef.current,
                            start: "top 75%"
                        }
                    }
                )
            }
        })

        return () => ctx.revert()
    }, [])

    return (
        <main className="relative w-full overflow-hidden bg-[#0a0000]">
            <Navbar shouldAnimate disableEntryAnimation />

            {/* ═══════════ HERO SECTION ═══════════ */}
            <section
                ref={heroRef as React.RefObject<HTMLElement>}
                className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
            >
                {/* Background image + overlays */}
                <div ref={bgImageRef} className="absolute inset-0 will-change-transform">
                    <Image
                        src="/img/f1-bg.png"
                        alt="Formula 1 Car"
                        fill
                        priority
                        quality={90}
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(60,0,0,0.35) 40%, rgba(10,0,0,0.75) 100%)',
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
                        }}
                    />
                </div>

                {/* ── Content ── */}
                <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 w-full max-w-7xl mx-auto">
                    {/* Title with red block reveal */}
                    <div className="relative overflow-hidden mb-4">
                        <h1
                            ref={titleRef}
                            className="text-white text-[48px] sm:text-[72px] md:text-[110px] lg:text-[140px] font-black tracking-[0.06em] leading-none select-none drop-shadow-2xl"
                            style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                        >
                            FORMULA{' '}
                            <span className="text-purple-700">1</span>
                        </h1>
                        {/* Red sweeping overlay – same as WELCOME animation */}
                        <div
                            ref={overlayRef}
                            className="absolute inset-0 bg-purple-800 z-10"
                            style={{ transform: 'translateX(-100%)' }}
                        />
                    </div>

                    {/* Red decorative line */}
                    <div
                        ref={redLineRef}
                        className="w-32 md:w-48 h-[3px] bg-purple-700 mb-14 origin-center"
                        style={{ transform: 'scaleX(0)' }}
                    />

                    {/* Tab Cards with hover sub-tabs */}
                    <div
                        ref={tabsRef}
                        className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 w-full max-w-5xl"
                    >
                        {f1Tabs.map((tab, index) => (
                            <div
                                key={tab.name}
                                className="f1-tab-card relative"
                                style={{ opacity: 0 }}
                                onMouseEnter={() => setHoveredTab(index)}
                                onMouseLeave={() => setHoveredTab(null)}
                            >
                                {/* Main tab link */}
                                <Link href={tab.path} className="block group">
                                    <div
                                        className={`relative overflow-hidden rounded-sm border bg-black/30 backdrop-blur-md
                                                   px-6 py-5 md:px-8 md:py-6 text-center
                                                   transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                   group-hover:bg-white/10 group-hover:scale-[1.03]
                                                   group-hover:shadow-[0_0_40px_rgba(126,34,206,0.15)]
                                                   ${hoveredTab === index ? 'border-white/80' : 'border-white/30'}`}
                                    >
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                            style={{
                                                background: 'radial-gradient(ellipse at center, rgba(126,34,206,0.08) 0%, transparent 70%)',
                                            }}
                                        />
                                        <span
                                            className="relative z-10 text-white text-sm md:text-base font-bold tracking-[0.2em] uppercase
                                                       transition-colors duration-300 group-hover:text-purple-500"
                                            style={{ fontFamily: 'var(--font-outfit)' }}
                                        >
                                            {tab.name}
                                        </span>
                                        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-700 group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                                    </div>
                                </Link>

                                {/* Sub-tabs dropdown on hover */}
                                <div
                                    className={`absolute left-0 right-0 top-full z-30 pt-2 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)]
                                               ${hoveredTab === index ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                                >
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/15 rounded-sm overflow-hidden shadow-2xl shadow-black/60">
                                        {tab.subTabs.map((sub, subIdx) => (
                                            <Link
                                                key={sub.anchor}
                                                href={`${tab.path}#${sub.anchor}`}
                                                className="group/sub flex items-center gap-3 px-5 py-3 transition-all duration-300
                                                           hover:bg-white/10"
                                            >
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-700/50 group-hover/sub:bg-purple-700 transition-colors duration-300" />
                                                <span
                                                    className="text-gray-400 text-xs md:text-sm tracking-wider uppercase
                                                               group-hover/sub:text-white transition-colors duration-300"
                                                    style={{ fontFamily: 'var(--font-barlow)' }}
                                                >
                                                    {sub.name}
                                                </span>
                                                <svg
                                                    className="w-3 h-3 text-gray-600 ml-auto opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 -translate-x-2 transition-all duration-300"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div ref={scrollArrowRef} className="absolute bottom-10 z-10" style={{ opacity: 0 }}>
                    <div className="flex flex-col items-center gap-2 animate-bounce">
                        <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center backdrop-blur-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 text-white"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Top racing stripe */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-700 to-transparent" />
            </section>

            {/* ═══════════ ACCROCHE SECTION ═══════════ */}
            <section
                ref={accrocheSectionRef as React.RefObject<HTMLElement>}
                className="relative py-16 sm:py-28 md:py-40 px-5 sm:px-8 md:px-16"
                style={{
                    background: 'linear-gradient(180deg, #0a0000 0%, #060918 40%, #0a0e27 100%)',
                }}
            >
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div ref={accrocheTextRef} className="relative z-10 max-w-4xl mx-auto text-center">

                    {/* Block Reveal for Main Title */}
                    <RevealText
                        as="h2"
                        className="mb-10 text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-white font-normal leading-tight relative z-20"
                        style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
                        tokens={[
                            { text: '✮ Welcome', type: 'normal', spaceBefore: false },
                            { text: 'to', type: 'normal', spaceBefore: true },
                            { text: 'the', type: 'normal', spaceBefore: true },
                            { text: 'World', type: 'normal', spaceBefore: true },
                            { text: 'of', type: 'normal', spaceBefore: true },
                            { text: 'Formula 1! ✮', type: 'normal', spaceBefore: true },
                        ]}
                    />

                    <div className="accroche-simple-animate flex items-center justify-center gap-4 mb-10" style={{ opacity: 0 }}>
                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-purple-700" />
                        <div className="w-2 h-2 rounded-full bg-purple-700" />
                        <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-purple-700" />
                    </div>

                    {/* Welcome paragraphs */}
                    <div className="max-w-3xl mx-auto mb-8 space-y-6 text-left">
                        <RevealText
                            as="p"
                            className="text-gray-400 text-lg md:text-xl leading-relaxed relative z-20"
                            tokens={[
                                { text: "Whether", type: "normal", spaceBefore: false },
                                { text: "your", type: "normal", spaceBefore: true },
                                { text: "friends", type: "normal", spaceBefore: true },
                                { text: "won't", type: "normal", spaceBefore: true },
                                { text: "stop", type: "normal", spaceBefore: true },
                                { text: "arguing", type: "normal", spaceBefore: true },
                                { text: "about", type: "normal", spaceBefore: true },
                                { text: "Norris", type: "normal", spaceBefore: true },
                                { text: "vs", type: "normal", spaceBefore: true },
                                { text: "Verstappen,", type: "normal", spaceBefore: true },
                                { text: "or", type: "normal", spaceBefore: true },
                                { text: "Netflix's", type: "normal", spaceBefore: true },
                                { text: "Drive to Survive", type: "highlight", spaceBefore: true },
                                { text: "roped", type: "normal", spaceBefore: true },
                                { text: "you", type: "normal", spaceBefore: true },
                                { text: "in", type: "normal", spaceBefore: true },
                                { text: "with", type: "normal", spaceBefore: true },
                                { text: "its", type: "normal", spaceBefore: true },
                                { text: "chaotic", type: "normal", spaceBefore: true },
                                { text: "team", type: "normal", spaceBefore: true },
                                { text: "radios", type: "normal", spaceBefore: true },
                                { text: "—", type: "normal", spaceBefore: true },
                                { text: "or", type: "normal", spaceBefore: true },
                                { text: "you're", type: "normal", spaceBefore: true },
                                { text: "just", type: "normal", spaceBefore: true },
                                { text: "curious", type: "normal", spaceBefore: true },
                                { text: "about", type: "normal", spaceBefore: true },
                                { text: "what", type: "normal", spaceBefore: true },
                                { text: "makes", type: "normal", spaceBefore: true },
                                { text: "people", type: "normal", spaceBefore: true },
                                { text: "wake", type: "normal", spaceBefore: true },
                                { text: "up", type: "normal", spaceBefore: true },
                                { text: "at", type: "normal", spaceBefore: true },
                                { text: "7 AM", type: "normal", spaceBefore: true },
                                { text: "on", type: "normal", spaceBefore: true },
                                { text: "a", type: "normal", spaceBefore: true },
                                { text: "Sunday", type: "normal", spaceBefore: true },
                                { text: "to", type: "normal", spaceBefore: true },
                                { text: "watch", type: "normal", spaceBefore: true },
                                { text: "20 cars", type: "normal", spaceBefore: true },
                                { text: "race", type: "normal", spaceBefore: true },
                                { text: "around", type: "normal", spaceBefore: true },
                                { text: "weird-shaped", type: "normal", spaceBefore: true },
                                { text: "circles,", type: "normal", spaceBefore: true },
                                { text: "you're in the right place.", type: "highlight", spaceBefore: true },
                            ]}
                            highlightClassName="text-white font-medium italic"
                        />

                        <RevealText
                            as="p"
                            className="text-gray-400 text-lg md:text-xl leading-relaxed relative z-20"
                            tokens={[
                                { text: "F1", type: "normal", spaceBefore: false },
                                { text: "can", type: "normal", spaceBefore: true },
                                { text: "seem", type: "normal", spaceBefore: true },
                                { text: "intimidating", type: "normal", spaceBefore: true },
                                { text: "—", type: "normal", spaceBefore: true },
                                { text: '"undercut,"', type: "normal", spaceBefore: true },
                                { text: '"ERS deployment,"', type: "normal", spaceBefore: true },
                                { text: '"degradation"', type: "normal", spaceBefore: true },
                                { text: "—", type: "normal", spaceBefore: true },
                                { text: "but", type: "normal", spaceBefore: true },
                                { text: "that's", type: "normal", spaceBefore: true },
                                { text: "exactly", type: "normal", spaceBefore: true },
                                { text: "why", type: "normal", spaceBefore: true },
                                { text: "this", type: "normal", spaceBefore: true },
                                { text: "guide", type: "normal", spaceBefore: true },
                                { text: "exists:", type: "normal", spaceBefore: true },
                                { text: "to", type: "normal", spaceBefore: true },
                                { text: "break", type: "normal", spaceBefore: true },
                                { text: "things", type: "normal", spaceBefore: true },
                                { text: "down", type: "normal", spaceBefore: true },
                                { text: "clearly,", type: "normal", spaceBefore: true },
                                { text: "simply,", type: "normal", spaceBefore: true },
                                { text: "and", type: "normal", spaceBefore: true },
                                { text: "with", type: "normal", spaceBefore: true },
                                { text: "a", type: "normal", spaceBefore: true },
                                { text: "touch", type: "normal", spaceBefore: true },
                                { text: "of", type: "normal", spaceBefore: true },
                                { text: "fun.", type: "normal", spaceBefore: true },
                                { text: "Let's start with the basics.", type: "highlight", spaceBefore: true },
                            ]}
                            highlightClassName="text-white font-medium"
                        />
                    </div>

                    <div className="accroche-simple-animate" style={{ opacity: 0 }}>
                        <Link
                            href="/sports/f1/univers"
                            className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 rounded-full
                                       text-white font-semibold tracking-wider text-sm uppercase
                                       transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                       hover:border-purple-700 hover:bg-purple-700/10 hover:shadow-[0_0_30px_rgba(126,34,206,0.15)]"
                        >
                            Start exploring
                            <svg
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>


        </main>
    )
}
