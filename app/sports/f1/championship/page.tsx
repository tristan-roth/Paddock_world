'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CheckeredFlag from '@/components/f1/CheckeredFlag'
import OutlineText from '@/components/f1/OutlineText'
import Navbar from '@/components/Navbar'
import NextRace from '@/components/NextRace'
import { formatFullDate, formatShortDate, todayISO } from '@/lib/f1/date'
import type { RaceWithCircuit } from '@/lib/f1/types'

gsap.registerPlugin(ScrollTrigger)

type LoadStatus = 'loading' | 'ready' | 'error'
type RaceStatus = 'past' | 'next' | 'future'

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
    const [continent, setContinent] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [reloadKey, setReloadKey] = useState(0)

    const titleRef = useRef<HTMLHeadingElement>(null)
    const sweepRef = useRef<HTMLDivElement>(null)
    const purpleLineRef = useRef<HTMLDivElement>(null)
    const heroNavRef = useRef<HTMLDivElement>(null)
    const giantCalRef = useRef<HTMLDivElement>(null)
    const calHeaderRef = useRef<HTMLDivElement>(null)
    const boardRef = useRef<HTMLDivElement>(null)
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

    const nextRace = useMemo(
        () => races.find((race) => race.date >= today) ?? null,
        [races, today],
    )

    const raceStatus = (race: RaceWithCircuit): RaceStatus => {
        if (race.date < today) return 'past'
        if (nextRace && race.id === nextRace.id) return 'next'
        return 'future'
    }

    const continents = useMemo(() => {
        const values = new Set<string>()
        for (const race of races) {
            if (race.circuit.continent) values.add(race.circuit.continent)
        }
        return [...values]
    }, [races])

    const filteredRaces = useMemo(
        () => (continent ? races.filter((race) => race.circuit.continent === continent) : races),
        [races, continent],
    )

    const pastCount = useMemo(() => races.filter((race) => race.date < today).length, [races, today])
    const sprintCount = useMemo(() => races.filter((race) => race.sprintWeekend).length, [races])

    const handleSeason = (value: number) => {
        if (value === activeSeason || status === 'loading') return
        setExpandedId(null)
        setContinent(null)
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

    // ── Animations d'entrée (indépendantes des données) ──
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

    // ── Animations dépendantes des données ──
    useEffect(() => {
        if (status !== 'ready') return

        const ctx = gsap.context(() => {
            // Le board s'allume ligne par ligne, comme un écran de chronométrage
            const rows = boardRef.current?.querySelectorAll<HTMLElement>('.board-row')
            if (rows && rows.length > 0) {
                gsap.fromTo(
                    rows,
                    { opacity: 0, x: -34 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.45,
                        stagger: 0.055,
                        ease: 'power2.out',
                        scrollTrigger: { trigger: boardRef.current, start: 'top 82%' },
                    },
                )
            }

            ScrollTrigger.refresh()
        })

        return () => ctx.revert()
    }, [status, continent, races])

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
                                className="champ-plate group relative"
                                style={{ opacity: 0 }}
                            >
                                <div
                                    className={`relative -skew-x-12 border px-5 py-4 overflow-hidden
                                               transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                               ${section.ready
                                            ? 'border-purple-500/50 bg-purple-700/10 group-hover:bg-purple-700/25 group-hover:shadow-[0_0_35px_rgba(126,34,206,0.25)]'
                                            : 'border-white/15 bg-black/30 group-hover:border-white/40 group-hover:bg-white/[0.06]'}`}
                                >
                                    <div className="skew-x-12 flex flex-col items-start gap-1">
                                        <span className={`text-[10px] font-mono tracking-[0.3em] ${section.ready ? 'text-purple-400' : 'text-white/25'}`}>
                                            {section.num}
                                        </span>
                                        <span
                                            className="text-white text-sm font-bold tracking-[0.15em] uppercase"
                                            style={{ fontFamily: 'var(--font-outfit)' }}
                                        >
                                            {section.name}
                                        </span>
                                        <span className={`text-[9px] font-mono tracking-[0.25em] uppercase ${section.ready ? 'text-purple-400/80' : 'text-gray-600'}`}>
                                            {section.ready ? '● Available' : 'Soon'}
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

            {/* ═══════════ THE CALENDAR ═══════════ */}
            <section
                id="calendar"
                className="scroll-mt-20 relative px-5 sm:px-8 md:px-16 pt-24 pb-28"
                style={{ background: 'linear-gradient(180deg, #060918 0%, #0a0e27 60%, #060918 100%)' }}
            >
                {/* Mot géant en parallax derrière l'en-tête */}
                <div ref={giantCalRef} className="absolute top-10 left-0 whitespace-nowrap pointer-events-none">
                    <OutlineText className="text-[110px] sm:text-[160px] lg:text-[220px]">
                        CALENDAR
                    </OutlineText>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* ── En-tête de section ── */}
                    <div ref={calHeaderRef} className="relative pt-14 mb-12">
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
                            Every round of the season — served from our own database, never dependent on race-day APIs.
                        </p>
                    </div>

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
                                className="px-8 py-3 border border-white/20 -skew-x-12 text-white text-sm font-semibold tracking-wider uppercase cursor-pointer
                                           transition-all duration-500 hover:border-purple-700 hover:bg-purple-700/10"
                            >
                                <span className="inline-block skew-x-12">Try again</span>
                            </button>
                        </div>
                    )}

                    {status === 'loading' && (
                        <div className="space-y-3" aria-label="Loading calendar">
                            <div className="h-48 bg-white/[0.04] border border-white/10 animate-pulse" />
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-16 bg-white/[0.03] border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {status === 'ready' && races.length === 0 && (
                        <p className="py-16 text-center text-gray-400 text-lg" style={{ fontFamily: 'var(--font-barlow)' }}>
                            No races in the database yet — the next data sync will populate the calendar.
                        </p>
                    )}

                    {status === 'ready' && races.length > 0 && (
                        <>
                            {/* ── Sélecteur de saison ── */}
                            {seasons.length > 0 && (
                                <div className="flex flex-wrap items-center gap-4 mb-10">
                                    <span className="text-[10px] font-mono tracking-[0.35em] text-gray-500 uppercase">
                                        Season
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {seasons.map((value) => {
                                            const isActive = value === activeSeason
                                            return (
                                                <button
                                                    key={value}
                                                    onClick={() => handleSeason(value)}
                                                    className={`relative -skew-x-12 px-5 py-2 border cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                        ${isActive
                                                            ? 'border-purple-500 bg-purple-700 shadow-[0_0_30px_rgba(126,34,206,0.35)]'
                                                            : 'border-white/15 bg-black/30 hover:border-white/50 hover:bg-white/[0.06]'}`}
                                                >
                                                    <span
                                                        className={`inline-block skew-x-12 text-sm tracking-[0.1em] ${isActive ? 'text-white' : 'text-gray-400'}`}
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

                            {/* ── Next race spotlight (composant partagé, issue #3) ── */}
                            <NextRace race={nextRace} totalRounds={races.length} className="mb-14" />

                            {/* ── Barre de contrôle du board ── */}
                            <div className="flex flex-wrap items-center justify-between gap-5 mb-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    {continents.length > 0 &&
                                        [null, ...continents].map((value) => {
                                            const isActive = continent === value
                                            return (
                                                <button
                                                    key={value ?? 'all'}
                                                    onClick={() => setContinent(value)}
                                                    className={`-skew-x-12 px-4 py-1.5 border text-[11px] font-semibold tracking-[0.2em] uppercase cursor-pointer
                                                               transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                               ${isActive
                                                            ? 'border-purple-500 bg-purple-700/30 text-white'
                                                            : 'border-white/10 text-gray-500 hover:text-white hover:border-white/40'}`}
                                                    style={{ fontFamily: 'var(--font-outfit)' }}
                                                >
                                                    <span className="inline-block skew-x-12">{value ?? 'All'}</span>
                                                </button>
                                            )
                                        })}
                                </div>
                                <div className="flex items-center gap-6 text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">
                                    <span>{pastCount} / {races.length} completed</span>
                                    <span className="hidden sm:inline">{sprintCount} sprints</span>
                                </div>
                            </div>

                            {/* Barre de progression de saison */}
                            <div className="relative h-[3px] mb-8 bg-white/5 overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-800 via-purple-600 to-purple-400 transition-all duration-1000 ease-out"
                                    style={{ width: races.length > 0 ? `${(pastCount / races.length) * 100}%` : '0%' }}
                                />
                            </div>

                            {/* ── Timing board ── */}
                            {filteredRaces.length === 0 ? (
                                <p className="text-center text-gray-400 text-lg py-16" style={{ fontFamily: 'var(--font-barlow)' }}>
                                    No race matches this filter.
                                </p>
                            ) : (
                                <div ref={boardRef}>
                                    {/* En-têtes de colonnes */}
                                    <div className="hidden md:grid grid-cols-[86px_1fr_120px_130px_40px] gap-4 px-4 pb-3 border-b border-white/10
                                                    text-[9px] font-mono tracking-[0.35em] text-gray-600 uppercase">
                                        <span>Rnd</span>
                                        <span>Grand Prix</span>
                                        <span>Date</span>
                                        <span className="text-right">Status</span>
                                        <span />
                                    </div>

                                    <div>
                                        {filteredRaces.map((race) => {
                                            const state = raceStatus(race)
                                            const isExpanded = expandedId === race.id

                                            return (
                                                <div
                                                    key={race.id}
                                                    className={`board-row border-b border-white/[0.06]
                                                        ${state === 'next' ? 'bg-purple-700/[0.08]' : ''}`}
                                                    style={{ opacity: 0 }}
                                                >
                                                    {/* Wrapper dédié à l'en-tête : la barre d'accent doit rester
                                                        cadrée sur cette ligne, jamais sur la fiche dépliée en dessous
                                                        (sinon, skewée sur toute la hauteur dépliée, elle dérive et
                                                        traverse le numéro de manche — bug constaté à l'usage). */}
                                                    <div className="relative">
                                                        {/* Accent gauche incliné */}
                                                        <div
                                                            className={`absolute left-0 top-2 bottom-2 w-[3px] -skew-x-12 pointer-events-none
                                                                ${state === 'next'
                                                                    ? 'bg-gradient-to-b from-purple-500 to-purple-700'
                                                                    : state === 'past'
                                                                        ? 'bg-white/10'
                                                                        : 'bg-white/25'}`}
                                                        />

                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : race.id)}
                                                            aria-expanded={isExpanded}
                                                            className={`w-full grid grid-cols-[52px_1fr_auto] md:grid-cols-[86px_1fr_120px_130px_40px] items-center gap-3 md:gap-4 px-4 py-4 text-left cursor-pointer
                                                                       transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                                       hover:bg-white/[0.04] hover:pl-6
                                                                       ${state === 'past' && !isExpanded ? 'opacity-50 hover:opacity-90' : ''}`}
                                                        >
                                                        {/* Round */}
                                                        <span
                                                            className={`text-xl md:text-2xl font-black tabular-nums leading-none
                                                                ${state === 'next' ? 'text-purple-400' : state === 'past' ? 'text-gray-600' : 'text-white/80'}`}
                                                            style={{ fontFamily: 'var(--font-russo)' }}
                                                        >
                                                            {String(race.round).padStart(2, '0')}
                                                        </span>

                                                        {/* GP + circuit */}
                                                        <span className="min-w-0">
                                                            <span className="flex items-center gap-2 flex-wrap">
                                                                <span
                                                                    className={`text-sm md:text-base font-bold uppercase tracking-[0.08em] truncate
                                                                        ${state === 'past' ? 'text-gray-400' : 'text-white'}`}
                                                                    style={{ fontFamily: 'var(--font-outfit)' }}
                                                                >
                                                                    {race.name}
                                                                </span>
                                                                {race.sprintWeekend && (
                                                                    <span className="shrink-0 px-2 py-0.5 -skew-x-12 bg-gradient-to-r from-purple-700 to-purple-500 text-white text-[8px] font-bold tracking-[0.2em] uppercase">
                                                                        <span className="inline-block skew-x-12">Sprint</span>
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="block text-gray-500 text-xs truncate mt-0.5" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                                {race.circuit.name} — {race.circuit.locality}, {race.circuit.country}
                                                            </span>
                                                        </span>

                                                        {/* Date */}
                                                        <span
                                                            className={`hidden md:block text-sm tracking-[0.12em] tabular-nums
                                                                ${state === 'past' ? 'text-gray-600' : 'text-white/80'}`}
                                                            style={{ fontFamily: 'var(--font-russo)' }}
                                                        >
                                                            {formatShortDate(race.date)}
                                                        </span>

                                                        {/* Status */}
                                                        <span className="flex md:justify-end">
                                                            {state === 'past' && (
                                                                <span className="inline-flex items-center gap-1.5 text-gray-500 text-[9px] font-mono tracking-[0.25em] uppercase">
                                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                    </svg>
                                                                    <span className="hidden md:inline">Finished</span>
                                                                </span>
                                                            )}
                                                            {state === 'next' && (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 -skew-x-12 bg-purple-700 text-white text-[9px] font-bold tracking-[0.25em] uppercase animate-pulse">
                                                                    <span className="inline-block skew-x-12">Next</span>
                                                                </span>
                                                            )}
                                                            {state === 'future' && (
                                                                <span className="hidden md:inline text-gray-600 text-[9px] font-mono tracking-[0.25em] uppercase">
                                                                    Upcoming
                                                                </span>
                                                            )}
                                                        </span>

                                                        {/* Chevron */}
                                                        <svg
                                                            className={`hidden md:block w-4 h-4 justify-self-end text-gray-600 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-purple-400' : ''}`}
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                        </button>
                                                    </div>

                                                    {/* Fiche circuit dépliable */}
                                                    <div
                                                        className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                            ${isExpanded ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}
                                                    >
                                                        <div className="mx-4 mb-5 border-l-2 border-purple-700/60 bg-black/30 px-6 py-5">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                                                                {[
                                                                    { label: 'Circuit', value: race.circuit.name },
                                                                    { label: 'Location', value: `${race.circuit.locality}, ${race.circuit.country}` },
                                                                    { label: 'Race date', value: formatFullDate(race.date) },
                                                                    { label: 'Continent', value: race.circuit.continent ?? '—' },
                                                                    { label: 'Length', value: race.lengthKm !== null ? `${race.lengthKm.toFixed(3)} km` : '—' },
                                                                    { label: 'Laps', value: race.laps !== null ? String(race.laps) : '—' },
                                                                    { label: 'Format', value: race.sprintWeekend ? '🏎️ Sprint Weekend' : 'Standard' },
                                                                    { label: 'Round', value: `${race.round} / ${races.length}` },
                                                                ].map((spec) => (
                                                                    <div key={spec.label}>
                                                                        <p className="text-[9px] font-mono tracking-[0.3em] text-gray-600 uppercase mb-1">
                                                                            {spec.label}
                                                                        </p>
                                                                        <p className="text-white/90 text-sm" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                                            {spec.value}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Drapeau à damier en clôture */}
                                    <div className="flex items-center justify-center gap-4 pt-12">
                                        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-white/20" />
                                        <CheckeredFlag className="w-12 h-8" />
                                        <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-white/20" />
                                    </div>
                                </div>
                            )}
                        </>
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
