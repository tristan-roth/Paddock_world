'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Stop {
    top: string
    bottom: string
    glow: string
    glowX: string
}

// Même principe que HomeBackground : un fond fixe unique dont la couleur se
// fond d'une section à l'autre, plutôt qu'un dégradé figé par section. Les
// teintes reprennent celles déjà en place sur la page (#0a0000 → #10031c →
// #0a0e27 → #060918) pour que la refonte ne change pas l'identité, seulement
// la façon dont elle respire.
const HERO_STOP: Stop = {
    top: '#0a0a0a',
    bottom: '#0a0a0a',
    glow: 'rgba(126,34,206,0.08)',
    glowX: '50%',
}

const SECTION_STOPS: Array<Stop & { selector: string }> = [
    { selector: '#drivers', top: '#0a0a0a', bottom: '#0a0a0a', glow: 'rgba(147,51,234,0.06)', glowX: '25%' },
    { selector: '#calendar', top: '#0a0a0a', bottom: '#0a0a0a', glow: 'rgba(126,34,206,0.08)', glowX: '50%' },
    { selector: '#standings', top: '#0a0a0a', bottom: '#0a0a0a', glow: 'rgba(168,85,247,0.07)', glowX: '75%' },
]

/**
 * Fond animé de la page Championship : dégradé qui se fond au fil des
 * sections, halo violet qui descend avec le scroll, grille et damier en
 * parallax lent. Purement décoratif.
 */
export default function ChampionshipBackground() {
    const bgRef = useRef<HTMLDivElement>(null)
    const gridRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const bg = bgRef.current
        if (!bg) return

        const apply = (stop: Stop) => {
            gsap.to(bg, {
                '--bg-top': stop.top,
                '--bg-bottom': stop.bottom,
                '--bg-glow': stop.glow,
                '--glow-x': stop.glowX,
                duration: 1.6,
                ease: 'power2.inOut',
                overwrite: 'auto',
            })
        }

        const ctx = gsap.context(() => {
            // Le halo descend continûment sur toute la hauteur du document.
            gsap.fromTo(
                bg,
                { '--glow-y': '8%' },
                {
                    '--glow-y': '92%',
                    ease: 'none',
                    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1 },
                },
            )

            // Dérive lente de la grille : donne une sensation de déplacement
            // même quand rien d'autre ne bouge à l'écran.
            if (gridRef.current) {
                gsap.fromTo(
                    gridRef.current,
                    { backgroundPosition: '0px 0px' },
                    {
                        backgroundPosition: '0px 420px',
                        ease: 'none',
                        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
                    },
                )
            }

            SECTION_STOPS.forEach((stop, i) => {
                if (!document.querySelector(stop.selector)) return
                ScrollTrigger.create({
                    trigger: stop.selector,
                    start: 'top 60%',
                    end: 'bottom 40%',
                    onEnter: () => apply(stop),
                    onEnterBack: () => apply(stop),
                    onLeaveBack: () => apply(i === 0 ? HERO_STOP : SECTION_STOPS[i - 1]),
                })
            })
        })

        // `refresh` : les sections (globe, classements) se montent après leur
        // fetch et décalent les positions calculées au premier passage.
        const refresh = setTimeout(() => ScrollTrigger.refresh(), 800)

        return () => {
            clearTimeout(refresh)
            ctx.revert()
        }
    }, [])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
            <div
                ref={bgRef}
                className="absolute inset-0"
                style={
                    {
                        '--bg-top': HERO_STOP.top,
                        '--bg-bottom': HERO_STOP.bottom,
                        '--bg-glow': HERO_STOP.glow,
                        '--glow-x': HERO_STOP.glowX,
                        '--glow-y': '8%',
                        background: `
                            radial-gradient(ellipse 80% 60% at var(--glow-x) var(--glow-y), var(--bg-glow), transparent 65%),
                            linear-gradient(180deg, var(--bg-top) 0%, var(--bg-top) 40%, var(--bg-bottom) 100%)
                        `,
                    } as React.CSSProperties
                }
            />
            <div
                ref={gridRef}
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />
        </div>
    )
}
