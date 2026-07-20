'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

type Stage = 'q1' | 'q2' | 'q3'
type RowState = 'pole' | 'front' | 'in' | 'out' | 'dim'

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

const stageMeta: Record<Stage, { name: string; tableLabel: string; line: string }> = {
    q1: { name: 'Q1', tableLabel: 'After Q1 — the first cut', line: 'All 20 cars on track. The 5 slowest are eliminated.' },
    q2: { name: 'Q2', tableLabel: 'After Q2 — the midfield shootout', line: '15 cars remain. The 5 slowest are eliminated.' },
    q3: { name: 'Q3', tableLabel: 'After Q3 — the battle for pole', line: 'The top 10 fight for pole position — the coveted front spot on the starting grid.' },
}

function stageRows(stage: Stage): { pos: number; state: RowState; label: string }[] {
    return Array.from({ length: 20 }, (_, i) => {
        const pos = i + 1
        if (stage === 'q1') {
            return pos <= 15
                ? { pos, state: 'in' as RowState, label: 'Through to Q2' }
                : { pos, state: 'out' as RowState, label: 'Eliminated — grid spot locked for Sunday' }
        }
        if (stage === 'q2') {
            if (pos <= 10) return { pos, state: 'in', label: 'Through to Q3' }
            if (pos <= 15) return { pos, state: 'out', label: 'Eliminated — grid spot locked for Sunday' }
            return { pos, state: 'dim', label: 'Already out in Q1' }
        }
        if (pos === 1) return { pos, state: 'pole', label: 'Pole position — leads the field away on Sunday' }
        if (pos === 2) return { pos, state: 'front', label: "Front row on Sunday's grid" }
        if (pos <= 10) return { pos, state: 'in', label: 'Fought for pole — grid spot set by best lap' }
        if (pos <= 15) return { pos, state: 'dim', label: 'Already out in Q2' }
        return { pos, state: 'dim', label: 'Already out in Q1' }
    })
}

const rowStyles: Record<RowState, string> = {
    pole: 'bg-purple-500/25 border-purple-300/60 text-white',
    front: 'bg-purple-500/15 border-purple-400/40 text-purple-100',
    in: 'bg-purple-500/10 border-purple-400/25 text-purple-200',
    out: 'bg-rose-500/10 border-rose-400/25 text-rose-200',
    dim: 'bg-white/[0.03] border-white/10 text-gray-600',
}

/* Top-down F1 car, nose pointing right (+x), centered on (0,0) — matches
   MotionPathPlugin's autoRotate convention. */
function F1CarTopDown() {
    return (
        <g fill="#fff">
            {/* rear wing */}
            <rect x="-56" y="-20" width="9" height="40" rx="2" />
            {/* rear wheels */}
            <rect x="-46" y="-27" width="17" height="11" rx="4" />
            <rect x="-46" y="16" width="17" height="11" rx="4" />
            {/* rear axle */}
            <rect x="-42" y="-16" width="4" height="32" opacity="0.5" />
            {/* sidepods / floor */}
            <path d="M -30 -14 L 2 -12 C 8 -11 11 -8 11 -4 L 11 4 C 11 8 8 11 2 12 L -30 14 C -34 14 -36 12 -36 8 L -36 -8 C -36 -12 -34 -14 -30 -14 Z" opacity="0.92" />
            {/* monocoque + nose */}
            <path d="M -38 -7 L 8 -6 C 26 -5 40 -3 52 -1.5 C 54 -1 54 1 52 1.5 C 40 3 26 5 8 6 L -38 7 Z" />
            {/* cockpit opening */}
            <ellipse cx="-14" cy="0" rx="8" ry="4.5" fill="#0a0c1e" />
            {/* halo */}
            <circle cx="-14" cy="0" r="6.5" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.9" />
            {/* front axle */}
            <rect x="22" y="-15" width="4" height="30" opacity="0.5" />
            {/* front wheels */}
            <rect x="18" y="-25" width="15" height="10" rx="4" />
            <rect x="18" y="15" width="15" height="10" rx="4" />
            {/* front wing */}
            <rect x="46" y="-21" width="7" height="42" rx="2" />
        </g>
    )
}

