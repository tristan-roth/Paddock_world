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

export default function F1TeamsMarquee() {
    const marqueeRef = useRef<HTMLDivElement>(null)
    const elementsRef = useRef<HTMLDivElement[]>([])

    useEffect(() => {
        if (!marqueeRef.current || elementsRef.current.length === 0) return

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ repeat: -1 })

            // Default: moving left to right (so xPercent goes from -50 to 0)
            gsap.set(elementsRef.current, { xPercent: -50 })
            tl.to(elementsRef.current, {
                xPercent: 0,
                duration: 15, // Made it significantly faster
                ease: "none"
            })

            // ScrollTrigger to change direction based on scroll up/down
            ScrollTrigger.create({
                start: 0,
                end: "max",
                onUpdate: (self) => {
                    const targetTimeScale = self.direction === 1 ? 1 : -1
                    gsap.to(tl, {
                        timeScale: targetTimeScale,
                        duration: 0.5,
                        ease: "power1.inOut"
                    })
                }
            })
        }, marqueeRef)

        return () => ctx.revert()
    }, [])

    return (
        // The width and positioning is now handled natively here using absolute positioning and bounds breaking transform
        <div className="absolute left-0 w-screen max-w-[100vw] overflow-hidden bg-[#050505] py-10 border-y border-white/5 flex items-center shadow-2xl pointer-events-auto" style={{ zIndex: 9999 }}>
            <div
                ref={marqueeRef}
                className="relative flex w-max"
            >
                <div
                    ref={(el) => { if (el) elementsRef.current[0] = el }}
                    className="flex w-max shrink-0 px-8"
                >
                    {teams.map((team, idx) => (
                        <div key={`team1-${idx}`} className="flex items-center justify-center min-w-[200px] md:min-w-[250px]">
                            <span
                                className="text-xl md:text-2xl font-black uppercase tracking-[0.25em] text-white/40 shadow-sm hover:text-white/100 transition-colors duration-300 select-none cursor-default"
                                style={{ fontFamily: 'var(--font-russo)' }}
                            >
                                {team}
                            </span>
                        </div>
                    ))}
                </div>
                <div
                    ref={(el) => { if (el) elementsRef.current[1] = el }}
                    className="flex w-max shrink-0 px-8"
                >
                    {teams.map((team, idx) => (
                        <div key={`team2-${idx}`} className="flex items-center justify-center min-w-[200px] md:min-w-[250px]">
                            <span
                                className="text-xl md:text-2xl font-black uppercase tracking-[0.25em] text-white/40 shadow-sm hover:text-white/100 transition-colors duration-300 select-none cursor-default"
                                style={{ fontFamily: 'var(--font-russo)' }}
                            >
                                {team}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
