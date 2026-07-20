'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHECKER_TILE } from '@/components/f1/CheckeredFlag'

gsap.registerPlugin(ScrollTrigger)

interface SectionDividerProps {
    /** Texte de la borne, en petites capitales monospace (ex: "Round 03"). */
    label?: string
    /** Inverse l'inclinaison, pour alterner d'une transition à l'autre. */
    flip?: boolean
}

/**
 * Transition entre deux sections : une bande oblique damier qui se trace au
 * scroll, traversée d'un trait violet. Reprend le damier de NextRace et
 * l'inclinaison (-skew-x-12) déjà utilisée partout sur les pages F1, pour que
 * les sections s'enchaînent au lieu d'être simplement empilées.
 */
export default function SectionDivider({ label, flip = false }: SectionDividerProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const lineRef = useRef<HTMLDivElement>(null)
    const checkerRef = useRef<HTMLDivElement>(null)
    const labelRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: rootRef.current, start: 'top 88%', once: true },
            })

            tl.fromTo(
                lineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 1, ease: 'power3.inOut' },
            )
                .fromTo(
                    checkerRef.current,
                    { clipPath: 'inset(0 100% 0 0)' },
                    { clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: 'power2.out' },
                    0.25,
                )
                .fromTo(
                    labelRef.current,
                    { opacity: 0, y: 8 },
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                    0.7,
                )

            // Défilement continu du damier pendant la traversée : la bande
            // "file" au scroll, comme un vibreur vu depuis la piste.
            gsap.fromTo(
                checkerRef.current,
                { backgroundPosition: '0px 0px' },
                {
                    backgroundPosition: '240px 0px',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: rootRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1,
                    },
                },
            )
        }, rootRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={rootRef} className="relative h-24 overflow-hidden" aria-hidden>
            <div
                className="absolute inset-x-[-6%] top-1/2 -translate-y-1/2"
                style={{ transform: `translateY(-50%) rotate(${flip ? 1.4 : -1.4}deg)` }}
            >
                <div
                    ref={checkerRef}
                    className="h-6 w-full opacity-[0.05]"
                    style={{
                        backgroundImage: CHECKER_TILE,
                        backgroundSize: '14px 14px',
                        // Fondu aux extrémités : sans ça la bande s'arrête net
                        // sur les bords et se lit comme un élément posé là.
                        maskImage: 'linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)',
                        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)',
                    }}
                />
                <div
                    ref={lineRef}
                    className="h-[2px] w-full origin-left"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent 0%, rgba(126,34,206,0.9) 25%, rgba(192,132,252,0.9) 50%, rgba(126,34,206,0.9) 75%, transparent 100%)',
                        transform: 'scaleX(0)',
                    }}
                />
            </div>

            {label && (
                <span
                    ref={labelRef}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-3 px-4 text-[9px] font-mono tracking-[0.4em] uppercase text-purple-400/70"
                    style={{ opacity: 0 }}
                >
                    {label}
                </span>
            )}
        </div>
    )
}
