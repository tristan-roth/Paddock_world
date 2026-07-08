'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CircuitDetailPanel from '@/components/f1/CircuitDetailPanel'
import OutlineText from '@/components/f1/OutlineText'
import Navbar from '@/components/Navbar'
import { todayISO } from '@/lib/f1/date'
import type { RaceWithCircuit } from '@/lib/f1/types'

gsap.registerPlugin(ScrollTrigger)

// Le globe est purement client (React Three Fiber) : import dynamique sans SSR
// pour éviter tout rendu serveur de la scène 3D.
const RaceGlobe = dynamic(() => import('@/components/f1/RaceGlobe'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full animate-pulse rounded-full bg-white/[0.03]" aria-label="Loading globe" />
    ),
})

type LoadStatus = 'loading' | 'ready' | 'error'

const championshipSections = [
    { id: 'drivers', num: '01', name: 'The Drivers', ready: false },
    { id: 'teams', num: '02', name: 'The Teams', ready: false },
    { id: 'calendar', num: '03', name: 'The Calendar', ready: true },
    { id: 'standings', num: '04', name: 'The Standings', ready: false },
]

/** Bandeau placeholder pour les sections à venir (issues #4, #5, #6). */
function PlaceholderBand({ id, num, title }: { id: string; num: string; title: string }) {
    return (
        <section id={id} className="scroll-mt-28 relative border-b border-white/5">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 md:px-16 py-12 flex items-center justify-between gap-6">
                <div className="flex items-baseline gap-5">
                    <span className="text-xs font-mono tracking-[0.3em] text-purple-500/50">{num}</span>
                    <h2
                        className="text-white/25 text-2xl sm:text-3xl font-bold uppercase tracking-[0.08em]"
                        style={{ fontFamily: 'var(--font-outfit)' }}
                    >
                        {title}
                    </h2>
                </div>
                <span className="shrink-0 px-4 py-1.5 border border-white/10 -skew-x-12 text-gray-500 text-[10px] font-mono tracking-[0.25em] uppercase">
                    <span className="inline-block skew-x-12">In development</span>
                </span>
            </div>
        </section>
    )
}

