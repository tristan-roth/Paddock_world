'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ColorStop {
    top: string
    bottom: string
    glow: string
    glowX: string
}

// Couleur de fond au niveau du hero (avant la première section)
// Le fond reste noir sur toute la page — seul le bas de page prend un fade violet
const BASE_STOP: ColorStop = {
    top: '#000000',
    bottom: '#04040c',
    glow: 'rgba(107,33,168,0.16)',
    glowX: '50%',
}

// Une étape de couleur par section — le fond s'y fond quand la section entre au milieu du viewport
const SECTION_STOPS: Array<ColorStop & { selector: string }> = [
    {
        selector: '#about',
        top: '#000000',
        bottom: '#070511',
        glow: 'rgba(147,51,234,0.26)',
        glowX: '28%',
    },
    {
        selector: '#sports-categories',
        top: '#000000',
        bottom: '#060512',
        glow: 'rgba(126,58,242,0.24)',
        glowX: '72%',
    },
    {
        selector: '#model-section',
        top: '#030209',
        bottom: '#160b2d',
        glow: 'rgba(147,51,234,0.26)',
        glowX: '50%',
    },
]

export default function HomeBackground() {
    const bgRef = useRef<HTMLDivElement>(null)

    // Transitions de couleur pilotées par le scroll
    useEffect(() => {
        const bg = bgRef.current
        if (!bg) return

        const applyStop = (stop: ColorStop) => {
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

        // Le nuage violet descend continûment avec le scroll (indépendant des paliers de couleur)
        const glowScrub = gsap.fromTo(
            bg,
            { '--glow-y': '5%' },
            {
                '--glow-y': '95%',
                ease: 'none',
                scrollTrigger: {
                    trigger: document.body,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1,
                },
            }
        )

        const triggers: ScrollTrigger[] = []
        SECTION_STOPS.forEach((stop, i) => {
            const el = document.querySelector(stop.selector)
            if (!el) return
            triggers.push(
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top 55%',
                    end: 'bottom 55%',
                    onEnter: () => applyStop(stop),
                    onEnterBack: () => applyStop(stop),
                    onLeaveBack: () => applyStop(i === 0 ? BASE_STOP : SECTION_STOPS[i - 1]),
                })
            )
        })

        return () => {
            triggers.forEach((t) => t.kill())
            glowScrub.scrollTrigger?.kill()
            glowScrub.kill()
        }
    }, [])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
            <div
                ref={bgRef}
                className="absolute inset-0"
                style={
                    {
                        '--bg-top': BASE_STOP.top,
                        '--bg-bottom': BASE_STOP.bottom,
                        '--bg-glow': BASE_STOP.glow,
                        '--glow-x': BASE_STOP.glowX,
                        '--glow-y': '5%',
                        background: `
                            radial-gradient(ellipse 85% 65% at var(--glow-x) var(--glow-y), var(--bg-glow), transparent 65%),
                            linear-gradient(180deg, var(--bg-top) 0%, var(--bg-top) 45%, var(--bg-bottom) 100%)
                        `,
                    } as React.CSSProperties
                }
            />
        </div>
    )
}
