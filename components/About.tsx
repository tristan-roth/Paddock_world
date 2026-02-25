'use client'
import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const titleOverlayRef = useRef<HTMLDivElement>(null)
    const bloc1Ref = useRef<HTMLDivElement>(null)
    const bloc2Ref = useRef<HTMLDivElement>(null)
    const portraitRef = useRef<HTMLDivElement>(null)
    const gradientSpanRef = useRef<HTMLSpanElement>(null)
    const mousePos = useRef({ x: 50, y: 50 })
    const animatedPos = useRef({ x: 50, y: 50 })
    const rafId = useRef<number>(0)

    // Smooth mouse-reactive gradient with requestAnimationFrame
    useEffect(() => {
        const section = sectionRef.current
        const span = gradientSpanRef.current
        if (!section || !span) return

        const onMouseMove = (e: MouseEvent) => {
            const rect = section.getBoundingClientRect()
            mousePos.current = {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
            }
        }

        const animate = () => {
            // Lerp for smooth following
            animatedPos.current.x += (mousePos.current.x - animatedPos.current.x) * 0.08
            animatedPos.current.y += (mousePos.current.y - animatedPos.current.y) * 0.08

            const { x, y } = animatedPos.current
            const angle = 90 + (x - 50) * 1.2 // ±60° rotation
            const glowIntensity = 0.6 + Math.abs(x - 50) / 100
            const hueShift = Math.round(260 + (x - 50) * 0.8) // shift between purple/pink hues

            span.style.backgroundImage = `linear-gradient(${angle}deg, #a855f7, #ec4899, #818cf8, #a855f7)`
            span.style.backgroundSize = '300% 300%'
            span.style.backgroundPosition = `${x}% ${y}%`
            span.style.filter = `drop-shadow(0 0 ${12 + Math.abs(x - 50) * 0.4}px hsla(${hueShift}, 80%, 65%, ${glowIntensity}))`

            rafId.current = requestAnimationFrame(animate)
        }

        section.addEventListener('mousemove', onMouseMove)
        rafId.current = requestAnimationFrame(animate)

        return () => {
            section.removeEventListener('mousemove', onMouseMove)
            cancelAnimationFrame(rafId.current)
        }
    }, [])

    useEffect(() => {
        // Animation du titre principal (block reveal horizontal)
        if (titleRef.current && titleOverlayRef.current) {
            gsap.set(titleRef.current, { opacity: 0 })

            const titleTl = gsap.timeline({
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: 'top 75%',
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

        // Animation du premier bloc (arrive de la gauche)
        if (bloc1Ref.current) {
            gsap.fromTo(bloc1Ref.current,
                { opacity: 0, x: -200 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: bloc1Ref.current,
                        start: "top 75%",
                        end: "top 25%",
                        scrub: 1.5,
                    }
                }
            )
        }

        // Animation du deuxième bloc (arrive de la droite)
        if (bloc2Ref.current) {
            gsap.fromTo(bloc2Ref.current,
                { opacity: 0, x: 200 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: bloc2Ref.current,
                        start: "top 75%",
                        end: "top 25%",
                        scrub: 1.5,
                    }
                }
            )
        }

        // Animation du portrait (clip-path reveal + scale)
        if (portraitRef.current) {
            gsap.set(portraitRef.current, {
                clipPath: 'inset(100% 0% 0% 0%)',
                scale: 1.15,
                opacity: 0,
            })
            gsap.to(portraitRef.current, {
                clipPath: 'inset(0% 0% 0% 0%)',
                scale: 1,
                opacity: 1,
                duration: 1.8,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: portraitRef.current,
                    start: 'top 60%',
                    end: 'top 15%',
                    scrub: 1.5,
                },
            })
        }
    }, [])

    return (
        <section ref={sectionRef} className="min-h-screen flex flex-col items-center justify-center p-8 md:p-20 relative z-10 gap-24" id="about">
            {/* Titre principal */}
            <div className="reveal-block relative overflow-hidden">
                <h2
                    ref={titleRef}
                    className="reveal-text text-5xl sm:text-6xl md:text-8xl font-normal text-white tracking-wider uppercase text-center relative z-20"
                    style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                >
                    What is{' '}
                    <span
                        ref={gradientSpanRef}
                        className="bg-clip-text text-transparent"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, #a855f7, #ec4899, #818cf8, #a855f7)',
                            backgroundSize: '300% 300%',
                            backgroundPosition: '50% 50%',
                        }}
                    >
                        Paddock World
                    </span>
                    ?
                </h2>
                <div
                    ref={titleOverlayRef}
                    className="reveal-overlay absolute inset-0 bg-purple-600 z-30"
                    style={{ transform: 'translateX(-100%)' }}
                />
            </div>

            <div className="max-w-6xl w-full">
                {/* Premier bloc : Titre à gauche, texte à droite */}
                <div ref={bloc1Ref} className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="md:w-1/3 flex flex-col gap-6">
                        <h3 className="text-base font-bold uppercase tracking-widest text-purple-700 mb-2 border-l-4 border-purple-700 pl-6">How it came to life</h3>
                        <div
                            ref={portraitRef}
                            className="relative overflow-hidden rounded-lg border-2 border-purple-700/30"
                            style={{ aspectRatio: '3/4' }}
                        >
                            <Image
                                src="/img/portrait.png"
                                alt="Portrait"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <p className="text-2xl md:text-3xl leading-relaxed text-gray-200 font-light">
                            After graduating from my business Master I had a hard time finding a meaningful job. I had that idea to bring all information for fans into one place and I thought that it was the perfect time to do it.
                            I wanted to make a motorsport website more accessible and engaging for new fans — combining fun, educational content with curated resources and creator spotlights. It's my way of turning passion into action and helping people connect with the sport in a meaningful way.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl w-full mt-16">
                {/* Deuxième bloc : Texte à gauche, titre à droite */}
                <div ref={bloc2Ref} className="flex flex-col md:flex-row-reverse gap-16 items-start">
                    <div className="md:w-1/3">
                        <h3 className="text-base font-bold uppercase tracking-widest text-purple-700 mb-6 border-l-4 border-purple-700 pl-6">The reason for Paddock World</h3>
                    </div>
                    <div className="md:w-2/3">
                        <p className="text-2xl md:text-3xl leading-relaxed text-gray-200 font-light">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
