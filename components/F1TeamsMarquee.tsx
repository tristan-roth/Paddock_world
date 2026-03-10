'use client'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const teams = [
    "MERCEDES",
    "RED BULL",
    "FERRARI",
    "McLAREN",
    "ASTON MARTIN",
    "ALPINE",
    "WILLIAMS",
    "VCARB",
    "SAUBER",
    "HAAS"
]

// Duplicate the list so the second copy creates a seamless loop
const teamsDouble = [...teams, ...teams]

export default function F1TeamsMarquee() {
    const trackRef = useRef<HTMLDivElement>(null)
    const tlRef = useRef<gsap.core.Timeline | null>(null)

    useEffect(() => {
        if (!trackRef.current) return

        const ctx = gsap.context(() => {
            // Animate the WHOLE track from 0% to -50%
            // Since the track contains two identical copies, position -50% looks exactly like 0%
            // → perfectly seamless infinite loop
            const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })
            tl.fromTo(
                trackRef.current,
                { xPercent: 0 },
                { xPercent: -50, duration: 20 }
            )
            tlRef.current = tl

            // Reverse/forward based on scroll direction
            ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    const targetTimeScale = self.direction === 1 ? 1 : -1
                    gsap.to(tl, {
                        timeScale: targetTimeScale,
                        duration: 0.4,
                        ease: 'power1.inOut',
                    })
                },
            })
        })

        return () => ctx.revert()
    }, [])

    return (
        <div
            className="absolute left-0 w-screen max-w-[100vw] overflow-hidden bg-[#050505] py-10 border-y border-white/5 flex items-center shadow-2xl pointer-events-auto"
            style={{ zIndex: 9999 }}
        >
            {/* Single track holding 2 copies – width is 200% so -50% = one full copy */}
            <div
                ref={trackRef}
                className="flex w-max will-change-transform"
            >
                {teamsDouble.map((team, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-center min-w-[200px] md:min-w-[250px] px-4"
                    >
                        <span
                            className="text-xl md:text-2xl font-black uppercase tracking-[0.25em] text-white/40 hover:text-white/100 transition-colors duration-300 select-none cursor-default"
                            style={{ fontFamily: 'var(--font-russo)' }}
                        >
                            {team}
                        </span>
                        {/* Decorative separator */}
                        <span className="ml-8 text-purple-700/50 text-sm select-none">✦</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
