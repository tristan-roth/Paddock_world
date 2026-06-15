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

        let currentDirection = 1

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } })
            tl.fromTo(
                trackRef.current,
                { xPercent: 0 },
                { xPercent: -50, duration: 20 }
            )
            tlRef.current = tl

            ScrollTrigger.create({
                start: 0,
                end: 'max',
                onUpdate: (self) => {
                    const newDirection = self.direction === 1 ? 1 : -1
                    if (newDirection === currentDirection) return
                    currentDirection = newDirection
                    gsap.to(tl, {
                        timeScale: newDirection,
                        duration: 0.5,
                        ease: 'power2.inOut',
                        overwrite: true,
                    })
                },
            })
        })

        return () => ctx.revert()
    }, [])

    return (
        <div
            className="relative w-full overflow-hidden py-10 border-y border-white/5 flex items-center pointer-events-auto"
        >
            {/* Single track holding 2 copies – width is 200% so -50% = one full copy */}
            <div
                ref={trackRef}
                className="flex w-max will-change-transform"
            >
                {teamsDouble.map((team, idx) => (
                    <React.Fragment key={idx}>
                        <div className="flex items-center justify-center px-6">
                            <span
                                className="text-xl md:text-2xl font-black uppercase tracking-[0.25em] text-white/40 hover:text-white/100 transition-colors duration-300 select-none cursor-default whitespace-nowrap"
                                style={{ fontFamily: 'var(--font-russo)' }}
                            >
                                {team}
                            </span>
                        </div>
                        <div className="flex items-center px-4">
                            <span className="text-purple-700/50 text-sm select-none">✦</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}
