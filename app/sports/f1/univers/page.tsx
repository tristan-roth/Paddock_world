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
        </main>
    )
}
