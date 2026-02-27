'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import RevealText from '@/components/RevealText'
import Navbar from '@/components/Navbar'
import F1TeamsMarquee from '@/components/F1TeamsMarquee'

gsap.registerPlugin(ScrollTrigger)

/* ─── Image data ─── */
const heroImages = [
    { src: '/img/f1-univers-hero.png', alt: 'Formula 1 racing action' },
    { src: '/img/f1-univers-monaco.png', alt: 'Monaco Grand Prix historic circuit' },
    { src: '/img/f1-univers-cockpit.png', alt: 'F1 cockpit technology' },
    { src: '/img/f1-univers-fans.png', alt: 'F1 fans cheering with flares' },
    { src: '/img/f1-univers-night.png', alt: 'F1 night race under the lights' },
    { src: '/img/f1-univers-pitstop.png', alt: 'F1 pit stop action' },
]

export default function UniversPage() {
    /* ─── Refs ─── */
    const contentSectionRef = useRef<HTMLElement>(null)
    const imgWrapperRef = useRef<HTMLDivElement>(null)
    const imageRefs = useRef<(HTMLDivElement | null)[]>([])
    const bgTextRef = useRef<HTMLDivElement>(null)
    const bgTextH1Ref = useRef<HTMLHeadingElement>(null)
    const smallTitleRef = useRef<HTMLHeadingElement>(null)
    const smallOverlayRef = useRef<HTMLDivElement>(null)

    /* ─── GSAP animations ─── */
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial reveal for the big background text "UNIVERS"
            // We animate the h1 directly rather than the container so opacity works correctly
            gsap.fromTo(
                bgTextH1Ref.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 2, ease: 'power3.out', delay: 0.1 }
            )

            // Block reveal for "Explore Sports" style title
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

            /* === SCROLL-DRIVEN IMAGE LAYER === */
            if (contentSectionRef.current && imgWrapperRef.current && imageRefs.current.length > 0) {
                const images = imageRefs.current.filter(Boolean) as HTMLDivElement[]
                const totalImages = images.length

                // Wrap images setup
                images.forEach((img, i) => {
                    gsap.set(img, { opacity: i === 0 ? 1 : 0 })
                })

                // Create the master scroll trigger timeline for the image container parallax/scale
                const imgContainerTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: contentSectionRef.current,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 1, // Smooth scrub
                    },
                })

                // Parallax the huge UNIVERS text container
                gsap.to(bgTextRef.current, {
                    y: -200,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: contentSectionRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                })

                // Image animation:
                // Start: un peu plus petit que l'écran (ex: 85% width) positionné à droite
                // Fin: Beaucoup plus petit (ex: 45% width) et centré sur l'écran.
                imgContainerTl.to(imgWrapperRef.current, {
                    scale: 0.45,       // Se réduit de plus en plus
                    xPercent: -45,     // Se déplace fortement vers la gauche (jusqu'au centre)
                    y: window.innerHeight * 0.4, // Descend progressivement avec le scroll
                    ease: 'none'
                }, 0)

                // The crossfade animations happening inside the wrapper over the scroll distance
                for (let i = 0; i < totalImages - 1; i++) {
                    const segmentStart = i / (totalImages - 1)
                    const transitionDuration = 1 / (totalImages - 1)

                    imgContainerTl.to(
                        images[i],
                        { opacity: 0, duration: transitionDuration * 0.5, ease: 'power1.inOut' },
                        segmentStart
                    )
                    imgContainerTl.to(
                        images[i + 1],
                        { opacity: 1, duration: transitionDuration * 0.5, ease: 'power1.inOut' },
                        segmentStart
                    )
                }
            }
        })

        return () => ctx.revert()
    }, [])

    return (
        // Reset to dark theme #0a0000
        <main className="relative w-full bg-[#0a0000] min-h-[500vh]">
            <Navbar shouldAnimate disableEntryAnimation />

            {/* BIG BACKGROUND TEXT - Placed absolute at the top so it doesn't stay fixed the whole way down */}
            {/* z-0 ensures it's behind the text but above the background */}
            <div
                ref={bgTextRef}
                className="absolute top-24 left-0 w-full flex justify-center z-0 overflow-visible px-4 select-none pointer-events-none"
            >
                <h1
                    ref={bgTextH1Ref}
                    className="text-[#202020] font-black tracking-tighter leading-[0.8] text-center w-full"
                    style={{
                        fontFamily: 'var(--font-russo)',
                        fontSize: '18vw', // very large viewport relative text
                        // Opacity is handled by GSAP on this element now
                    }}
                >
                    UNIVERS
                </h1>
            </div>

            {/* ═══════════════════════════════════════════════════
                MAIN CONTENT + HERO-IMG-LAYER
            ═══════════════════════════════════════════════════ */}
            {/* The negative margin brings the content UP so 'THE HISTORY' overlaps the bottom of 'UNIVERS' */}
            {/* Reduced from pt-[20vw] to pt-[12vw] to force overlap */}
            <section
                ref={contentSectionRef as React.RefObject<HTMLElement>}
                className="relative z-10 w-full pt-[12vw]"
            >
                {/* 
                  Extra tall container to allow plenty of scrolling.
                  Grid layout: text on left, pinning container on right.
                */}
                <div className="relative w-full max-w-[1920px] mx-auto min-h-[400vh] flex flex-col lg:flex-row">

                    {/* ── LEFT COLUMN: Text content ── */}
                    {/* Increased width to 50% for more text breathing room */}
                    <div className="w-full lg:w-[50%] px-6 sm:px-12 md:px-20 xl:px-32 relative z-20 flex flex-col justify-start">

                        {/* Title styled EXACTLY like EXPLORE SPORT block reveal */}
                        {/* THE HISTORY intentionally overlapping UNIVERS */}
                        <div className="relative overflow-hidden inline-block mb-10 mt-10 lg:mt-[5vw]">
                            <h2
                                ref={smallTitleRef}
                                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-2xl"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                THE{' '}
                                <span
                                    className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    HISTORY
                                </span>
                            </h2>
                            <div
                                ref={smallOverlayRef}
                                className="absolute inset-0 bg-purple-600 z-30"
                                style={{ transform: 'translateX(-100%)' }}
                            />
                        </div>

                        {/* Title text */}
                        <h3
                            className="text-3xl sm:text-4xl md:text-5xl text-white font-normal leading-tight mb-8 w-full"
                            style={{ fontFamily: 'var(--font-playfair)' }}
                        >
                            A Sport with <span className="font-semibold text-gray-300 italic">History</span> and <span className="font-semibold text-gray-300 italic">Heart</span>
                        </h3>

                        {/* Paragraph 1 */}
                        <p
                            className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-6 w-full pr-4"
                            style={{ fontFamily: 'var(--font-barlow)' }}
                        >
                            Formula 1 was officially established in 1950, but its roots trace back even further to the
                            early 20th century. Before it became the highly regulated and globally recognized sport we
                            know today, motor racing was more chaotic and dangerous — with various Grand Prix events held
                            across Europe under inconsistent rules. The{' '}
                            <span className="text-white font-medium">FIA (Fédération Internationale de l&apos;Automobile)</span>{' '}
                            stepped in to create a single set of rules, known as the{' '}
                            <span className="italic text-purple-400">&quot;Formula,&quot;</span>{' '}
                            to standardize competition.
                        </p>

                        {/* Paragraph 2 */}
                        <p
                            className="text-gray-400 text-lg sm:text-xl leading-relaxed mb-16 w-full pr-4"
                            style={{ fontFamily: 'var(--font-barlow)' }}
                        >
                            The first ever official Formula 1 World Championship race took place on{' '}
                            <span className="text-white font-medium">May 13, 1950</span>, at{' '}
                            <span className="text-white font-medium">Silverstone Circuit</span> in the United Kingdom.
                            That race, held on a converted Royal Air Force airfield, was won by{' '}
                            <span className="italic text-purple-400">Giuseppe Farina</span> driving for{' '}
                            <span className="italic text-purple-400">Alfa Romeo</span> — setting the tone for decades of
                            fierce competition and technological innovation.
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="w-8 h-[1px] bg-purple-700" />
                            <span
                                className="text-purple-500 text-xs tracking-[0.2em] uppercase"
                                style={{ fontFamily: 'var(--font-outfit)' }}
                            >
                                Since 1950
                            </span>
                        </div>

                        {/* Scrolling F1 Teams Marquee added here */}
                        <div className="mt-20 lg:mt-32 block w-[100vw] pointer-events-auto z-[9999]" style={{ marginLeft: 'calc(-50vw + 50%)' }}>
                            <F1TeamsMarquee />
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Sticky hero-img-layer ── */}
                    {/* Width adjusted symmetrically to 50% */}
                    <div className="w-full lg:w-[50%] hidden lg:block relative h-full pointer-events-none">
                        <div className="sticky top-0 h-screen w-full flex items-center justify-end overflow-visible pr-0">

                            {/* 
                                Animation target: 
                                - Starts large (but not full screen, say 85% width) 
                                - Origin is right-center so scaling visually shrinks it from left to right initially 
                            */}
                            <div
                                ref={imgWrapperRef}
                                className="relative w-[90%] h-[80%] mt-[5vw] transform-gpu origin-right"
                            >
                                {heroImages.map((img, i) => (
                                    <div
                                        key={img.src}
                                        ref={(el) => { imageRefs.current[i] = el }}
                                        className="absolute inset-0 w-full h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden"
                                        style={{ opacity: i === 0 ? 1 : 0 }}
                                    >
                                        <Image
                                            src={img.src}
                                            alt={img.alt}
                                            fill
                                            quality={95}
                                            sizes="60vw"
                                            className="object-cover object-center"
                                            priority={i === 0}
                                        />
                                        {/* Subtle dark overlay for dark mode consistency */}
                                        <div className="absolute inset-0 bg-black/20" />
                                    </div>
                                ))}

                                {/* Image progression indicator overlay */}
                                <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                                    {heroImages.map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-[2px] h-6 rounded-full transition-all duration-500 shadow-sm"
                                            style={{
                                                background: i === 0
                                                    ? 'rgba(168, 85, 247, 0.9)' // purple-500
                                                    : 'rgba(255, 255, 255, 0.2)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Mobile: Static display */}
                    <div className="block lg:hidden w-full px-6 pb-20 z-20">
                        <div className="relative w-full aspect-[4/5] mt-[10vw] rounded-sm overflow-hidden shadow-2xl mx-auto max-w-lg">
                            <Image
                                src="/img/f1-univers-hero.png"
                                alt="Formula 1 racing action"
                                fill
                                quality={90}
                                sizes="100vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30" />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
