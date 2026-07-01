'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/Navbar'
import F1TeamsMarquee from '@/components/F1TeamsMarquee'

gsap.registerPlugin(ScrollTrigger)

const heroImages = [
    { src: '/img/f1-univers-hero.png', alt: 'Formula 1 racing action' },
    { src: '/img/f1-univers-monaco.png', alt: 'Monaco Grand Prix historic circuit' },
    { src: '/img/f1-univers-cockpit.png', alt: 'F1 cockpit technology' },
    { src: '/img/f1-univers-fans.png', alt: 'F1 fans cheering with flares' },
    { src: '/img/f1-univers-night.png', alt: 'F1 night race under the lights' },
    { src: '/img/f1-univers-pitstop.png', alt: 'F1 pit stop action' },
]

const AUTOPLAY_SECONDS = 6

const circuitCards = [
    {
        city: 'MONACO',
        circuit: 'Circuit de Monaco',
        country: 'Monaco',
        tagline: 'Glamour in its purest form.',
        desc: "Yachts in the harbor, celebrities in the paddock, champagne at every corner. The streets are so narrow that overtaking is nearly impossible — and somehow, that makes it more iconic, not less.",
        img: '/img/f1-univers-monaco.png',
    },
    {
        city: 'MONZA',
        circuit: 'Autodromo Nazionale Monza',
        country: 'Italy',
        tagline: 'The Temple of Speed.',
        desc: "Walk into the grandstands and you're surrounded by a sea of red. The Tifosi — Ferrari's fanatical Italian supporters — bring a passion that no other sport can replicate. The atmosphere is electric even before the lights go out.",
        img: '/img/f1-univers-fans.png',
    },
    {
        city: 'SINGAPORE',
        circuit: 'Marina Bay Street Circuit',
        country: 'Singapore',
        tagline: 'A night race under a glittering skyline.',
        desc: "Half sporting event, half music festival. The city literally lights up for F1 — neon reflections on the asphalt, the skyline as a backdrop, and a buzz that lasts long after the chequered flag.",
        img: '/img/f1-univers-night.png',
    },
    {
        city: 'SUZUKA',
        circuit: 'Suzuka International Racing Course',
        country: 'Japan',
        tagline: 'The fans here are something else.',
        desc: "Handmade helmets, driver-themed outfits, hours of queuing just to get the best spot. Japanese F1 fans are widely considered the most dedicated in the world — and watching them in person is an experience in itself.",
        img: '/img/f1-univers-cockpit.png',
    },
    {
        city: 'MIAMI & VEGAS',
        circuit: 'The American Frontier',
        country: 'United States',
        tagline: 'The new frontier.',
        desc: "F1's American expansion brought celebrities, chaos, and even a US President trackside. Love it or hate it — it shows just how far F1's cultural reach now extends.",
        img: '/img/f1-univers-hero.png',
    },
]

const trackCards = [
    {
        num: '01',
        tag: 'Power',
        title: 'Hybrid Engines',
        desc: "F1 introduced hybrid power units in 2014, combining combustion engines with electric motors. That technology now powers the Ferrari SF90, the McLaren Artura, and increasingly, standard road cars.",
        accent: 'from-purple-700/50',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="butt" strokeLinejoin="round">
                <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />
            </svg>
        ),
    },
    {
        num: '02',
        tag: 'Materials',
        title: 'Carbon Fiber',
        desc: "First used in F1 in the early 1980s by McLaren, carbon fiber is now standard in supercars and high-performance road cars everywhere.",
        accent: 'from-purple-600/50',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="butt" strokeLinejoin="round">
                <path d="M3 8l9-5 9 5-9 5-9-5z" /><path d="M3 12l9 5 9-5" /><path d="M3 16l9 5 9-5" />
            </svg>
        ),
    },
    {
        num: '03',
        tag: 'Aerodynamics',
        title: 'Aerodynamics',
        desc: "The drag-reducing shapes perfected in F1 wind tunnels now influence everything from hypercars like the Bugatti Chiron to fuel-efficient hatchbacks.",
        accent: 'from-purple-500/50',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="butt" strokeLinejoin="round">
                <path d="M3 8h11a3 3 0 1 0-3-3" /><path d="M3 12h15a3 3 0 1 1-3 3" /><path d="M3 16h9a2.5 2.5 0 1 1-2.5 2.5" />
            </svg>
        ),
    },
    {
        num: '04',
        tag: 'Safety',
        title: 'Safety Systems',
        desc: "Crumple zones, side-impact protection, advanced braking tech — all tested and refined in F1 before reaching your driveway.",
        accent: 'from-purple-800/50',
        icon: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="butt" strokeLinejoin="round">
                <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" /><path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
]

const fanImages = [
    { src: '/img/f1-univers-fans.png', alt: 'Ferrari Tifosi crowd with red flares', pos: '50% 30%', filter: 'saturate(1.15) contrast(1.05)' },
    { src: '/img/f1-univers-fans.png', alt: 'Grandstand crowd with yellow flags', pos: '30% 60%', filter: 'saturate(0.9) hue-rotate(40deg) brightness(1.05)' },
    { src: '/img/f1-univers-fans.png', alt: 'Trackside crowd at the scoreboard', pos: '70% 45%', filter: 'saturate(1) sepia(0.15) brightness(0.95)' },
]

const fan0Text = (
    <>
        If you&apos;re wondering why <span className="text-white font-medium">F1 fans</span> are so… intense, it&apos;s because the sport has this magical way of getting under your skin. One minute you&apos;re just &quot;checking in&quot; to see who&apos;s winning, and the next you&apos;re arguing with strangers online about whether <span className="italic text-purple-400">Ferrari&apos;s pit wall</span> made another strategy blunder (spoiler: they probably did – just kidding we love Ferrari here).
    </>
)

const fan1LeftParas = [
    <>
        But that&apos;s what makes <span className="text-white font-medium">F1</span> special — it&apos;s not just a sport; it&apos;s a community. Fans build connections through online spaces like <span className="italic text-purple-400">social media</span>, <span className="italic text-purple-400">Formula1</span>, podcasts and YouTube creators.
    </>,
    <>
        And it&apos;s not just about stats and race results — it&apos;s about the shared highs and lows, the <span className="text-white font-medium">pre-race debates</span>, and the post-race memes.
    </>,
]
const fan1RightText = (
    <>
        The <span className="text-white font-medium">F1 fanbase</span> is incredibly diverse and global, which means that no matter where you are in the world, you&apos;ll always find someone ready to dissect the latest race strategy or laugh about <span className="italic text-purple-400">McLaren&apos;s latest pit stop disaster</span> (2025 was... messy... thankfully they won&apos;t this year... please...).
    </>
)

const fan2Paras = [
    <>
        There&apos;s a special bond between fans and drivers too — these moments create an <span className="text-white font-medium">emotional connection</span> that no other sport quite matches.
    </>,
    <>
        Whether you&apos;re here to geek out over <span className="italic text-purple-400">car setups</span>, fall in love with a driver&apos;s personality, or just enjoy the chaos — there&apos;s room for <span className="text-white font-medium">everyone</span>.
    </>,
]

