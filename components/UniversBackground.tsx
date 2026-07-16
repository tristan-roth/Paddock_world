'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Densité des formes par section — le layer étant fixe, la présence se pilote
// par fondu d'opacité quand le haut de chaque section franchit le milieu du
// viewport. Waypoints ordonnés dans le sens du document ; avant le premier,
// l'opacité de base (section #history) s'applique.
const BASE_OPACITY = 1
const SECTION_STOPS: Array<{ selector: string; opacity: number }> = [
    { selector: '#timeline', opacity: 0.15 },
    { selector: '#impact', opacity: 1 },
    // À partir du carousel plein écran, plus rien : Beyond Racing et #fans
    // ont déjà leur propre ambiance (blobs Soft Power, glow Fans)
    { selector: '#circuits-carousel', opacity: 0 },
]

const purple = (a: number) => `rgba(168,85,247,${a})`
const white = (a: number) => `rgba(255,255,255,${a})`

export default function UniversBackground() {
    const groupRef = useRef<HTMLDivElement>(null)
    const slowRef = useRef<HTMLDivElement>(null)
    const midRef = useRef<HTMLDivElement>(null)
    const fastRef = useRef<HTMLDivElement>(null)
    const spinRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const group = groupRef.current
        if (!group) return

        const applyOpacity = (value: number) => {
            gsap.to(group, { opacity: value, duration: 1.2, ease: 'power2.inOut', overwrite: 'auto' })
        }

        const triggers: ScrollTrigger[] = []
        SECTION_STOPS.forEach((stop, i) => {
            const el = document.querySelector(stop.selector)
            if (!el) return
            triggers.push(
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 55%',
                    onEnter: () => applyOpacity(stop.opacity),
                    onLeaveBack: () => applyOpacity(i === 0 ? BASE_OPACITY : SECTION_STOPS[i - 1].opacity),
                })
            )
        })

        // Parallax scrubbed sur toute la page — désactivé si l'utilisateur
        // préfère réduire les animations (formes statiques dans ce cas)
        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const scrub = () => ({
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
            })

            const layers: Array<[HTMLDivElement | null, number]> = [
                [slowRef.current, 6],
                [midRef.current, 12],
                [fastRef.current, 20],
            ]
            layers.forEach(([layer, amount]) => {
                if (!layer) return
                gsap.fromTo(layer, { yPercent: -amount }, { yPercent: amount, ease: 'none', scrollTrigger: scrub() })
            })

            spinRefs.current.forEach((el, i) => {
                if (!el) return
                const dir = i % 2 === 0 ? 1 : -1
                gsap.fromTo(el, { rotation: -8 * dir }, { rotation: 8 * dir, ease: 'none', scrollTrigger: scrub() })
            })
        })

        return () => {
            triggers.forEach((t) => t.kill())
            mm.revert()
        }
    }, [])

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
            {/* Base opaque — reprend la couleur que portaient le main et les sections */}
            <div className="absolute inset-0 bg-[#0a0a0a]" />

            <div ref={groupRef} className="absolute inset-0">
                {/* ── Couche lente (lointaine) ── */}
                <div ref={slowRef} className="absolute inset-0 will-change-transform">
                    {/* Anneaux concentriques — coin haut droit */}
                    <svg
                        className="absolute"
                        style={{ top: '-22vh', right: '-12vw', width: '46vw', height: '46vw' }}
                        viewBox="0 0 400 400"
                        fill="none"
                    >
                        <circle cx="200" cy="200" r="196" stroke={white(0.04)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        <circle cx="200" cy="200" r="150" stroke={purple(0.07)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        <circle cx="200" cy="200" r="102" stroke={white(0.03)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>

                    {/* Grand arc de trajectoire — traverse le bas gauche */}
                    <svg
                        className="absolute"
                        style={{ left: '-10vw', bottom: '-8vh', width: '75vw', height: '60vh' }}
                        viewBox="0 0 900 500"
                        fill="none"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M-20 480 C 220 460, 340 220, 520 190 S 860 150, 920 20"
                            stroke={purple(0.08)}
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                </div>

                {/* ── Couche moyenne ── */}
                <div ref={midRef} className="absolute inset-0 will-change-transform">
                    {/* Grille de points façon starting grid — flanc gauche */}
                    <svg
                        className="absolute"
                        style={{ left: '6vw', top: '52vh', width: '18vw', height: '22vh' }}
                        viewBox="0 0 210 150"
                        fill="none"
                    >
                        {Array.from({ length: 48 }).map((_, i) => (
                            <circle
                                key={i}
                                cx={15 + (i % 8) * 26}
                                cy={15 + Math.floor(i / 8) * 24}
                                r="1.8"
                                fill={white(0.05)}
                            />
                        ))}
                    </svg>

                    {/* Chevrons de vibreurs — flanc droit */}
                    <svg
                        className="absolute"
                        style={{ right: '4vw', top: '18vh', width: '14vw', height: '30vh' }}
                        viewBox="0 0 160 300"
                        fill="none"
                    >
                        {Array.from({ length: 6 }).map((_, i) => (
                            <path
                                key={i}
                                d={`M10 ${34 + i * 44} L80 ${10 + i * 44} L150 ${34 + i * 44}`}
                                stroke={purple(0.09)}
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))}
                    </svg>
                </div>

                {/* ── Couche rapide (proche) — desktop uniquement ── */}
                <div ref={fastRef} className="absolute inset-0 will-change-transform hidden lg:block">
                    {/* Arc fin — haut gauche, rotation lente au scroll */}
                    <div
                        ref={(el) => { spinRefs.current[0] = el }}
                        className="absolute will-change-transform"
                        style={{ left: '-6vw', top: '6vh', width: '34vw', height: '34vw' }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 300 300" fill="none">
                            <path
                                d="M20 280 A 240 240 0 0 1 280 30"
                                stroke={purple(0.11)}
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                    </div>

                    {/* Petit anneau double — bas droit, contre-rotation */}
                    <div
                        ref={(el) => { spinRefs.current[1] = el }}
                        className="absolute will-change-transform"
                        style={{ right: '10vw', bottom: '12vh', width: '12vw', height: '12vw' }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                            <circle cx="50" cy="50" r="48" stroke={white(0.05)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            <circle cx="50" cy="50" r="30" stroke={purple(0.10)} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