export default function ChampionshipPage() {
    const [status, setStatus] = useState<LoadStatus>('loading')
    const [races, setRaces] = useState<RaceWithCircuit[]>([])
    const [seasons, setSeasons] = useState<number[]>([])
    const [season, setSeason] = useState<number | null>(null)
    const [selectedRace, setSelectedRace] = useState<RaceWithCircuit | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    const titleRef = useRef<HTMLHeadingElement>(null)
    const sweepRef = useRef<HTMLDivElement>(null)
    const purpleLineRef = useRef<HTMLDivElement>(null)
    const heroNavRef = useRef<HTMLDivElement>(null)
    const giantCalRef = useRef<HTMLDivElement>(null)
    const calHeaderRef = useRef<HTMLDivElement>(null)
    const globeWrapRef = useRef<HTMLDivElement>(null)
    const didHashScroll = useRef(false)

    // ── Saisons disponibles (échec non bloquant : le sélecteur reste masqué) ──
    useEffect(() => {
        let cancelled = false
        fetch('/api/f1/seasons')
            .then((res) => (res.ok ? (res.json() as Promise<number[]>) : []))
            .then((data) => {
                if (!cancelled && Array.isArray(data)) setSeasons(data)
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [])

    // ── Calendrier de la saison choisie (défaut : la plus récente en base) ──
    useEffect(() => {
        let cancelled = false
        const url = season === null ? '/api/f1/calendar' : `/api/f1/calendar?season=${season}`

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`API calendar → ${res.status}`)
                return res.json() as Promise<RaceWithCircuit[]>
            })
            .then((data) => {
                if (cancelled) return
                setRaces(data)
                setSelectedRace(null)
                setStatus('ready')
            })
            .catch(() => {
                if (!cancelled) setStatus('error')
            })

        return () => {
            cancelled = true
        }
    }, [season, reloadKey])

    // ── Derived ──
    const today = todayISO()
    const activeSeason = season ?? races[0]?.season ?? seasons[0] ?? null
    const nextRace = useMemo(() => races.find((race) => race.date >= today) ?? null, [races, today])
    const locatedCount = useMemo(
        () => races.filter((r) => r.circuit.latitude != null && r.circuit.longitude != null).length,
        [races],
    )

    const handleSeason = (value: number) => {
        if (value === activeSeason || status === 'loading') return
        setSelectedRace(null)
        setStatus('loading')
        setSeason(value)
    }

    const handleAnchor = (event: React.MouseEvent, id: string) => {
        event.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        history.replaceState(null, '', `#${id}`)
    }

    // ── Arrivée avec ancre (ex: /sports/f1/championship#calendar) ──
    useEffect(() => {
        if (status !== 'ready' || didHashScroll.current) return
        const hash = window.location.hash.slice(1)
        if (!hash) return
        didHashScroll.current = true
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [status])

    // ── Animations d'entrée + parallax ──
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

            gsap.set(titleRef.current, { opacity: 0 })
            tl.fromTo(
                sweepRef.current,
                { x: '-100%' },
                { x: '100%', duration: 1.3, ease: 'power2.inOut' },
                0.2,
            ).set(titleRef.current, { opacity: 1 }, 0.2 + 0.65)

            tl.fromTo(
                purpleLineRef.current,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.65, ease: 'power3.inOut' },
                1.1,
            )

            const plates = heroNavRef.current?.querySelectorAll('.champ-plate')
            if (plates && plates.length > 0) {
                tl.fromTo(
                    plates,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out' },
                    1.3,
                )
            }

            // Parallax horizontal du mot géant CALENDAR
            if (giantCalRef.current && calHeaderRef.current) {
                gsap.fromTo(
                    giantCalRef.current,
                    { x: 60 },
                    {
                        x: -120,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: calHeaderRef.current,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1,
                        },
                    },
                )
            }
        })

        return () => ctx.revert()
    }, [])

    // ── Fondu d'apparition du globe quand les données sont prêtes ──
    useEffect(() => {
        if (status !== 'ready' || !globeWrapRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo(
                globeWrapRef.current,
                { opacity: 0, scale: 0.92 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1.1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: globeWrapRef.current, start: 'top 85%' },
                },
            )
        })
        return () => ctx.revert()
    }, [status])

    return (
        <main className="relative w-full overflow-hidden bg-[#0a0000]">
            <Navbar shouldAnimate disableEntryAnimation />

            {/* ═══════════ HERO ═══════════ */}
            <section
                className="relative w-full min-h-[78vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-36 pb-20"
                style={{ background: 'linear-gradient(180deg, #0a0000 0%, #10031c 55%, #0a0e27 100%)' }}
            >
                {/* Faisceau diagonal violet */}
                <div
                    className="absolute -top-1/4 left-1/2 w-[140%] h-[150%] -translate-x-1/2 pointer-events-none opacity-60"
                    style={{
                        background:
                            'linear-gradient(115deg, transparent 42%, rgba(126,34,206,0.13) 50%, transparent 58%)',
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 flex flex-col items-center text-center w-full max-w-6xl mx-auto">
                    <Link
                        href="/sports/f1"
                        className="group inline-flex items-center gap-2 mb-6 text-xs font-mono tracking-[0.35em] uppercase text-purple-400/70 hover:text-purple-300 transition-colors duration-300"
                    >
                        <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Formula 1
                    </Link>

                    <div className="relative overflow-hidden mb-5">
                        <h1
                            ref={titleRef}
                            className="text-white text-[34px] sm:text-[54px] md:text-[76px] lg:text-[96px] font-black tracking-[0.06em] leading-none select-none drop-shadow-2xl"
                            style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                        >
                            THE <span className="text-purple-700">CHAMPIONSHIP</span>
                        </h1>
                        <div
                            ref={sweepRef}
                            className="absolute inset-0 bg-purple-800 z-10"
                            style={{ transform: 'translateX(-100%)' }}
                        />
                    </div>

                    <div
                        ref={purpleLineRef}
                        className="w-32 md:w-48 h-[3px] bg-purple-700 mb-14 origin-center"
                        style={{ transform: 'scaleX(0)' }}
                    />

                    {/* Plaques d'accès aux 4 sections */}
                    <div
                        ref={heroNavRef}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl"
                    >
                        {championshipSections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                onClick={(event) => handleAnchor(event, section.id)}
                                className="champ-plate group relative block"
                                style={{ opacity: 0 }}
                            >
                                <div
                                    className={`relative overflow-hidden rounded-sm border bg-black/30 backdrop-blur-md
                                               px-6 py-5 text-center cursor-pointer
                                               transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                               group-hover:bg-white/10 group-hover:scale-[1.03]
                                               group-hover:shadow-[0_0_40px_rgba(126,34,206,0.15)]
                                               ${section.ready ? 'border-white/30' : 'border-white/15'}`}
                                >
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                        style={{ background: 'radial-gradient(ellipse at center, rgba(126,34,206,0.08) 0%, transparent 70%)' }}
                                    />
                                    <div className="relative z-10 flex flex-col items-center gap-1">
                                        <span className={`text-[10px] font-mono tracking-[0.3em] ${section.ready ? 'text-purple-400/70' : 'text-white/25'}`}>
                                            {section.num}
                                        </span>
                                        <span
                                            className="text-white text-sm md:text-base font-bold tracking-[0.2em] uppercase transition-colors duration-300 group-hover:text-purple-500"
                                            style={{ fontFamily: 'var(--font-outfit)' }}
                                        >
                                            {section.name}
                                        </span>
                                        <span className={`text-[9px] font-mono tracking-[0.25em] uppercase ${section.ready ? 'text-purple-400/70' : 'text-gray-600'}`}>
                                            {section.ready ? 'Available' : 'Soon'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-purple-700 group-hover:w-full transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-purple-700 to-transparent" />
            </section>

            {/* ═══════════ SECTIONS PLACEHOLDER ═══════════ */}
            <div style={{ background: 'linear-gradient(180deg, #0a0e27 0%, #060918 100%)' }}>
                <PlaceholderBand id="drivers" num="01" title="The Drivers" />
                <PlaceholderBand id="teams" num="02" title="The Teams" />
            </div>

            {/* ═══════════ THE CALENDAR (globe 3D) ═══════════ */}
            <section
                id="calendar"
                className="scroll-mt-20 relative px-5 sm:px-8 md:px-16 pt-24 pb-28"
                style={{ background: 'linear-gradient(180deg, #060918 0%, #0a0e27 55%, #060918 100%)' }}
            >
                {/* Mot géant en parallax derrière l'en-tête */}
                <div ref={giantCalRef} className="absolute top-10 left-0 whitespace-nowrap pointer-events-none">
                    <OutlineText className="text-[110px] sm:text-[160px] lg:text-[220px]">
                        CALENDAR
                    </OutlineText>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* ── En-tête de section ── */}
                    <div ref={calHeaderRef} className="relative pt-14 mb-10">
                        <div className="flex items-baseline gap-5 mb-2">
                            <span className="text-xs font-mono tracking-[0.3em] text-purple-400">03</span>
                            <h2
                                className="text-white text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-[0.06em]"
                                style={{ fontFamily: 'var(--font-outfit)' }}
                            >
                                The Calendar
                            </h2>
                        </div>
                        <p className="text-gray-500 text-sm md:text-base ml-0 sm:ml-12" style={{ fontFamily: 'var(--font-barlow)' }}>
                            Every circuit of the season, placed on the globe. Spin the Earth and pick a Grand Prix.
                        </p>
                    </div>

                    {/* ── Barre de contrôle : saison + compteur ── */}
                    {status === 'ready' && races.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-5 mb-8">
                            {seasons.length > 0 && (
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="text-[10px] font-mono tracking-[0.35em] text-gray-500 uppercase">Season</span>
                                    <div className="flex flex-wrap gap-2">
                                        {seasons.map((value) => {
                                            const isActive = value === activeSeason
                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleSeason(value)}
                                                    className={`relative rounded-sm border px-5 py-2 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                        ${isActive
                                                            ? 'border-purple-500 bg-purple-700/20 shadow-[0_0_30px_rgba(126,34,206,0.25)]'
                                                            : 'border-white/20 bg-black/30 hover:border-white/50 hover:bg-white/[0.06]'}`}
                                                >
                                                    <span
                                                        className={`text-sm tracking-[0.1em] ${isActive ? 'text-white' : 'text-gray-400'}`}
                                                        style={{ fontFamily: 'var(--font-russo)' }}
                                                    >
                                                        {value}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                {locatedCount} circuits mapped
                            </div>
                        </div>
                    )}

                    {/* ── États ── */}
                    {status === 'error' && (
                        <div className="py-16 flex flex-col items-center text-center gap-6">
                            <p className="text-gray-400 text-lg" style={{ fontFamily: 'var(--font-barlow)' }}>
                                The calendar could not be loaded right now.
                            </p>
                            <button
                                onClick={() => {
                                    setStatus('loading')
                                    setReloadKey((key) => key + 1)
                                }}
                                className="px-8 py-3 border border-white/20 rounded-sm text-white text-sm font-semibold tracking-wider uppercase cursor-pointer
                                           transition-all duration-500 hover:border-purple-700 hover:bg-purple-700/10"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className="mx-auto h-[520px] w-full max-w-[520px] rounded-full bg-white/[0.03] animate-pulse" aria-label="Loading globe" />
                    )}

                    {status === 'ready' && races.length === 0 && (
                        <p className="py-16 text-center text-gray-400 text-lg" style={{ fontFamily: 'var(--font-barlow)' }}>
                            No races in the database yet — the next data sync will populate the calendar.
                        </p>
                    )}

                    {status === 'ready' && races.length > 0 && (
                        <div
                            ref={globeWrapRef}
                            className="relative h-[520px] sm:h-[600px] lg:h-[72vh] w-full"
                            style={{ opacity: 0 }}
                        >
                            {/* Lueur radiale derrière le globe */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        'radial-gradient(circle at 50% 45%, rgba(126,34,206,0.12) 0%, transparent 55%)',
                                }}
                            />
                            <RaceGlobe
                                races={races}
                                nextRaceId={nextRace?.id ?? null}
                                selectedId={selectedRace?.id ?? null}
                                onSelectRace={setSelectedRace}
                                className="h-full w-full"
                            />

                            {/* Fiche détail du circuit sélectionné */}
                            {selectedRace && (
                                <div className="pointer-events-none absolute z-20 inset-x-4 bottom-4 flex justify-center sm:inset-x-auto sm:right-6 sm:top-6 sm:bottom-auto sm:block">
                                    <CircuitDetailPanel
                                        key={selectedRace.id}
                                        race={selectedRace}
                                        totalRounds={races.length}
                                        onClose={() => setSelectedRace(null)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════ STANDINGS PLACEHOLDER ═══════════ */}
            <div style={{ background: 'linear-gradient(180deg, #060918 0%, #0a0e27 100%)' }}>
                <PlaceholderBand id="standings" num="04" title="The Standings" />
            </div>
        </main>
    )
}