export default function UniversPage() {
    const contentSectionRef = useRef<HTMLElement>(null)
    const imgWrapperRef = useRef<HTMLDivElement>(null)
    const imageRefs = useRef<(HTMLDivElement | null)[]>([])
    const bgTextRef = useRef<HTMLDivElement>(null)
    const bgTextH1Ref = useRef<HTMLHeadingElement>(null)
    const smallTitleRef = useRef<HTMLHeadingElement>(null)
    const smallOverlayRef = useRef<HTMLDivElement>(null)
    const timelineSectionRef = useRef<HTMLElement>(null)
    const timelineLineRef = useRef<HTMLDivElement>(null)
    const timelineNodeRefs = useRef<(HTMLDivElement | null)[]>([])
    const timelineBlockRefs = useRef<(HTMLDivElement | null)[]>([])
    const timelineHeadingContainerRefs = useRef<(HTMLDivElement | null)[]>([])
    const timelineHeadingRefs = useRef<(HTMLHeadingElement | null)[]>([])
    const timelineHeadingOverlayRefs = useRef<(HTMLDivElement | null)[]>([])
    const timelineDateRefs = useRef<(HTMLSpanElement | null)[]>([])
    const timelineDateOverlayRefs = useRef<(HTMLDivElement | null)[]>([])
    const introHeadingContainerRef = useRef<HTMLDivElement>(null)
    const introHeadingRef = useRef<HTMLHeadingElement>(null)
    const introHeadingOverlayRef = useRef<HTMLDivElement>(null)
    const introParasRef = useRef<HTMLDivElement>(null)
    const timelineImgOuterRefs = useRef<(HTMLDivElement | null)[]>([])
    const timelineImgInnerRefs = useRef<(HTMLDivElement | null)[]>([])
    const [activeIdx, setActiveIdx] = useState(0)
    const impactTitleContainerRef = useRef<HTMLDivElement>(null)
    const impactTitleRef = useRef<HTMLHeadingElement>(null)
    const impactTitleOverlayRef = useRef<HTMLDivElement>(null)
    const impactSubtitleContainerRef = useRef<HTMLDivElement>(null)
    const impactSubtitleRef = useRef<HTMLHeadingElement>(null)
    const impactSubtitleOverlayRef = useRef<HTMLDivElement>(null)
    const impactIntroRef = useRef<HTMLDivElement>(null)
    const impactQuoteRef = useRef<HTMLDivElement>(null)
    const impactStatsRef = useRef<HTMLDivElement>(null)
    const carouselHeadContainerRef = useRef<HTMLDivElement>(null)
    const carouselHeadRef = useRef<HTMLHeadingElement>(null)
    const carouselHeadOverlayRef = useRef<HTMLDivElement>(null)
    const carouselSubRef = useRef<HTMLParagraphElement>(null)
    const carouselClosingRef = useRef<HTMLDivElement>(null)
    const trackHeadContainerRef = useRef<HTMLDivElement>(null)
    const trackHeadRef = useRef<HTMLHeadingElement>(null)
    const trackHeadOverlayRef = useRef<HTMLDivElement>(null)
    const trackIntroRef = useRef<HTMLDivElement>(null)
    const trackIconRefs = useRef<(HTMLDivElement | null)[]>([])
    const trackClosingRef = useRef<HTMLParagraphElement>(null)
    // Beyond Racing — Culture & Soft Power
    const beyondLabelRef = useRef<HTMLDivElement>(null)
    const beyondHeadContainerRef = useRef<HTMLDivElement>(null)
    const beyondHeadRef = useRef<HTMLHeadingElement>(null)
    const beyondHeadOverlayRef = useRef<HTMLDivElement>(null)
    const beyondSubRef = useRef<HTMLHeadingElement>(null)
    const iconWordRef = useRef<HTMLDivElement>(null)
    const coverOuterRef = useRef<HTMLDivElement>(null)
    const coverInnerRef = useRef<HTMLDivElement>(null)
    const hamiltonHeadContainerRef = useRef<HTMLDivElement>(null)
    const hamiltonHeadRef = useRef<HTMLHeadingElement>(null)
    const hamiltonHeadOverlayRef = useRef<HTMLDivElement>(null)
    const hamiltonTextRef = useRef<HTMLDivElement>(null)
    const softStatementRef = useRef<HTMLDivElement>(null)
    const softClosingRef = useRef<HTMLDivElement>(null)
    const softBgSectionRef = useRef<HTMLDivElement>(null)
    const softBlobRefs = useRef<(HTMLDivElement | null)[]>([])
    // The Fans — hover-driven reveal
    const fansPinRef = useRef<HTMLDivElement>(null)
    const fansImgRefs = useRef<(HTMLDivElement | null)[]>([])
    const fansTitleRef = useRef<HTMLHeadingElement>(null)
    const fansTitleOverlayRef = useRef<HTMLDivElement>(null)
    const [hoveredFan, setHoveredFan] = useState<number | null>(null)
    const carouselContainerRef = useRef<HTMLDivElement>(null)
    const carouselInnerRef = useRef<HTMLDivElement>(null)
    const isCarouselAnimating = useRef(false)
    const carouselIdxRef = useRef(0)
    const slideContentRefs = useRef<(HTMLDivElement | null)[]>([])
    const slideImageRefs = useRef<(HTMLDivElement | null)[]>([])
    const dotFillRef = useRef<HTMLDivElement | null>(null)
    const autoplayTweenRef = useRef<gsap.core.Tween | null>(null)
    const [carouselIdx, setCarouselIdx] = useState(0)

    useEffect(() => {
        const imgElements = imageRefs.current.filter(Boolean) as HTMLDivElement[]
        const totalImages = imgElements.length

        const ctx = gsap.context(() => {
            gsap.fromTo(
                bgTextH1Ref.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 2, ease: 'power3.out', delay: 0.1 }
            )

            if (smallTitleRef.current && smallOverlayRef.current) {
                gsap.set(smallTitleRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: contentSectionRef.current, start: 'top 80%' },
                    delay: 0.5
                })
                tl.fromTo(smallOverlayRef.current,
                    { x: '-100%' },
                    { x: '100%', duration: 1.2, ease: 'power2.inOut' }
                ).set(smallTitleRef.current, { opacity: 1 }, 0.6)
            }

            if (contentSectionRef.current && imgWrapperRef.current && imgElements.length > 0) {
                imgElements.forEach((img, i) => {
                    gsap.set(img, { opacity: i === 0 ? 1 : 0 })
                })

                const imgContainerTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: contentSectionRef.current,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1,
                    },
                })

                gsap.to(bgTextRef.current, {
                    y: -200, ease: 'none',
                    scrollTrigger: {
                        trigger: contentSectionRef.current,
                        start: 'top top', end: 'bottom top',
                        scrub: true,
                    },
                })

                imgContainerTl.to(imgWrapperRef.current, {
                    scale: 0.45, xPercent: -45,
                    y: window.innerHeight * 0.15,
                    ease: 'none'
                }, 0)
            }

            // === INTRO TEXT ANIMATIONS ===
            if (introHeadingContainerRef.current && introHeadingRef.current && introHeadingOverlayRef.current) {
                gsap.set(introHeadingRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: introHeadingContainerRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    }
                })
                tl
                    .fromTo(introHeadingOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(introHeadingRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(introHeadingOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            if (introParasRef.current) {
                const paras = introParasRef.current.querySelectorAll('p')
                gsap.set(paras, { opacity: 0, y: 28 })
                gsap.to(paras, {
                    opacity: 1, y: 0,
                    stagger: 0.2, duration: 0.9, ease: 'power2.out',
                    scrollTrigger: {
                        trigger: introParasRef.current,
                        start: 'top 75%',
                        toggleActions: 'play reverse play reverse',
                    }
                })
            }

            // === VERTICAL TIMELINE ===
            if (timelineSectionRef.current && timelineLineRef.current) {
                // Line draw
                gsap.fromTo(timelineLineRef.current,
                    { scaleY: 0, xPercent: -50 },
                    {
                        scaleY: 1, xPercent: -50,
                        transformOrigin: 'top', ease: 'none',
                        scrollTrigger: {
                            trigger: timelineSectionRef.current,
                            start: 'top 80%', end: 'bottom 80%',
                            scrub: 1,
                        }
                    }
                )

                // Nodes
                timelineNodeRefs.current.forEach((node, i) => {
                    const trigger = timelineBlockRefs.current[i]
                    if (!node || !trigger) return
                    gsap.set(node, { scale: 0, xPercent: -50 })
                    gsap.to(node, {
                        scale: 1, xPercent: -50,
                        duration: 0.6, ease: 'back.out(2)',
                        scrollTrigger: {
                            trigger,
                            start: 'top 80%',
                            toggleActions: 'play reverse play reverse',
                        }
                    })
                })

                // Date label wipes
                timelineDateRefs.current.forEach((dateEl, i) => {
                    const overlay = timelineDateOverlayRefs.current[i]
                    if (!dateEl || !overlay) return
                    gsap.set(dateEl, { opacity: 0 })
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: dateEl,
                            start: 'top 85%',
                            toggleActions: 'play reverse play reverse',
                        }
                    })
                    tl
                        .fromTo(overlay, { x: '-100%' }, { x: '0%', duration: 0.35, ease: 'power2.in' })
                        .to(dateEl, { opacity: 1, duration: 0.001 }, 0.35)
                        .to(overlay, { x: '100%', duration: 0.35, ease: 'power2.out' }, 0.35)
                })

                // Heading wipes — same mechanism as WELCOME
                timelineHeadingContainerRefs.current.forEach((container, i) => {
                    const heading = timelineHeadingRefs.current[i]
                    const overlay = timelineHeadingOverlayRefs.current[i]
                    if (!container || !heading || !overlay) return
                    gsap.set(heading, { opacity: 0 })
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: container,
                            start: 'top 80%',
                            toggleActions: 'play reverse play reverse',
                        }
                    })
                    tl
                        .fromTo(overlay, { x: '-100%' }, { x: '0%', duration: 0.5, ease: 'power2.in' })
                        .to(heading, { opacity: 1, duration: 0.001 }, 0.5)
                        .to(overlay, { x: '100%', duration: 0.5, ease: 'power2.out' }, 0.5)
                })

                // Paragraph stagger
                timelineBlockRefs.current.forEach((block) => {
                    if (!block) return
                    const paras = block.querySelectorAll('p')
                    if (paras.length === 0) return
                    gsap.set(paras, { opacity: 0, y: 28 })
                    gsap.to(paras, {
                        opacity: 1, y: 0,
                        stagger: 0.15, duration: 0.8, ease: 'power2.out',
                        scrollTrigger: {
                            trigger: block,
                            start: 'top 65%',
                            toggleActions: 'play reverse play reverse',
                        }
                    })
                })

                // Cinematic image reveals: clip wipe + scale + desaturation + glint streak
                timelineImgOuterRefs.current.forEach((outer, i) => {
                    const inner = timelineImgInnerRefs.current[i]
                    if (!outer) return

                    const st = {
                        trigger: outer,
                        start: 'top 85%',
                        end: 'top 20%',
                        scrub: 1.5,
                    }

                    gsap.fromTo(outer,
                        { clipPath: 'inset(0% 100% 0% 0%)' },
                        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', scrollTrigger: st }
                    )

                    if (inner) {
                        gsap.fromTo(inner,
                            { scale: 1.25, filter: 'brightness(0.3) saturate(0)' },
                            { scale: 1, filter: 'brightness(1) saturate(1)', ease: 'none', scrollTrigger: st }
                        )
                    }
                })
            }

            // === IMPACT SECTION ANIMATIONS ===
            if (impactTitleContainerRef.current && impactTitleRef.current && impactTitleOverlayRef.current) {
                gsap.set(impactTitleRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: impactTitleContainerRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                })
                tl
                    .fromTo(impactTitleOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(impactTitleRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(impactTitleOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            if (impactSubtitleContainerRef.current && impactSubtitleRef.current && impactSubtitleOverlayRef.current) {
                gsap.set(impactSubtitleRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: impactSubtitleContainerRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                })
                tl
                    .fromTo(impactSubtitleOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(impactSubtitleRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(impactSubtitleOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            if (impactIntroRef.current) {
                const paras = impactIntroRef.current.querySelectorAll('p')
                gsap.set(paras, { opacity: 0, y: 28 })
                gsap.to(paras, {
                    opacity: 1, y: 0,
                    stagger: 0.2, duration: 0.9, ease: 'power2.out',
                    scrollTrigger: {
                        trigger: impactIntroRef.current,
                        start: 'top 75%',
                        toggleActions: 'play reverse play reverse',
                    }
                })
            }

            if (impactQuoteRef.current) {
                gsap.fromTo(impactQuoteRef.current,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
                        scrollTrigger: { trigger: impactQuoteRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                    }
                )
            }

            if (impactStatsRef.current) {
                const statItems = impactStatsRef.current.querySelectorAll('.stat-item')
                gsap.set(statItems, { opacity: 0, y: 30 })
                gsap.to(statItems, {
                    opacity: 1, y: 0,
                    stagger: 0.15, duration: 0.8, ease: 'power2.out',
                    scrollTrigger: {
                        trigger: impactStatsRef.current,
                        start: 'top 80%',
                        toggleActions: 'play reverse play reverse',
                    }
                })
            }

            // === CAROUSEL HEADER ===
            if (carouselHeadContainerRef.current && carouselHeadRef.current && carouselHeadOverlayRef.current) {
                gsap.set(carouselHeadRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: carouselHeadContainerRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' }
                })
                tl
                    .fromTo(carouselHeadOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(carouselHeadRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(carouselHeadOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            if (carouselSubRef.current) {
                gsap.fromTo(carouselSubRef.current,
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
                        scrollTrigger: { trigger: carouselSubRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' }
                    }
                )
            }

            // === CAROUSEL CLOSING STATEMENT ===
            if (carouselClosingRef.current) {
                const items = carouselClosingRef.current.querySelectorAll('.closing-anim')
                gsap.set(items, { opacity: 0, y: 30 })
                gsap.to(items, {
                    opacity: 1, y: 0,
                    stagger: 0.18, duration: 0.9, ease: 'power3.out',
                    scrollTrigger: { trigger: carouselClosingRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                })
            }

            // === FROM THE TRACK TO YOUR CAR — header + intro ===
            if (trackHeadContainerRef.current && trackHeadRef.current && trackHeadOverlayRef.current) {
                gsap.set(trackHeadRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: trackHeadContainerRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' }
                })
                tl
                    .fromTo(trackHeadOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(trackHeadRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(trackHeadOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            if (trackIntroRef.current) {
                const paras = trackIntroRef.current.querySelectorAll('p')
                gsap.set(paras, { opacity: 0, y: 28 })
                gsap.to(paras, {
                    opacity: 1, y: 0,
                    stagger: 0.2, duration: 0.9, ease: 'power2.out',
                    scrollTrigger: { trigger: trackIntroRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                })
            }

            // === ICON DRAW-ON (stroke trace) per card ===
            trackIconRefs.current.forEach((wrap) => {
                if (!wrap) return
                const paths = Array.from(wrap.querySelectorAll('path'))
                if (paths.length === 0) return
                paths.forEach((p) => {
                    const len = p.getTotalLength()
                    // Pad the dash/offset slightly past the path length: at len===len the
                    // dash/gap seam sits exactly at the start point and subpixel rounding
                    // can render a stray sliver there before the trace begins.
                    gsap.set(p, { strokeDasharray: `${len} ${len + 2}`, strokeDashoffset: len + 1 })
                })
                // Keep the whole icon hidden (visibility) until the trace starts so the round
                // line-caps never show as static dots beforehand.
                gsap.set(wrap, { autoAlpha: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: wrap,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                })
                tl
                    .set(wrap, { autoAlpha: 1 }, 0)
                    .to(paths, {
                        strokeDashoffset: 0,
                        duration: 1.2,
                        ease: 'power2.inOut',
                        stagger: 0.18,
                    }, 0)
            })

            if (trackClosingRef.current) {
                gsap.fromTo(trackClosingRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                        scrollTrigger: { trigger: trackClosingRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' }
                    }
                )
            }

            // === BEYOND RACING — header ===
            if (beyondLabelRef.current) {
                gsap.fromTo(beyondLabelRef.current,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
                        scrollTrigger: { trigger: beyondLabelRef.current, start: 'top 88%', toggleActions: 'play reverse play reverse' }
                    }
                )
            }

            if (beyondHeadContainerRef.current && beyondHeadRef.current && beyondHeadOverlayRef.current) {
                gsap.set(beyondHeadRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: beyondHeadContainerRef.current, start: 'top 82%', toggleActions: 'play reverse play reverse' }
                })
                tl
                    .fromTo(beyondHeadOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(beyondHeadRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(beyondHeadOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            if (beyondSubRef.current) {
                gsap.fromTo(beyondSubRef.current,
                    { opacity: 0, y: 24 },
                    {
                        opacity: 1, y: 0, duration: 0.9, ease: 'power2.out',
                        scrollTrigger: { trigger: beyondSubRef.current, start: 'top 85%', toggleActions: 'play reverse play reverse' }
                    }
                )
            }

            // === PART 1 — The Cultural Icon ===
            if (iconWordRef.current) {
                gsap.fromTo(iconWordRef.current,
                    { yPercent: 14 },
                    {
                        yPercent: -14, ease: 'none',
                        scrollTrigger: { trigger: iconWordRef.current, start: 'top bottom', end: 'bottom top', scrub: true }
                    }
                )
            }

            if (coverOuterRef.current) {
                const st = { trigger: coverOuterRef.current, start: 'top 85%', end: 'top 25%', scrub: 1.5 }
                gsap.fromTo(coverOuterRef.current,
                    { clipPath: 'inset(100% 0% 0% 0%)' },
                    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', scrollTrigger: st }
                )
                if (coverInnerRef.current) {
                    gsap.fromTo(coverInnerRef.current,
                        { scale: 1.3, filter: 'brightness(0.3) saturate(0)' },
                        { scale: 1, filter: 'brightness(1) saturate(1)', ease: 'none', scrollTrigger: st }
                    )
                }
            }

            if (hamiltonHeadContainerRef.current && hamiltonHeadRef.current && hamiltonHeadOverlayRef.current) {
                gsap.set(hamiltonHeadRef.current, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: hamiltonHeadContainerRef.current, start: 'top 82%', toggleActions: 'play reverse play reverse' }
                })
                tl
                    .fromTo(hamiltonHeadOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.55, ease: 'power2.in' })
                    .to(hamiltonHeadRef.current, { opacity: 1, duration: 0.001 }, 0.55)
                    .to(hamiltonHeadOverlayRef.current, { x: '100%', duration: 0.55, ease: 'power2.out' }, 0.55)
            }

            if (hamiltonTextRef.current) {
                const paras = hamiltonTextRef.current.querySelectorAll('p')
                gsap.set(paras, { opacity: 0, y: 28 })
                gsap.to(paras, {
                    opacity: 1, y: 0, stagger: 0.2, duration: 0.9, ease: 'power2.out',
                    scrollTrigger: { trigger: hamiltonTextRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                })
            }

            // === PART 2 — Soft Power background blobs (scroll parallax) ===
            softBlobRefs.current.forEach((blob, i) => {
                if (!blob || !softBgSectionRef.current) return
                const dir = i % 2 === 0 ? 1 : -1
                gsap.fromTo(blob,
                    { yPercent: -18 * dir },
                    {
                        yPercent: 18 * dir, ease: 'none',
                        scrollTrigger: { trigger: softBgSectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true }
                    }
                )
            })

            // === PART 2 — Soft Power ===
            if (softStatementRef.current) {
                const lines = softStatementRef.current.querySelectorAll('.statement-line')
                gsap.set(lines, { opacity: 0, y: 40 })
                gsap.to(lines, {
                    opacity: 1, y: 0, stagger: 0.15, duration: 1, ease: 'power3.out',
                    scrollTrigger: { trigger: softStatementRef.current, start: 'top 80%', toggleActions: 'play reverse play reverse' }
                })
            }

            if (softClosingRef.current) {
                const items = softClosingRef.current.querySelectorAll('.soft-closing-anim')
                gsap.set(items, { opacity: 0, y: 30 })
                gsap.to(items, {
                    opacity: 1, y: 0, stagger: 0.18, duration: 0.9, ease: 'power3.out',
                    scrollTrigger: { trigger: softClosingRef.current, start: 'top 82%', toggleActions: 'play reverse play reverse' }
                })
            }

            // === THE FANS — title reveal on scroll-into-view (content itself is hover-driven) ===
            if (fansTitleRef.current && fansTitleOverlayRef.current) {
                gsap.set(fansTitleRef.current, { opacity: 0 })
                const titleTl = gsap.timeline({
                    scrollTrigger: { trigger: fansPinRef.current, start: 'top 80%' },
                })
                titleTl
                    .fromTo(fansTitleOverlayRef.current, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(fansTitleRef.current, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(fansTitleOverlayRef.current, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            }

            // === THE FANS — image entrance (staggered diagonal cascade) ===
            const fanImgEls = fansImgRefs.current.filter(Boolean) as HTMLDivElement[]
            if (fanImgEls.length > 0 && fansPinRef.current) {
                gsap.set(fanImgEls, { opacity: 0, y: 60, scale: 0.92 })
                gsap.to(fanImgEls, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.18,
                    scrollTrigger: {
                        trigger: fansPinRef.current,
                        start: 'top 75%',
                        toggleActions: 'play none none reverse',
                    },
                })
            }
        })

        let currentIdx = 0
        let wheelAccum = 0
        let changeLock = false

        const onWheel = (e: WheelEvent) => {
            if (imgElements.length === 0 || !contentSectionRef.current) return
            const rect = contentSectionRef.current.getBoundingClientRect()
            if (rect.top > 0 || rect.bottom < window.innerHeight) return
            if (changeLock) { wheelAccum = 0; return }
            wheelAccum += e.deltaY
            if (Math.abs(wheelAccum) < 100) return
            const dir = (wheelAccum > 0 ? 1 : -1) as 1 | -1
            wheelAccum = 0
            const newIdx = Math.max(0, Math.min(totalImages - 1, currentIdx + dir))
            if (newIdx === currentIdx) return
            changeLock = true
            gsap.to(imgElements[currentIdx], { opacity: 0, duration: 0.4, ease: 'power1.inOut' })
            gsap.to(imgElements[newIdx], { opacity: 1, duration: 0.4, ease: 'power1.inOut' })
            currentIdx = newIdx
            setActiveIdx(newIdx)
            setTimeout(() => { changeLock = false }, 500)
        }

        window.addEventListener('wheel', onWheel, { passive: true })

        return () => {
            ctx.revert()
            window.removeEventListener('wheel', onWheel)
        }
    }, [])

    const animateToSlide = (newIdx: number) => {
        if (isCarouselAnimating.current || !carouselInnerRef.current) return
        const len = circuitCards.length
        const target = ((newIdx % len) + len) % len // wrap-around
        if (target === carouselIdxRef.current) return
        isCarouselAnimating.current = true
        const slideWidth = carouselContainerRef.current?.clientWidth ?? window.innerWidth
        gsap.to(carouselInnerRef.current, {
            x: -target * slideWidth,
            duration: 1,
            ease: 'power3.inOut',
            onComplete: () => { isCarouselAnimating.current = false },
        })
        carouselIdxRef.current = target
        setCarouselIdx(target)
    }

    const goToSlide = (newIdx: number) => animateToSlide(newIdx)

    // Per-slide content reveal + autoplay (fills the active dot, then advances)
    useEffect(() => {
        const ctx = gsap.context(() => {
            // clear any parallax offset carried over from another slide
            slideImageRefs.current.forEach((el) => { if (el) gsap.set(el, { x: 0, y: 0 }) })

            const content = slideContentRefs.current[carouselIdx]
            if (content) {
                const items = content.querySelectorAll('.slide-anim')
                gsap.fromTo(items,
                    { y: 48, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.85, stagger: 0.09, ease: 'power3.out', delay: 0.15 }
                )
            }
        })

        // Autoplay — managed explicitly (outside the context) so it always loops
        autoplayTweenRef.current?.kill()
        if (dotFillRef.current) {
            gsap.set(dotFillRef.current, { width: '0%' })
            autoplayTweenRef.current = gsap.to(dotFillRef.current, {
                width: '100%',
                duration: AUTOPLAY_SECONDS,
                ease: 'none',
                onComplete: () => animateToSlide(carouselIdxRef.current + 1),
            })
        }

        return () => {
            ctx.revert()
            autoplayTweenRef.current?.kill()
        }
    }, [carouselIdx])

    // Keep the slide offset correct on resize
    useEffect(() => {
        const onResize = () => {
            if (!carouselInnerRef.current) return
            const slideWidth = carouselContainerRef.current?.clientWidth ?? window.innerWidth
            gsap.set(carouselInnerRef.current, { x: -carouselIdxRef.current * slideWidth })
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // Background images drift gently with the mouse (subtle parallax)
    const PARALLAX_AMOUNT = 26
    const handleParallax = (e: React.MouseEvent) => {
        const el = slideImageRefs.current[carouselIdx]
        const container = carouselContainerRef.current
        if (!el || !container) return
        const rect = container.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2  // -1..1
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2  // -1..1
        gsap.to(el, {
            x: nx * -PARALLAX_AMOUNT,
            y: ny * -PARALLAX_AMOUNT,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto',
        })
    }
    const resetParallax = () => {
        const el = slideImageRefs.current[carouselIdx]
        if (el) gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'power2.out' })
    }

    // Soft Power background blobs drift gently with the mouse
    const SOFT_BG_PARALLAX_AMOUNT = 36
    const handleSoftBgParallax = (e: React.MouseEvent) => {
        const container = softBgSectionRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        softBlobRefs.current.forEach((blob, i) => {
            if (!blob) return
            const amount = SOFT_BG_PARALLAX_AMOUNT * (i % 2 === 0 ? 1 : -1)
            gsap.to(blob, {
                x: nx * amount,
                y: ny * amount,
                duration: 1.2,
                ease: 'power2.out',
                overwrite: 'auto',
            })
        })
    }
    const resetSoftBgParallax = () => {
        softBlobRefs.current.forEach((blob) => {
            if (blob) gsap.to(blob, { x: 0, y: 0, duration: 1, ease: 'power2.out' })
        })
    }

    return (
        <main className="relative w-full bg-[#0a0a0a] min-h-0" style={{ overflowX: 'clip' }}>
            <Navbar shouldAnimate disableEntryAnimation />

            <div
                ref={bgTextRef}
                className="absolute top-24 left-0 w-full flex justify-center z-0 overflow-visible px-4 select-none pointer-events-none"
            >
                <h1
                    ref={bgTextH1Ref}
                    className="text-[#202020] font-black tracking-tighter leading-[0.8] text-center w-full"
                    style={{ fontFamily: 'var(--font-russo)', fontSize: '18vw' }}
                >
                    UNIVERS
                </h1>
            </div>

            <section
                ref={contentSectionRef as React.RefObject<HTMLElement>}
                className="relative z-10 w-full pt-[12vw] scroll-gallery-section"
            >
                <div className="relative w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row">
                    <div className="w-full lg:w-[50%] px-6 sm:px-12 md:px-20 xl:px-32 relative z-20 flex flex-col justify-start">
                        <div className="relative overflow-hidden inline-block mb-10 mt-10 lg:mt-[5vw]">
                            <h2
                                ref={smallTitleRef}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-2xl"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                THE{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    HISTORY
                                </span>
                            </h2>
                            <div ref={smallOverlayRef} className="absolute inset-0 bg-purple-600 z-30" style={{ transform: 'translateX(-100%)' }} />
                        </div>

                        <div ref={introHeadingContainerRef} className="relative overflow-hidden mb-8">
                            <h3 ref={introHeadingRef} className="text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight w-full" style={{ fontFamily: 'var(--font-playfair)' }}>
                                A Sport with <span className="font-semibold text-gray-300 italic">History</span> and <span className="font-semibold text-gray-300 italic">Heart</span>
                            </h3>
                            <div ref={introHeadingOverlayRef} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                        </div>

                        <div ref={introParasRef}>
                            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-6 w-full pr-4" style={{ fontFamily: 'var(--font-barlow)' }}>
                                It all started in <span className="text-white font-medium">1950</span>. Not with a bang — well, actually yes, with a bang. Twenty-one cars lined up at <span className="text-white font-medium">Silverstone</span>, on a converted RAF airfield, and the world&apos;s most intense motorsport championship was born. <span className="italic text-purple-400">Giuseppe Farina</span> crossed the finish line first, driving for <span className="italic text-purple-400">Alfa Romeo</span>, and F1 history began.
                            </p>

                            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-16 w-full pr-4" style={{ fontFamily: 'var(--font-barlow)' }}>
                                But the story didn&apos;t start there. Long before the <span className="text-white font-medium">FIA</span> created a unified rulebook — the <span className="italic text-purple-400">&quot;Formula&quot;</span> — Grand Prix racing across Europe was wild, inconsistent, and frankly dangerous. The FIA stepped in to bring order to the chaos. It worked. Mostly.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="w-8 h-[1px] bg-purple-700" />
                            <span className="text-purple-500 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>Since 1950</span>
                        </div>
                    </div>

                    <div className="w-full lg:w-[50%] hidden lg:block relative h-full pointer-events-none">
                        <div className="sticky top-0 h-screen w-full flex items-center justify-end overflow-visible pr-0">
                            <div ref={imgWrapperRef} className="relative w-[90%] h-[80%] mt-[5vw] transform-gpu origin-right">
                                {heroImages.map((img, i) => (
                                    <div
                                        key={img.src}
                                        ref={(el) => { imageRefs.current[i] = el }}
                                        className="absolute inset-0 w-full h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden"
                                        style={{ opacity: i === 0 ? 1 : 0 }}
                                    >
                                        <Image src={img.src} alt={img.alt} fill quality={95} sizes="60vw" className="object-cover object-center" priority={i === 0} />
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>
                                ))}
                                <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                                    {heroImages.map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-[2px] h-6 rounded-full transition-all duration-500 shadow-sm"
                                            style={{ background: i === activeIdx ? 'rgba(168, 85, 247, 0.9)' : 'rgba(255, 255, 255, 0.2)' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="block lg:hidden w-full px-6 pb-20 z-20">
                        <div className="relative w-full aspect-[4/5] mt-[10vw] rounded-sm overflow-hidden shadow-2xl mx-auto max-w-lg">
                            <Image src="/img/f1-univers-hero.png" alt="Formula 1 racing action" fill quality={90} sizes="100vw" className="object-cover" />
                            <div className="absolute inset-0 bg-black/30" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="relative z-10 w-full">
                <F1TeamsMarquee />
            </div>

            {/* ═══ VERTICAL TIMELINE ═══ */}
            <section
                ref={timelineSectionRef as React.RefObject<HTMLElement>}
                className="relative z-10 w-full bg-[#0a0a0a] py-24 lg:py-40"
            >
                <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-20 xl:px-32">
                    <div className="relative">

                        <div ref={timelineLineRef} className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-[2px] bg-purple-700 pointer-events-none" />

                        <div className="flex flex-col gap-20 lg:gap-28">

                            {/* ── Item 1: The Legends Era — image LEFT, text RIGHT ── */}
                            <div className="relative pl-12 lg:pl-0">
                                <div ref={(el) => { timelineNodeRefs.current[0] = el }} className="absolute left-4 lg:left-1/2 top-7 w-3 h-3 z-10 rounded-full bg-purple-600 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
                                    {/* Image LEFT desktop */}
                                    <div className="hidden lg:block">
                                        <div ref={(el) => { timelineImgOuterRefs.current[0] = el }} className="relative w-full aspect-[16/10] rounded-sm overflow-hidden">
                                            <div ref={(el) => { timelineImgInnerRefs.current[0] = el }} className="absolute left-0 right-0" style={{ top: '-12%', bottom: '-12%' }}>
                                                <Image src="/img/f1-univers-pitstop.png" alt="F1 pit stop action" fill quality={90} sizes="45vw" className="object-cover object-center" />
                                                <div className="absolute inset-0 bg-black/20" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text RIGHT */}
                                    <div ref={(el) => { timelineBlockRefs.current[0] = el }} className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 lg:p-8">
                                        <div className="lg:hidden relative w-full aspect-[16/10] rounded-sm overflow-hidden mb-6">
                                            <Image src="/img/f1-univers-pitstop.png" alt="F1 pit stop action" fill quality={90} sizes="100vw" className="object-cover object-center" />
                                            <div className="absolute inset-0 bg-black/20" />
                                        </div>

                                        <div className="relative overflow-hidden inline-block mb-3">
                                            <span ref={(el) => { timelineDateRefs.current[0] = el }} className="text-purple-500 text-xs tracking-[0.2em] uppercase block" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                1950 — 1994
                                            </span>
                                            <div ref={(el) => { timelineDateOverlayRefs.current[0] = el }} className="absolute inset-0 bg-purple-700 z-10" style={{ transform: 'translateX(-100%)' }} />
                                        </div>

                                        <div ref={(el) => { timelineHeadingContainerRefs.current[0] = el }} className="relative overflow-hidden mb-6">
                                            <h3 ref={(el) => { timelineHeadingRefs.current[0] = el }} className="text-2xl sm:text-3xl text-white font-bold uppercase tracking-tight" style={{ fontFamily: 'var(--font-russo)' }}>
                                                The <span className="text-purple-400">Legends</span> Era
                                            </h3>
                                            <div ref={(el) => { timelineHeadingOverlayRefs.current[0] = el }} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                                        </div>

                                        <div className="flex flex-col gap-5">
                                            <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                The early decades of F1 were defined by two things: breathtaking skill and terrifying danger. Drivers like <span className="italic text-purple-400">Juan Manuel Fangio</span> and <span className="italic text-purple-400">Jim Clark</span> became icons — not just for their speed, but for their bravery in an era where fatal crashes were a real and regular part of the sport. Safety was almost an afterthought. Cars were fast, fragile, and unforgiving.
                                            </p>
                                            <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                Then came <span className="text-white font-medium">Ayrton Senna</span>. His death at Imola in <span className="text-white font-medium">1994</span> shook F1 to its core — and changed it forever. The FIA responded with sweeping safety reforms: redesigned cockpits, stronger barriers, mandatory crash tests.
                                            </p>
                                            <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                That titanium frame arching over the driver&apos;s head today? That&apos;s the <span className="italic text-purple-400">halo</span> — and it has literally saved lives. Senna&apos;s legacy isn&apos;t just his three world titles. It&apos;s the sport he helped make safer for everyone who came after.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Item 2: Rivalries — text LEFT, image RIGHT ── */}
                            <div className="relative pl-12 lg:pl-0">
                                <div ref={(el) => { timelineNodeRefs.current[1] = el }} className="absolute left-4 lg:left-1/2 top-7 w-3 h-3 z-10 rounded-full bg-purple-600 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                                <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
                                    {/* Text LEFT */}
                                    <div ref={(el) => { timelineBlockRefs.current[1] = el }} className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 lg:p-8">
                                        <div className="lg:hidden relative w-full aspect-[16/10] rounded-sm overflow-hidden mb-6">
                                            <Image src="/img/f1-univers-monaco.png" alt="Monaco Grand Prix circuit" fill quality={90} sizes="100vw" className="object-cover object-center" />
                                            <div className="absolute inset-0 bg-black/20" />
                                        </div>

                                        <div className="relative overflow-hidden inline-block mb-3">
                                            <span ref={(el) => { timelineDateRefs.current[1] = el }} className="text-purple-500 text-xs tracking-[0.2em] uppercase block" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                1984 — 2021
                                            </span>
                                            <div ref={(el) => { timelineDateOverlayRefs.current[1] = el }} className="absolute inset-0 bg-purple-700 z-10" style={{ transform: 'translateX(-100%)' }} />
                                        </div>

                                        <div ref={(el) => { timelineHeadingContainerRefs.current[1] = el }} className="relative overflow-hidden mb-6">
                                            <h3 ref={(el) => { timelineHeadingRefs.current[1] = el }} className="text-2xl sm:text-3xl text-white font-bold uppercase tracking-tight" style={{ fontFamily: 'var(--font-russo)' }}>
                                                Rivalries That <span className="text-purple-400">Defined</span> Eras
                                            </h3>
                                            <div ref={(el) => { timelineHeadingOverlayRefs.current[1] = el }} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                                        </div>

                                        <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            F1 has always been as much about the people as the cars. <span className="text-white font-medium">Senna vs Prost</span> — a psychological war as much as a racing one. Teammates who couldn&apos;t stand each other, battling for supremacy across multiple seasons. <span className="text-white font-medium">Schumacher vs Hill</span>, then vs Häkkinen — the Schumacher dominance era redefined what it meant to be a complete racing driver. And <span className="text-white font-medium">Hamilton vs Verstappen</span> — the 2021 season. Abu Dhabi. The last lap. These aren&apos;t just sports rivalries — they&apos;re the kind of stories that keep fans up at night, debating decades later.
                                        </p>
                                    </div>

                                    {/* Image RIGHT desktop */}
                                    <div className="hidden lg:block">
                                        <div ref={(el) => { timelineImgOuterRefs.current[1] = el }} className="relative w-full aspect-[16/10] rounded-sm overflow-hidden">
                                            <div ref={(el) => { timelineImgInnerRefs.current[1] = el }} className="absolute left-0 right-0" style={{ top: '-12%', bottom: '-12%' }}>
                                                <Image src="/img/f1-univers-monaco.png" alt="Monaco Grand Prix circuit" fill quality={90} sizes="45vw" className="object-cover object-center" />
                                                <div className="absolute inset-0 bg-black/20" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Item 3: F1 Today ── */}
                            <div className="relative pl-12 lg:pl-0">
                                <div ref={(el) => { timelineNodeRefs.current[2] = el }} className="absolute left-4 lg:left-1/2 top-7 w-3 h-3 z-10 rounded-full bg-purple-600 border-2 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                                <div ref={(el) => { timelineBlockRefs.current[2] = el }} className="bg-[#0f0f0f] border border-white/5 rounded-sm p-6 lg:p-8">
                                    <div className="relative overflow-hidden inline-block mb-3">
                                        <span ref={(el) => { timelineDateRefs.current[2] = el }} className="text-purple-500 text-xs tracking-[0.2em] uppercase block" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            2014 — Today
                                        </span>
                                        <div ref={(el) => { timelineDateOverlayRefs.current[2] = el }} className="absolute inset-0 bg-purple-700 z-10" style={{ transform: 'translateX(-100%)' }} />
                                    </div>

                                    <div ref={(el) => { timelineHeadingContainerRefs.current[2] = el }} className="relative overflow-hidden mb-6">
                                        <h3 ref={(el) => { timelineHeadingRefs.current[2] = el }} className="text-2xl sm:text-3xl text-white font-bold uppercase tracking-tight" style={{ fontFamily: 'var(--font-russo)' }}>
                                            F1 Today: Fast, Smart &amp; <span className="text-purple-400">Still Unpredictable</span>
                                        </h3>
                                        <div ref={(el) => { timelineHeadingOverlayRefs.current[2] = el }} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            Modern F1 is a different beast. <span className="text-white font-medium">Hybrid power units since 2014</span>. Thousands of sensors per car. Teams of hundreds of engineers analyzing data in real time. And yet — the sport still delivers the unexpected. Remember the <span className="italic text-purple-400">2008 Brazilian Grand Prix</span>? Lewis Hamilton needed to finish fifth to win his first championship. On the last lap, in the rain, he passed Timo Glock in the final corners. Champion by one point. That&apos;s F1.
                                        </p>
                                        <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            No matter how sophisticated the technology gets, the human element never disappears. And that&apos;s exactly what keeps us hooked.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ THE IMPACT ═══ */}
            <section className="relative z-10 w-full bg-[#0a0a0a] pt-24 lg:pt-40">
                {/* Intro two-column */}
                <div className="relative w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row pb-24 lg:pb-32">
                    {/* Left: title + text */}
                    <div className="w-full lg:w-[50%] px-6 sm:px-12 md:px-20 xl:px-32 relative z-20 flex flex-col justify-start">
                        <div ref={impactTitleContainerRef} className="relative overflow-hidden inline-block mb-10 mt-10 lg:mt-[5vw]">
                            <h2
                                ref={impactTitleRef}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-2xl"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                THE{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    IMPACT
                                </span>
                            </h2>
                            <div ref={impactTitleOverlayRef} className="absolute inset-0 bg-purple-600 z-30" style={{ transform: 'translateX(-100%)' }} />
                        </div>

                        <div ref={impactSubtitleContainerRef} className="relative overflow-hidden mb-10">
                            <h3
                                ref={impactSubtitleRef}
                                className="text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight"
                                style={{ fontFamily: 'var(--font-playfair)', opacity: 0 }}
                            >
                                The <span className="font-semibold text-gray-300 italic">Global Impact</span> of F1
                            </h3>
                            <div ref={impactSubtitleOverlayRef} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                        </div>

                        <div ref={impactIntroRef} className="flex flex-col gap-6">
                            <p className="text-white text-2xl sm:text-3xl font-bold leading-snug pr-4" style={{ fontFamily: 'var(--font-russo)' }}>
                                F1 doesn&apos;t just visit cities.{' '}
                                <span className="text-purple-400">It transforms them.</span>
                            </p>
                            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed pr-4" style={{ fontFamily: 'var(--font-barlow)' }}>
                                Twenty-four weekends a year, a travelling circus of engineers, drivers, and millions of fans descends on a new corner of the world. From the narrow streets of <span className="text-white font-medium">Monaco</span> to the neon skyline of <span className="text-white font-medium">Singapore</span>, each race is its own world — its own culture, its own energy.
                            </p>
                        </div>

                        <div ref={impactQuoteRef} className="mt-10 border-l-2 border-purple-600 pl-6">
                            <p className="text-white text-2xl sm:text-3xl font-semibold italic leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>
                                This isn&apos;t just sport.<br />
                                <span className="text-purple-400">It&apos;s spectacle.</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mt-8 mb-4">
                            <div className="w-8 h-[1px] bg-purple-700" />
                            <span className="text-purple-500 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>24 Races · 20 Nations</span>
                        </div>
                    </div>

                    {/* Right: stats grid */}
                    <div className="w-full lg:w-[50%] px-6 sm:px-12 md:px-20 xl:px-16 relative z-20 flex flex-col justify-center mt-16 lg:mt-[5vw]">
                        <div ref={impactStatsRef} className="grid grid-cols-2 gap-4 lg:gap-6">
                            {[
                                { number: '24', label: 'Races per Season', sub: 'across 5 continents' },
                                { number: '20+', label: 'Nations on the Grid', sub: 'drivers from every corner' },
                                { number: '500M+', label: 'Global Fans', sub: 'tuning in each year' },
                                { number: '75', label: 'Years of History', sub: 'since Silverstone 1950' },
                            ].map((stat) => (
                                <div key={stat.label} className="stat-item bg-[#0f0f0f] border border-white/5 rounded-sm p-6 lg:p-8 flex flex-col gap-2">
                                    <span className="text-purple-400 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none" style={{ fontFamily: 'var(--font-russo)' }}>
                                        {stat.number}
                                    </span>
                                    <span className="text-white text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        {stat.label}
                                    </span>
                                    <span className="text-gray-500 text-xs tracking-wide" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        {stat.sub}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ═══ CAROUSEL HEADER ═══ */}
                <div className="w-full max-w-[1920px] mx-auto px-6 sm:px-12 md:px-20 xl:px-32 mb-12 lg:mb-16">
                    <div ref={carouselHeadContainerRef} className="relative overflow-hidden inline-block mb-6">
                        <h2
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold uppercase tracking-tight leading-none"
                            style={{ fontFamily: 'var(--font-russo)' }}
                            ref={carouselHeadRef}
                        >
                            Every Race, Its Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700">Universe</span>
                        </h2>
                        <div ref={carouselHeadOverlayRef} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                    </div>
                    <p ref={carouselSubRef} className="text-gray-400 text-lg sm:text-xl max-w-2xl" style={{ fontFamily: 'var(--font-barlow)' }}>
                        Each Grand Prix reflects the soul of its host city. These five are F1&apos;s most iconic stages — use the arrows to explore them.
                    </p>
                </div>

                {/* ═══ FULL-PAGE CAROUSEL ═══ */}
                <div
                    ref={carouselContainerRef}
                    className="relative w-full overflow-hidden select-none"
                    style={{ height: '100vh' }}
                    onMouseMove={handleParallax}
                    onMouseLeave={resetParallax}
                >
                    <div ref={carouselInnerRef} className="flex h-full" style={{ willChange: 'transform' }}>
                        {circuitCards.map((card, i) => (
                            <div
                                key={card.city}
                                className="relative h-full flex-shrink-0 overflow-hidden"
                                style={{ width: '100vw' }}
                            >
                                {/* Parallax image wrapper (overscan so movement never reveals edges) */}
                                <div
                                    ref={(el) => { slideImageRefs.current[i] = el }}
                                    className="absolute will-change-transform"
                                    style={{ top: '-5%', left: '-5%', right: '-5%', bottom: '-5%' }}
                                >
                                    <Image src={card.img} alt={card.circuit} fill quality={100} sizes="110vw" className="object-cover object-center" priority={i === 0} />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />

                                <div
                                    ref={(el) => { slideContentRefs.current[i] = el }}
                                    className="absolute inset-0 flex flex-col justify-end px-8 sm:px-16 md:px-24 lg:px-32 pb-24 sm:pb-28 lg:pb-32 max-w-5xl"
                                >
                                    <div className="slide-anim flex items-center gap-3 mb-5">
                                        <span className="w-8 h-[1px] bg-purple-500" />
                                        <span className="text-purple-400 text-xs sm:text-sm tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            {card.country}
                                        </span>
                                    </div>
                                    <h2
                                        className="slide-anim text-white font-black tracking-tighter leading-[0.9] uppercase mb-3"
                                        style={{ fontFamily: 'var(--font-russo)', fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}
                                    >
                                        {card.city}
                                    </h2>
                                    <p className="slide-anim text-gray-300 text-sm sm:text-base mb-3 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        {card.circuit}
                                    </p>
                                    <p className="slide-anim text-white text-xl sm:text-2xl md:text-3xl italic mb-6 font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
                                        &ldquo;{card.tagline}&rdquo;
                                    </p>
                                    <p className="slide-anim text-gray-300/90 text-base sm:text-lg leading-relaxed max-w-2xl" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        {card.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Arrow left */}
                    <button
                        onClick={() => goToSlide(carouselIdx - 1)}
                        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:bg-purple-600/60 hover:border-purple-500 hover:scale-110"
                        aria-label="Previous circuit"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    {/* Arrow right */}
                    <button
                        onClick={() => goToSlide(carouselIdx + 1)}
                        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-300 hover:bg-purple-600/60 hover:border-purple-500 hover:scale-110"
                        aria-label="Next circuit"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>

                    {/* Navigation dots — active one is a pill that fills over the autoplay duration */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3 items-center">
                        {circuitCards.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                                className="flex items-center justify-center p-1"
                            >
                                {i === carouselIdx ? (
                                    <div className="relative h-[8px] w-[44px] rounded-full bg-white/25 overflow-hidden">
                                        <div ref={dotFillRef} className="absolute inset-y-0 left-0 rounded-full bg-purple-500" style={{ width: '0%' }} />
                                    </div>
                                ) : (
                                    <div className="h-[8px] w-[8px] rounded-full bg-white/30 transition-all duration-300 hover:bg-white/60" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Counter top-right */}
                    <div className="absolute top-8 right-8 sm:right-16 z-20 text-right pointer-events-none select-none">
                        <span className="text-white font-black" style={{ fontFamily: 'var(--font-russo)', fontSize: 'clamp(2rem, 4vw, 4rem)' }}>
                            {String(carouselIdx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-gray-500 text-xl">/{String(circuitCards.length).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* ═══ CLOSING: impact is everywhere ═══ */}
                <div ref={carouselClosingRef} className="w-full max-w-[1100px] mx-auto px-6 sm:px-12 md:px-20 py-24 lg:py-32 text-center">
                    <div className="closing-anim flex items-center justify-center gap-3 mb-8">
                        <div className="w-8 h-[1px] bg-purple-700" />
                        <span className="text-purple-500 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>And everywhere else</span>
                        <div className="w-8 h-[1px] bg-purple-700" />
                    </div>
                    <p className="closing-anim text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-6" style={{ fontFamily: 'var(--font-russo)' }}>
                        These five are F1&apos;s most iconic stages.
                    </p>
                    <p className="closing-anim text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                        But make no mistake — wherever the grid lands, from <span className="text-white font-medium">Melbourne</span> to <span className="text-white font-medium">Mexico City</span>, from <span className="text-white font-medium">São Paulo</span> to <span className="text-white font-medium">Bahrain</span>, a city is never quite the same again. Streets close, economies surge, and for one weekend, the whole world looks its way.{' '}
                        {/* <span className="text-purple-400 italic" style={{ fontFamily: 'var(--font-playfair)' }}>Every host city gets its own piece of the spectacle.</span> */}
                    </p>
                </div>

                {/* ═══ FROM THE TRACK TO YOUR CAR — sticky stacking cards ═══ */}
                <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 md:px-20 xl:px-32 pb-28 lg:pb-40">
                    {/* Intro */}
                    <div className="max-w-3xl mb-14 lg:mb-20">
                        <div ref={trackHeadContainerRef} className="relative overflow-hidden inline-block mb-8">
                            <h2
                                ref={trackHeadRef}
                                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold uppercase tracking-tight leading-none"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                From the Track to{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700">Your Car</span>
                            </h2>
                            <div ref={trackHeadOverlayRef} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                        </div>

                        <div ref={trackIntroRef} className="flex flex-col gap-6">
                            <p className="text-white text-xl sm:text-2xl font-semibold leading-snug" style={{ fontFamily: 'var(--font-playfair)' }}>
                                Here&apos;s something most people don&apos;t realize: <span className="text-purple-400 italic">F1 has shaped the car you drive.</span>
                            </p>
                            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                The sport isn&apos;t just entertainment — it&apos;s a technology lab running at <span className="text-white font-medium">300 km/h</span>. Innovations born on the track have quietly made their way into everyday vehicles.
                            </p>
                        </div>
                    </div>

                    {/* Sticky stacking cards */}
                    <div className="relative">
                        {trackCards.map((card, i) => (
                            <div
                                key={card.num}
                                className="sticky pb-6"
                                style={{ top: `calc(6rem + ${i * 3.5}rem)` }}
                            >
                                <div className="relative h-[44vh] min-h-[320px] rounded-2xl overflow-hidden bg-[#0f0f0f] border border-white/10 shadow-[0_-12px_50px_rgba(0,0,0,0.6)]">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} via-[#0f0f0f] to-[#0a0a0a]`} />
                                    <div className="relative flex flex-col md:flex-row h-full">
                                        {/* Left visual */}
                                        <div className="md:w-[38%] flex items-center justify-center relative px-8 py-10 md:py-0 overflow-hidden">
                                            <div
                                                ref={(el) => { trackIconRefs.current[i] = el }}
                                                className="relative w-24 h-24 sm:w-28 sm:h-28 text-purple-300"
                                                style={{ visibility: 'hidden' }}
                                            >
                                                {card.icon}
                                            </div>
                                        </div>

                                        {/* Right text */}
                                        <div className="md:w-[62%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 pb-10 md:py-0">
                                            <span className="block w-8 h-[1px] bg-purple-700 mb-5" />
                                            <h3 className="text-3xl sm:text-4xl lg:text-5xl text-white font-bold uppercase tracking-tight mb-5" style={{ fontFamily: 'var(--font-russo)' }}>
                                                {card.title}
                                            </h3>
                                            <p className="text-gray-300/90 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                {card.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Closing line */}
                    <p
                        ref={trackClosingRef}
                        className="text-center text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mt-20 lg:mt-28"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        So yes — even your everyday car carries a little{' '}
                        <span className="text-purple-400 italic">F1 DNA.</span>
                    </p>
                </div>

                {/* ═══ BEYOND RACING — CULTURE, POWER & SOFT POWER ═══ */}
                <div className="relative w-full overflow-hidden pt-4 pb-28 lg:pb-40">
                    {/* radial glow backdrop */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse 55% 45% at 82% 4%, rgba(126,34,206,0.13), transparent 70%)' }}
                    />

                    {/* Header */}
                    <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 md:px-20 xl:px-32">
                        <div ref={beyondLabelRef} className="flex items-center gap-3 mb-8" style={{ opacity: 0 }}>
                            <span className="w-10 h-[1px] bg-purple-600" />
                        </div>
                        <div ref={beyondHeadContainerRef} className="relative overflow-hidden inline-block mb-6">
                            <h2
                                ref={beyondHeadRef}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold uppercase tracking-tight leading-none drop-shadow-2xl"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                Beyond{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700">Racing</span>
                            </h2>
                            <div ref={beyondHeadOverlayRef} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                        </div>
                        <h3
                            ref={beyondSubRef}
                            className="text-2xl sm:text-3xl md:text-4xl text-gray-300 font-normal italic leading-tight max-w-3xl"
                            style={{ fontFamily: 'var(--font-playfair)', opacity: 0 }}
                        >
                            Culture, Power &amp; Soft Power
                        </h3>
                    </div>

                    {/* ── PART 1 — The Cultural Icon ── */}
                    <div className="relative w-full max-w-[1400px] mx-auto px-6 sm:px-12 md:px-20 xl:px-32 mt-20 lg:mt-32">
                        {/* ghost word */}
                        <div ref={iconWordRef} aria-hidden className="pointer-events-none absolute -top-16 right-0 z-0 select-none leading-none">
                            <span
                                className="font-black tracking-tighter text-transparent"
                                style={{ fontFamily: 'var(--font-russo)', fontSize: 'clamp(7rem, 21vw, 21rem)', WebkitTextStroke: '1px rgba(168,85,247,0.10)' }}
                            >
                                ICON
                            </span>
                        </div>

                        <div className="relative z-10 grid lg:grid-cols-[420px_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
                            {/* Magazine cover */}
                            <div
                                ref={coverOuterRef}
                                className="relative w-full aspect-[3/4] mx-auto lg:mx-0 rounded-sm overflow-hidden border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.75)]"
                            >
                                <div ref={coverInnerRef} className="absolute inset-0">
                                    <Image src="/img/hamilton.png" alt="Lewis Hamilton" fill quality={95} sizes="420px" className="object-cover object-center" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/40" />
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-transparent mix-blend-overlay" />
                                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                                    <span className="w-6 h-[1px] bg-purple-500" />
                                    <div>
                                        <span
                                            className="block text-white font-black uppercase leading-[0.82] tracking-tighter"
                                            style={{ fontFamily: 'var(--font-russo)', fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)' }}
                                        >
                                            Lewis<br />Hamilton
                                        </span>
                                        <span className="mt-3 block text-purple-200/80 text-xs tracking-[0.15em] uppercase" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            One face of a whole generation
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Text */}
                            <div className="relative min-w-0">
                                <span className="block w-10 h-[2px] bg-purple-600 mb-6" />

                                <div ref={hamiltonHeadContainerRef} className="relative overflow-hidden inline-block mb-7">
                                    <h3 ref={hamiltonHeadRef} className="text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight" style={{ fontFamily: 'var(--font-playfair)', opacity: 0 }}>
                                        More Than a <span className="italic font-semibold text-gray-300">Driver</span>
                                    </h3>
                                    <div ref={hamiltonHeadOverlayRef} className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                                </div>

                                <div ref={hamiltonTextRef} className="flex flex-col gap-6 max-w-xl">
                                    <p className="text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        Lewis Hamilton doesn&apos;t just win races. He walks the <span className="text-white font-medium">Met Gala</span> red carpet, collaborates with <span className="text-white font-medium">luxury fashion houses</span>, and uses his platform to speak on issues bigger than motorsport.
                                    </p>
                                    <p className="text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                        He&apos;s become a <span className="text-purple-400 italic" style={{ fontFamily: 'var(--font-playfair)' }}>global icon</span> — and he&apos;s far from alone. From <span className="text-white font-medium">Max Verstappen</span> to <span className="text-white font-medium">Charles Leclerc</span>, today&apos;s drivers exist in a cultural space far beyond the paddock.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── PART 2 — Soft Power (sober, cinematic bg) ── */}
                    <div
                        ref={softBgSectionRef}
                        onMouseMove={handleSoftBgParallax}
                        onMouseLeave={resetSoftBgParallax}
                        className="relative w-full overflow-hidden py-24 lg:py-32 mt-24 lg:mt-36"
                    >
                        {/* cinematic glow blobs */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden">
                            <div
                                ref={(el) => { softBlobRefs.current[0] = el }}
                                className="absolute will-change-transform rounded-full"
                                style={{
                                    width: '46vw', height: '46vw', left: '6%', top: '8%',
                                    background: 'radial-gradient(circle, rgba(168,85,247,0.22), transparent 70%)',
                                    filter: 'blur(60px)',
                                }}
                            />
                            <div
                                ref={(el) => { softBlobRefs.current[1] = el }}
                                className="absolute will-change-transform rounded-full"
                                style={{
                                    width: '38vw', height: '38vw', right: '4%', top: '30%',
                                    background: 'radial-gradient(circle, rgba(126,34,206,0.20), transparent 70%)',
                                    filter: 'blur(70px)',
                                }}
                            />
                            <div
                                ref={(el) => { softBlobRefs.current[2] = el }}
                                className="absolute will-change-transform rounded-full"
                                style={{
                                    width: '30vw', height: '30vw', left: '32%', bottom: '0%',
                                    background: 'radial-gradient(circle, rgba(192,132,252,0.16), transparent 70%)',
                                    filter: 'blur(60px)',
                                }}
                            />
                            {/* film grain */}
                            <div
                                className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                                style={{
                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                                }}
                            />
                            {/* vignette */}
                            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
                        </div>

                        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 sm:px-12 text-center">
                            <div ref={softStatementRef}>
                                <span className="statement-line inline-flex items-center gap-3 text-purple-500 text-xs tracking-[0.3em] uppercase mb-7" style={{ fontFamily: 'var(--font-outfit)' }}>
                                    <span className="w-16 h-[1px] bg-purple-700" />
                                </span>
                                <p className="statement-line text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.15] tracking-tight mb-6" style={{ fontFamily: 'var(--font-russo)' }}>
                                    And the sport itself? It&apos;s become a stage for{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700">soft power.</span>
                                </p>
                                <p className="statement-line text-gray-400 text-base sm:text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                    Governments compete to host races. Billionaires invest in teams. New circuits in <span className="text-white font-medium">Saudi Arabia</span>, <span className="text-white font-medium">Las Vegas</span> and <span className="text-white font-medium">Miami</span> aren&apos;t just business decisions — <span className="text-white font-medium">they&apos;re statements.</span>
                                </p>
                            </div>

                            <div ref={softClosingRef} className="mt-12 pt-10 border-t border-white/10">
                                <p className="soft-closing-anim text-gray-400 text-base sm:text-lg leading-relaxed mb-4" style={{ fontFamily: 'var(--font-barlow)' }}>
                                    F1 is now one of the most watched sports on the planet.
                                </p>
                                <p className="soft-closing-anim text-white text-3xl sm:text-4xl md:text-5xl font-semibold italic leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    And <span className="text-purple-400">everyone</span> wants a piece of it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ THE FANS — hover to reveal ═══ */}
            <section className="relative z-10 w-full bg-[#0a0a0a]">
                <div ref={fansPinRef} className="relative h-screen w-full overflow-hidden">
                    {/* Ambient glow */}
                    <div
                        className="pointer-events-none absolute inset-0 z-0"
                        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(168,85,247,0.10), transparent 70%)' }}
                    />

                    {/* Overlapping fan-crowd image cluster */}
                    <div className="absolute inset-0 z-[1]">
                        <div
                            ref={(el) => { fansImgRefs.current[0] = el }}
                            onMouseEnter={() => setHoveredFan(0)}
                            onMouseLeave={() => setHoveredFan(null)}
                            className="absolute top-[4%] left-[2%] w-[55%] sm:w-[36%] aspect-[16/10] rounded-sm overflow-hidden border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.75)] cursor-pointer transition-all duration-500"
                            style={{
                                transform: hoveredFan === 0 ? 'scale(1.04)' : 'scale(1)',
                                borderColor: hoveredFan === 0 ? 'rgba(168,85,247,0.6)' : undefined,
                                zIndex: hoveredFan === 0 ? 10 : undefined,
                            }}
                        >
                            <Image
                                src={fanImages[0].src} alt={fanImages[0].alt} fill quality={95} sizes="50vw"
                                className="object-cover transition-[filter] duration-500"
                                style={{ objectPosition: fanImages[0].pos, filter: hoveredFan !== null && hoveredFan !== 0 ? 'grayscale(1) brightness(0.45)' : fanImages[0].filter }}
                            />
                            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500" style={{ opacity: hoveredFan === 0 ? 0 : 1 }} />
                        </div>
                        <div
                            ref={(el) => { fansImgRefs.current[1] = el }}
                            onMouseEnter={() => setHoveredFan(1)}
                            onMouseLeave={() => setHoveredFan(null)}
                            className="absolute top-[28%] left-[22%] sm:top-[24%] sm:left-[32%] w-[55%] sm:w-[36%] aspect-[16/10] rounded-sm overflow-hidden border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.75)] cursor-pointer transition-all duration-500"
                            style={{
                                transform: hoveredFan === 1 ? 'scale(1.04)' : 'scale(1)',
                                borderColor: hoveredFan === 1 ? 'rgba(168,85,247,0.6)' : undefined,
                                zIndex: hoveredFan === 1 ? 10 : undefined,
                            }}
                        >
                            <Image
                                src={fanImages[1].src} alt={fanImages[1].alt} fill quality={95} sizes="45vw"
                                className="object-cover transition-[filter] duration-500"
                                style={{ objectPosition: fanImages[1].pos, filter: hoveredFan !== null && hoveredFan !== 1 ? 'grayscale(1) brightness(0.45)' : fanImages[1].filter }}
                            />
                            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500" style={{ opacity: hoveredFan === 1 ? 0 : 1 }} />
                        </div>
                        <div
                            ref={(el) => { fansImgRefs.current[2] = el }}
                            onMouseEnter={() => setHoveredFan(2)}
                            onMouseLeave={() => setHoveredFan(null)}
                            className="absolute top-[44%] right-[2%] w-[40%] sm:w-[36%] aspect-[16/10] rounded-sm overflow-hidden border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.75)] hidden sm:block cursor-pointer transition-all duration-500"
                            style={{
                                transform: hoveredFan === 2 ? 'scale(1.04)' : 'scale(1)',
                                borderColor: hoveredFan === 2 ? 'rgba(168,85,247,0.6)' : undefined,
                                zIndex: hoveredFan === 2 ? 10 : undefined,
                            }}
                        >
                            <Image
                                src={fanImages[2].src} alt={fanImages[2].alt} fill quality={95} sizes="30vw"
                                className="object-cover transition-[filter] duration-500"
                                style={{ objectPosition: fanImages[2].pos, filter: hoveredFan !== null && hoveredFan !== 2 ? 'grayscale(1) brightness(0.45)' : fanImages[2].filter }}
                            />
                            <div className="absolute inset-0 bg-black/20 transition-opacity duration-500" style={{ opacity: hoveredFan === 2 ? 0 : 1 }} />
                        </div>
                    </div>

                    {/* Title — visible while no image is hovered */}
                    <div
                        className="absolute inset-0 z-[5] flex items-center justify-center px-6 pointer-events-none transition-opacity duration-400"
                        style={{ opacity: hoveredFan === null ? 1 : 0 }}
                    >
                        <div className="relative overflow-hidden inline-block">
                            <h2
                                ref={fansTitleRef}
                                className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold text-white uppercase tracking-tight leading-none text-center drop-shadow-2xl"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                THE{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    FANS
                                </span>
                            </h2>
                            <div ref={fansTitleOverlayRef} className="absolute inset-0 bg-purple-600 z-30" style={{ transform: 'translateX(-100%)' }} />
                        </div>
                    </div>

                    {/* Text for image 0 — to the right of the top-left image */}
                    <div
                        className="absolute top-[4%] left-[54%] sm:left-[40%] right-[4%] z-[6] flex items-center pointer-events-none transition-opacity duration-400"
                        style={{ height: '34%', opacity: hoveredFan === 0 ? 1 : 0 }}
                    >
                        <p className="text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                            {fan0Text}
                        </p>
                    </div>

                    {/* Text for image 1 — split left / right around the middle image */}
                    <div
                        className="absolute top-[20%] left-[2%] w-[38%] sm:w-[28%] z-[6] flex flex-col gap-6 pointer-events-none transition-opacity duration-400"
                        style={{ opacity: hoveredFan === 1 ? 1 : 0 }}
                    >
                        {fan1LeftParas.map((p, i) => (
                            <p key={i} className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                {p}
                            </p>
                        ))}
                    </div>
                    <div
                        className="absolute top-[20%] right-[4%] w-[36%] sm:w-[28%] z-[6] flex items-start text-right pointer-events-none transition-opacity duration-400"
                        style={{ opacity: hoveredFan === 1 ? 1 : 0 }}
                    >
                        <p className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                            {fan1RightText}
                        </p>
                    </div>

                    {/* Text for image 2 — to the left of the bottom-right image */}
                    <div
                        className="absolute top-[32%] left-[4%] w-[46%] sm:w-[40%] z-[6] flex flex-col gap-6 pointer-events-none transition-opacity duration-400"
                        style={{ opacity: hoveredFan === 2 ? 1 : 0 }}
                    >
                        {fan2Paras.map((p, i) => (
                            <p key={i} className="text-gray-400 text-lg leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                {p}
                            </p>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
