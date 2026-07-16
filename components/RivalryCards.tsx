'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type RivalryDriver = {
    name: string
    img: string
}

type Rivalry = {
    title: string
    text: string
    top: RivalryDriver
    bottom: RivalryDriver
}

const rivalries: Rivalry[] = [
    {
        title: 'Senna vs Prost',
        text: "Teammates at McLaren in 1988–89, Senna and Prost built one of sport's most psychologically intense rivalries — two of the greatest drivers ever, same car, forced to destroy each other to win. Their collision at Suzuka in 1989, and Senna's retaliation there in 1990, became legendary. But by 1993, something had shifted: a mutual respect symbolized by their embrace on the podium at Prost's final race. When Senna died at Imola in 1994, Prost carried his coffin — and needed years before he could speak about him without breaking down.",
        top: { name: 'SENNA', img: '/img/rivalries/senna.jpg' },
        bottom: { name: 'PROST', img: '/img/rivalries/prost.jpg' },
    },
    {
        title: 'Schumacher vs Häkkinen',
        text: "Michael Schumacher's ruthless precision against Mika Häkkinen's effortless speed — this was a clash of racing philosophies as much as talent. Häkkinen took the titles in 1998 and 1999, out-dueling Schumacher wheel-to-wheel at circuits like Spa 2000, in one of the most respected overtakes in F1 history. Then Schumacher struck back, launching an era of Ferrari dominance so total it would take years for anyone to seriously threaten him again.",
        top: { name: 'HÄKKINEN', img: '/img/rivalries/hakkinen.jpg' },
        bottom: { name: 'SCHUMACHER', img: '/img/rivalries/schumacher.jpg' },
    },
    {
        title: 'Hamilton vs Verstappen',
        text: 'Two once-in-a-generation talents, an entire season decided by a handful of points, and a rivalry that turned personal by summer. Hamilton chasing a record eighth title, Verstappen chasing his first — collisions at Silverstone and Monza, and a title fight that came down to the final lap of the final race in Abu Dhabi, under circumstances still debated years later. It remains one of the most controversial conclusions in F1 history.',
        top: { name: 'VERSTAPPEN', img: '/img/rivalries/verstappen.jpg' },
        bottom: { name: 'HAMILTON', img: '/img/rivalries/hamilton.jpg' },
    },
]

// Épaisseur de la ligne blanche qui borde chaque photo le long de la diagonale
const STRIPE = '4px'

// Position de la coupe diagonale en % de la hauteur de carte : [bord droit, bord gauche].
// Les valeurs hors [0,100] font sortir la diagonale par le haut/bas de la carte
// (état ouvert : chaque pilote se replie dans son coin).
const GEO = {
    compact: {
        top: ['2%', '92%'],
        bottom: ['8%', '98%'],
    },
    expanded: {
        top: ['-36%', '40%'],
        bottom: ['60%', '136%'],
    },
} as const

const CLIP_EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'

const topClip = (edge: readonly [string, string], inset = '0px') =>
    `polygon(0% 0%, 100% 0%, 100% calc(${edge[0]} - ${inset}), 0% calc(${edge[1]} - ${inset}))`

const bottomClip = (edge: readonly [string, string], inset = '0px') =>
    `polygon(100% calc(${edge[0]} + ${inset}), 100% 100%, 0% 100%, 0% calc(${edge[1]} + ${inset}))`

