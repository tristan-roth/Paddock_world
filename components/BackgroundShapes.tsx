'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type Variant = 'about' | 'sports'

interface BackgroundShapesProps {
    variant: Variant
    /** Position ScrollTrigger où le tracé commence à se dessiner */
    drawStart?: string
    /** Position ScrollTrigger où le tracé est entièrement dessiné */
    drawEnd?: string
}

// Amplitude du drift des formes quand la souris bouge (px)
const MOUSE_DRIFT = 22

export default function BackgroundShapes({
    variant,
    drawStart = 'top 75%',
    drawEnd = 'bottom 80%',
}: BackgroundShapesProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const driftRef = useRef<HTMLDivElement>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        const container = containerRef.current
        const svg = svgRef.current
        if (!container || !svg) return

        const ctx = gsap.context(() => {
            // Tracé progressif au scroll (stroke-dashoffset scrubé)
            const shapes = Array.from(svg.querySelectorAll<SVGGeometryElement>('path, circle'))
            shapes.forEach((s) => {
                const len = s.getTotalLength()
                // +2/+1 : évite le sliver de dash visible au point de départ (cf. icônes univers)
                gsap.set(s, { strokeDasharray: `${len} ${len + 2}`, strokeDashoffset: len + 1 })
            })
            gsap.to(shapes, {
                strokeDashoffset: 0,
                ease: 'none',
                stagger: 0.2,
                scrollTrigger: {
                    trigger: container,
                    start: drawStart,
                    end: drawEnd,
                    scrub: 1,
                },
            })

            // Léger parallax vertical pendant la traversée de la section
            gsap.fromTo(
                svg,
                { yPercent: -5 },
                {
                    yPercent: 5,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: container,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                }
            )
        }, container)

        // Drift des formes avec la souris (désactivé sur écrans tactiles)
        let cleanupMouse: (() => void) | undefined
        if (!window.matchMedia('(pointer: coarse)').matches && driftRef.current) {
            const xTo = gsap.quickTo(driftRef.current, 'x', { duration: 1.4, ease: 'power3.out' })
            const yTo = gsap.quickTo(driftRef.current, 'y', { duration: 1.4, ease: 'power3.out' })
            const onMove = (e: MouseEvent) => {
                xTo((e.clientX / window.innerWidth - 0.5) * 2 * MOUSE_DRIFT)
                yTo((e.clientY / window.innerHeight - 0.5) * 2 * MOUSE_DRIFT)
            }
            window.addEventListener('mousemove', onMove)
            cleanupMouse = () => window.removeEventListener('mousemove', onMove)
        }

        return () => {
            ctx.revert()
            cleanupMouse?.()
        }
    }, [drawStart, drawEnd])

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            {/* inset négatif : le drift souris ne découvre jamais les bords */}
            <div ref={driftRef} className="absolute inset-[-40px] will-change-transform">
                <svg
                    ref={svgRef}
                    className="w-full h-full"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    fill="none"
                >
                    {variant === 'about' ? (
                        <>
                            {/* Trajectoire de course traversant la section */}
                            <path
                                d="M -80 620 C 260 650, 420 380, 720 380 C 1020 380, 1140 560, 1520 470"
                                stroke="rgba(168,85,247,0.22)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Écho décalé de la trajectoire */}
                            <path
                                d="M -80 690 C 270 720, 440 450, 730 450 C 1030 450, 1150 630, 1520 540"
                                stroke="rgba(192,132,252,0.12)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            <circle
                                cx="1180"
                                cy="150"
                                r="120"
                                stroke="rgba(168,85,247,0.14)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            <circle
                                cx="170"
                                cy="200"
                                r="55"
                                stroke="rgba(192,132,252,0.10)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Courbe haute traversant derrière le titre */}
                            <path
                                d="M -80 250 C 320 300, 760 150, 1520 230"
                                stroke="rgba(168,85,247,0.11)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Courbe basse en contrepoint */}
                            <path
                                d="M 180 900 C 480 800, 880 850, 1300 690"
                                stroke="rgba(192,132,252,0.10)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            <circle
                                cx="500"
                                cy="120"
                                r="38"
                                stroke="rgba(168,85,247,0.09)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                        </>
                    ) : (
                        <>
                            {/* Lignes de vitesse diagonales */}
                            <path
                                d="M -80 800 C 400 760, 900 480, 1520 220"
                                stroke="rgba(168,85,247,0.20)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            <path
                                d="M -80 870 C 420 830, 940 550, 1520 290"
                                stroke="rgba(192,132,252,0.11)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Chevrons directionnels (vibreurs) */}
                            <path d="M 120 120 L 158 165 L 120 210" stroke="rgba(168,85,247,0.18)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            <path d="M 190 120 L 228 165 L 190 210" stroke="rgba(168,85,247,0.13)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            <path d="M 260 120 L 298 165 L 260 210" stroke="rgba(168,85,247,0.08)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            <circle
                                cx="1250"
                                cy="680"
                                r="150"
                                stroke="rgba(168,85,247,0.12)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Troisième ligne de vitesse, plus basse et discrète */}
                            <path
                                d="M -80 930 C 440 900, 960 630, 1520 370"
                                stroke="rgba(168,85,247,0.07)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                            {/* Chevrons en écho, bas droite */}
                            <path d="M 1020 790 L 1058 835 L 1020 880" stroke="rgba(192,132,252,0.12)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            <path d="M 1090 790 L 1128 835 L 1090 880" stroke="rgba(192,132,252,0.08)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            <circle
                                cx="640"
                                cy="150"
                                r="62"
                                stroke="rgba(168,85,247,0.10)"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            />
                        </>
                    )}
                </svg>
            </div>
        </div>
    )
}