export default function RaceWeekSection() {
    const sectionRef = useRef<HTMLElement>(null)
    const legWrapRefs = useRef<(HTMLDivElement | null)[]>([])
    const legPathRefs = useRef<(SVGPathElement | null)[]>([])
    const legCarRefs = useRef<(SVGGElement | null)[]>([])
    const tableRef = useRef<HTMLDivElement>(null)
    const [activeStage, setActiveStage] = useState<Stage | null>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Heading wipes — same mechanism as the rest of the page
            sectionRef.current?.querySelectorAll<HTMLElement>('[data-wipe]').forEach((wrap) => {
                const target = wrap.querySelector<HTMLElement>('[data-wipe-target]')
                const overlay = wrap.querySelector<HTMLElement>('[data-wipe-overlay]')
                if (!target || !overlay) return
                gsap.set(target, { opacity: 0 })
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: wrap, start: 'top 82%', toggleActions: 'play reverse play reverse' },
                })
                tl
                    .fromTo(overlay, { x: '-100%' }, { x: '0%', duration: 0.6, ease: 'power2.in' })
                    .to(target, { opacity: 1, duration: 0.001 }, 0.6)
                    .to(overlay, { x: '100%', duration: 0.6, ease: 'power2.out' }, 0.6)
            })

            // Paragraph stagger fades
            sectionRef.current?.querySelectorAll<HTMLElement>('[data-fade-group]').forEach((group) => {
                const items = group.querySelectorAll('.rw-fade')
                if (items.length === 0) return
                gsap.set(items, { opacity: 0, y: 28 })
                gsap.to(items, {
                    opacity: 1, y: 0,
                    stagger: 0.18, duration: 0.9, ease: 'power2.out',
                    scrollTrigger: { trigger: group, start: 'top 78%', toggleActions: 'play reverse play reverse' },
                })
            })

            // F1 car follows the dashed path, driven by scroll
            legWrapRefs.current.forEach((wrap, i) => {
                const path = legPathRefs.current[i]
                const car = legCarRefs.current[i]
                if (!wrap || !path || !car) return
                gsap.to(car, {
                    ease: 'none',
                    motionPath: {
                        path,
                        align: path,
                        alignOrigin: [0.5, 0.5],
                        autoRotate: true,
                    },
                    scrollTrigger: {
                        trigger: wrap,
                        start: 'top 78%',
                        end: 'bottom 45%',
                        scrub: 1,
                    },
                })
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    // Reveal the qualifying table when a round is selected
    useEffect(() => {
        if (!activeStage || !tableRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo(tableRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' })
            gsap.fromTo(
                tableRef.current!.querySelectorAll('.qual-row'),
                { opacity: 0, x: -18 },
                { opacity: 1, x: 0, stagger: 0.03, duration: 0.4, ease: 'power2.out' }
            )
        }, tableRef)
        return () => ctx.revert()
    }, [activeStage])

    const toggleStage = (s: Stage) => setActiveStage((prev) => (prev === s ? null : s))

    return (
        <section id="race-week" ref={sectionRef} className="relative z-10 w-full overflow-hidden py-24 lg:py-36">
            {/* subtle glow backdrop */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 50% 35% at 50% 6%, rgba(126,34,206,0.12), transparent 70%)' }}
            />

            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 md:px-20 xl:px-32">

                {/* ═══ Section title ═══ */}
                <div className="text-center mb-16 lg:mb-24">
                    <div data-wipe className="relative overflow-hidden inline-block">
                        <h2
                            data-wipe-target
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-2xl"
                            style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                        >
                            FOLLOW A RACE{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-700" style={{ fontFamily: 'var(--font-playfair)' }}>
                                WEEK
                            </span>
                        </h2>
                        <div data-wipe-overlay className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                    </div>
                </div>

                {/* ═══ FRIDAY — The Lab ═══ */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-start">
                    <div data-fade-group>
                        <div data-wipe className="relative overflow-hidden inline-block mb-2">
                            <h3
                                data-wipe-target
                                className="text-4xl sm:text-5xl lg:text-6xl text-white font-bold uppercase tracking-tight leading-none"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                FRIDAY
                            </h3>
                            <div data-wipe-overlay className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                        </div>
                        <p className="rw-fade text-gray-300 text-xl sm:text-2xl italic mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                            The Lab
                        </p>

                        <div className="flex flex-col gap-6 max-w-xl">
                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                Two <span className="text-white font-medium">Free Practice sessions</span> (FP1 &amp; FP2). No points, no pressure — officially. In reality, every engineer on the pit wall is watching the data <span className="italic text-purple-400">like a hawk</span>.
                            </p>
                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                Teams use Friday to test <span className="text-white font-medium">tire compounds</span>, tweak <span className="text-white font-medium">aerodynamic setups</span>, and collect thousands of data points about how the car responds to this specific track. Every circuit is different — the surface, the corners, the temperature, the wind — and Friday is about finding the <span className="text-purple-400">perfect setup</span> before the real action begins.
                            </p>
                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                                As a fan, Friday is great for spotting early pace — who looks fast, who&apos;s struggling, who&apos;s hiding something. Because yes, <span className="italic text-purple-400">sandbagging</span> is real. Some teams deliberately hold back their true pace on Friday to keep rivals guessing. <span className="text-white font-medium">The poker game starts before the lights even go out.</span>
                            </p>
                        </div>
                    </div>

                    {/* Leg 1 — Friday → Saturday */}
                    <div
                        ref={(el) => { legWrapRefs.current[0] = el }}
                        className="relative w-2/3 lg:w-full max-w-[560px] mx-auto lg:ml-auto lg:mr-0 lg:mt-10"
                    >
                        <svg viewBox="0 0 600 520" className="w-full h-auto" fill="none" aria-hidden>
                            <path
                                ref={(el) => { legPathRefs.current[0] = el }}
                                d="M 60 30 C 240 70, 430 90, 500 200 C 545 280, 545 380, 520 490"
                                stroke="rgba(255,255,255,0.85)"
                                strokeWidth="3.5"
                                strokeDasharray="14 18"
                                strokeLinecap="round"
                            />
                            <g ref={(el) => { legCarRefs.current[0] = el }}>
                                <g transform="scale(0.85)">
                                    <F1CarTopDown />
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>

                {/* ═══ SATURDAY — The Drama ═══ */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mt-16 lg:mt-8">

                    {/* Left: qualifying table (revealed on click) */}
                    <div className="order-2 lg:order-1 h-[380px] lg:h-[600px]">
                        {activeStage === null ? (
                            <div className="h-full rounded-sm border border-dashed border-white/15 flex flex-col items-center justify-center gap-5 px-8 text-center">
                                <svg className="w-8 h-8 text-purple-500/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <path d="M9 11.5V4.75a1.75 1.75 0 0 1 3.5 0v5.75" />
                                    <path d="M12.5 10.5v-1a1.75 1.75 0 0 1 3.5 0v2" />
                                    <path d="M16 11.5v-.25a1.75 1.75 0 0 1 3.5 0V15c0 3.5-2 6.5-6 6.5h-1.5c-2.2 0-3.6-.9-4.7-2.6L4.6 15.2a1.6 1.6 0 0 1 2.6-1.9L9 15.5" />
                                </svg>
                                <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-sm" style={{ fontFamily: 'var(--font-barlow)' }}>
                                    Select <span className="text-purple-400 font-medium">Q1</span>, <span className="text-purple-400 font-medium">Q2</span> or <span className="text-purple-400 font-medium">Q3</span> to reveal what each position means for Sunday&apos;s grid.
                                </p>
                            </div>
                        ) : (
                            <div ref={tableRef} className="h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-4 shrink-0">
                                    <div className="w-8 h-[1px] bg-purple-700" />
                                    <span className="text-purple-500 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>
                                        {stageMeta[activeStage].tableLabel}
                                    </span>
                                </div>

                                <div className="grid grid-cols-[92px_1fr] gap-2 mb-2 shrink-0">
                                    <div className="rounded-sm border border-purple-400/50 bg-purple-600/30 py-2.5 text-center text-purple-100 text-[11px] tracking-[0.2em] uppercase font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                                        Position
                                    </div>
                                    <div className="rounded-sm border border-purple-400/50 bg-purple-600/30 py-2.5 text-center text-purple-100 text-[11px] tracking-[0.2em] uppercase font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                                        Outcome
                                    </div>
                                </div>

                                <div
                                    className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-2"
                                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.5) transparent' }}
                                >
                                    {stageRows(activeStage).map((row) => (
                                        <div key={row.pos} className="qual-row grid grid-cols-[92px_1fr] gap-2 shrink-0">
                                            <div className={`rounded-sm border py-2.5 text-center text-sm font-semibold ${rowStyles[row.state]}`} style={{ fontFamily: 'var(--font-barlow)' }}>
                                                {ordinal(row.pos)}
                                            </div>
                                            <div className={`rounded-sm border py-2.5 px-4 text-sm ${rowStyles[row.state]}`} style={{ fontFamily: 'var(--font-barlow)' }}>
                                                {row.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: heading + explanations + clickable rounds */}
                    <div data-fade-group className="order-1 lg:order-2 lg:text-right">
                        <div data-wipe className="relative overflow-hidden inline-block mb-2">
                            <h3
                                data-wipe-target
                                className="text-4xl sm:text-5xl lg:text-6xl text-white font-bold uppercase tracking-tight leading-none"
                                style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                            >
                                SATURDAY
                            </h3>
                            <div data-wipe-overlay className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                        </div>
                        <p className="rw-fade text-gray-300 text-xl sm:text-2xl italic mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                            The Drama
                        </p>

                        <div className="flex flex-col gap-6 lg:items-end">
                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl text-left lg:text-right" style={{ fontFamily: 'var(--font-barlow)' }}>
                                First up: <span className="text-white font-medium">FP3</span>, one last setup session before the pressure cranks up. Teams confirm their final adjustments, simulate race scenarios, and mentally prepare. Then comes <span className="text-white font-medium">Qualifying</span> — and this is where F1 gets <span className="italic text-purple-400">seriously addictive</span>.
                            </p>

                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl text-left lg:text-right" style={{ fontFamily: 'var(--font-barlow)' }}>
                                Qualifying is split into three knockout rounds:
                            </p>

                            <div className="rw-fade flex flex-col gap-4 max-w-xl w-full">
                                {(['q1', 'q2', 'q3'] as Stage[]).map((s) => {
                                    const isActive = activeStage === s
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => toggleStage(s)}
                                            aria-pressed={isActive}
                                            className={`group text-left lg:text-right text-lg sm:text-xl leading-relaxed transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 rounded-sm cursor-pointer
                                                ${isActive ? 'text-purple-400 font-semibold' : 'text-gray-400 hover:text-purple-300'}`}
                                            style={{
                                                fontFamily: 'var(--font-barlow)',
                                                textShadow: isActive ? '0 0 18px rgba(168,85,247,0.45)' : undefined,
                                            }}
                                        >
                                            <span className={`font-bold ${isActive ? 'text-purple-300' : 'text-white group-hover:text-purple-200'} transition-colors duration-300`}>
                                                {stageMeta[s].name}
                                            </span>
                                            {' '}<span aria-hidden>→</span>{' '}
                                            {stageMeta[s].line}
                                        </button>
                                    )
                                })}
                                <span className="text-purple-500/90 text-xs tracking-[0.2em] uppercase text-left lg:text-right" style={{ fontFamily: 'var(--font-outfit)' }}>
                                    Click a round to see the grid
                                </span>
                            </div>

                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl text-left lg:text-right mt-2" style={{ fontFamily: 'var(--font-barlow)' }}>
                                Each driver typically gets <span className="text-white font-medium">two flying laps</span> per session to set their best time. One mistake — a locked wheel, a tiny moment on the kerb — and your weekend can unravel in seconds. The final minutes of Q3, with every top driver on a hot lap simultaneously, is some of the <span className="text-white font-medium">most intense television in motorsport</span>.
                            </p>

                            <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl text-left lg:text-right" style={{ fontFamily: 'var(--font-barlow)' }}>
                                <span className="text-white font-medium">Why qualifying matters:</span> on certain tracks — <span className="italic text-purple-400">Monaco</span>, <span className="italic text-purple-400">Singapore</span>, <span className="italic text-purple-400">Hungary</span> — overtaking is nearly impossible. Starting at the front can mean the difference between winning and finishing fifth. <span className="text-white font-medium">Saturday shapes Sunday.</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Leg 2 — Saturday → Sunday */}
                <div
                    ref={(el) => { legWrapRefs.current[1] = el }}
                    className="relative w-2/3 lg:w-1/2 max-w-[520px] mx-auto mt-12 lg:mt-4"
                >
                    <svg viewBox="0 0 600 520" className="w-full h-auto" fill="none" aria-hidden>
                        <path
                            ref={(el) => { legPathRefs.current[1] = el }}
                            d="M 540 30 C 470 120, 340 160, 300 260 C 265 350, 265 420, 285 490"
                            stroke="rgba(255,255,255,0.85)"
                            strokeWidth="3.5"
                            strokeDasharray="14 18"
                            strokeLinecap="round"
                        />
                        <g ref={(el) => { legCarRefs.current[1] = el }}>
                            <g transform="scale(0.85)">
                                <F1CarTopDown />
                            </g>
                        </g>
                    </svg>
                </div>

                {/* ═══ SUNDAY — The Race ═══ */}
                <div data-fade-group className="text-center max-w-3xl mx-auto mt-12 lg:mt-8">
                    <div data-wipe className="relative overflow-hidden inline-block mb-2">
                        <h3
                            data-wipe-target
                            className="text-4xl sm:text-5xl lg:text-6xl text-white font-bold uppercase tracking-tight leading-none"
                            style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                        >
                            SUNDAY
                        </h3>
                        <div data-wipe-overlay className="absolute inset-0 bg-purple-600 z-10" style={{ transform: 'translateX(-100%)' }} />
                    </div>
                    <p className="rw-fade text-gray-300 text-xl sm:text-2xl italic mb-8" style={{ fontFamily: 'var(--font-playfair)' }}>
                        The Race
                    </p>

                    <div className="flex flex-col gap-6">
                        <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                            Race day. The grid is set, the strategies are locked, and one by one the <span className="text-white font-medium">five red lights</span> come on above the track. The noise drops. Half a billion people hold their breath. <span className="italic text-purple-400">Lights out — and away we go.</span>
                        </p>
                        <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                            What follows is around <span className="text-white font-medium">300 kilometres</span> of flat-out chess. Pit stops decided in seconds, <span className="text-white font-medium">tire strategy</span> gambles, undercuts and overcuts, safety cars that reshuffle everything — a Grand Prix is never just fast cars in a line. It&apos;s twenty drivers and thousands of engineers making split-second calls for two straight hours.
                        </p>
                        <p className="rw-fade text-gray-400 text-lg sm:text-xl leading-relaxed" style={{ fontFamily: 'var(--font-barlow)' }}>
                            And when the <span className="text-white font-medium">chequered flag</span> drops, the top ten score points — <span className="text-white font-medium">25 for the win</span> — the podium gets a champagne shower, and the internet gets a fresh week of debates. Then the circus packs up, flies to another corner of the world… <span className="italic text-purple-400">and does it all again.</span>
                        </p>
                    </div>

                    <div className="rw-fade flex items-center justify-center gap-3 mt-12">
                        <div className="w-8 h-[1px] bg-purple-700" />
                        <span className="text-purple-500 text-xs tracking-[0.3em] uppercase" style={{ fontFamily: 'var(--font-outfit)' }}>See you next race week</span>
                        <div className="w-8 h-[1px] bg-purple-700" />
                    </div>
                </div>
            </div>
        </section>
    )
}