export default function RivalryCards() {
    const [openIdx, setOpenIdx] = useState<number | null>(null)
    const [hoverIdx, setHoverIdx] = useState<number | null>(null)
    const gridRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
        if (cards.length === 0) return
        const ctx = gsap.context(() => {
            gsap.set(cards, { opacity: 0, y: 60 })
            gsap.to(cards, {
                opacity: 1, y: 0,
                stagger: 0.15, duration: 0.9, ease: 'power3.out',
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            })
        })
        return () => ctx.revert()
    }, [])

    const cols = openIdx === null
        ? '1fr 1fr 1fr'
        : ['1.35fr 1fr 1fr', '1fr 1.35fr 1fr', '1fr 1fr 1.35fr'][openIdx]

    return (
        <div
            ref={gridRef}
            className="grid [grid-template-columns:1fr] lg:[grid-template-columns:var(--rivalry-cols)] items-center gap-6 lg:gap-8 w-full transition-[grid-template-columns] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
            style={{ '--rivalry-cols': cols } as React.CSSProperties}
        >
            {rivalries.map((rivalry, i) => {
                const isOpen = openIdx === i
                const isHint = hoverIdx === i && !isOpen
                const geo = isOpen ? GEO.expanded : GEO.compact
                return (
                    <div
                        key={rivalry.title}
                        ref={(el) => { cardRefs.current[i] = el }}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        aria-label={rivalry.title}
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setOpenIdx(isOpen ? null : i)
                            }
                        }}
                        onMouseEnter={() => setHoverIdx(i)}
                        onMouseLeave={() => setHoverIdx(null)}
                        className={`relative w-full max-w-lg mx-auto lg:max-w-none cursor-pointer select-none outline-none transition-[height] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${isOpen ? 'h-[660px] lg:h-[680px]' : 'h-[460px] lg:h-[500px]'}`}
                    >
                        {/* Pilote du haut — à l'endroit, coin supérieur gauche */}
                        <div
                            className="absolute inset-0 bg-white"
                            style={{
                                clipPath: topClip(geo.top),
                                transform: isHint ? 'translate(-6px, -6px)' : 'translate(0, 0)',
                                transition: `clip-path 700ms ${CLIP_EASE}, transform 350ms ease`,
                            }}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-[#141a3d] to-[#080b24]"
                                style={{ clipPath: topClip(geo.top, STRIPE), transition: `clip-path 700ms ${CLIP_EASE}` }}
                            >
                                <Image
                                    src={rivalry.top.img}
                                    alt={`${rivalry.top.name} portrait`}
                                    fill
                                    quality={90}
                                    sizes="(max-width: 1024px) 100vw, 33vw"
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/15" />
                            </div>
                            <span
                                className="absolute left-[7%] top-[24%] text-white text-xl lg:text-2xl uppercase tracking-[0.08em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                                style={{ fontFamily: 'var(--font-russo)' }}
                            >
                                {rivalry.top.name}
                            </span>
                        </div>

                        {/* Pilote du bas — retourné à 180°, coin inférieur droit */}
                        <div
                            className="absolute inset-0 bg-white"
                            style={{
                                clipPath: bottomClip(geo.bottom),
                                transform: isHint ? 'translate(6px, 6px)' : 'translate(0, 0)',
                                transition: `clip-path 700ms ${CLIP_EASE}, transform 350ms ease`,
                            }}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-br from-[#080b24] to-[#141a3d]"
                                style={{ clipPath: bottomClip(geo.bottom, STRIPE), transition: `clip-path 700ms ${CLIP_EASE}` }}
                            >
                                <div className="absolute inset-0 rotate-180">
                                    <Image
                                        src={rivalry.bottom.img}
                                        alt={`${rivalry.bottom.name} portrait`}
                                        fill
                                        quality={90}
                                        sizes="(max-width: 1024px) 100vw, 33vw"
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/15" />
                            </div>
                            <span
                                className="absolute right-[8%] bottom-[20%] text-white text-xl lg:text-2xl uppercase tracking-[0.08em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
                                style={{ fontFamily: 'var(--font-russo)' }}
                            >
                                {rivalry.bottom.name}
                            </span>
                        </div>

                        {/* Texte de la rivalité — visible uniquement carte ouverte */}
                        <div
                            className="absolute left-[7%] right-[7%] top-1/2 -translate-y-1/2 z-10 pointer-events-none"
                            style={{
                                opacity: isOpen ? 1 : 0,
                                transition: isOpen ? 'opacity 500ms ease 350ms' : 'opacity 200ms ease',
                            }}
                            aria-hidden={!isOpen}
                        >
                            <div
                                className="text-white/90 text-[13px] lg:text-sm leading-relaxed text-justify drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                                style={{ fontFamily: 'var(--font-barlow)' }}
                            >
                                <span className="font-bold text-white">{rivalry.title}</span>
                                <span> — {rivalry.text}</span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
