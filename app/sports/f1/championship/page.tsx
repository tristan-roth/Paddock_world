'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BackgroundShapes from '@/components/BackgroundShapes'
import ChampionshipBackground from '@/components/f1/ChampionshipBackground'
import CircuitDetailPanel from '@/components/f1/CircuitDetailPanel'
import OutlineText from '@/components/f1/OutlineText'
import SeasonPicker from '@/components/f1/SeasonPicker'
import SectionDivider from '@/components/f1/SectionDivider'
import StandingsSection from '@/components/f1/StandingsSection'
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

/** Bandeau placeholder pour les sections à venir (issues #4, #5). */
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

    const heroRef = useRef<HTMLElement>(null)
    const bgTextRef = useRef<HTMLDivElement>(null)
    const bgTextH1Ref = useRef<HTMLHeadingElement>(null)
    const heroContentRef = useRef<HTMLDivElement>(null)
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

            gsap.fromTo(
                bgTextH1Ref.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 2, ease: 'power3.out', delay: 0.1 }
            )

            gsap.to(bgTextRef.current, {
                y: -150,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            })

            tl.fromTo(
                heroContentRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.4 }
            )


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
        <main className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ overflowX: 'clip' }}>
            <ChampionshipBackground />
            <Navbar shouldAnimate disableEntryAnimation />

            {/* Titre géant d'arrière-plan */}
            <div
                ref={bgTextRef}
                className="absolute top-24 left-0 w-full flex justify-center z-0 overflow-visible px-4 select-none pointer-events-none"
            >
                <h1
                    ref={bgTextH1Ref}
                    className="text-[#202020] font-black tracking-tighter leading-[0.8] text-center w-full"
                    style={{ fontFamily: 'var(--font-russo)', fontSize: '11vw' }}
                >
                    CHAMPIONSHIP
                </h1>
            </div>

            {/* ═══════════ HERO ═══════════ */}
            <section
                ref={heroRef as React.RefObject<HTMLElement>}
                className="relative z-10 w-full min-h-[55vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-40 pb-20"
            >
                <div ref={heroContentRef} className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto">
                    <h2
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white uppercase tracking-tight leading-none drop-shadow-2xl mb-6"
                        style={{ fontFamily: 'var(--font-russo)' }}
                    >
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-700" style={{ fontFamily: 'var(--font-playfair)' }}>CHAMPIONSHIP</span>
                    </h2>
                    <p className="text-gray-400 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl" style={{ fontFamily: 'var(--font-barlow)' }}>
                        Drivers, teams, calendar, and standings — follow the peak of motorsport.
                    </p>
                </div>
            </section>

            {/* ═══════════ SECTIONS PLACEHOLDER ═══════════ */}
            <div className="relative z-10">
                <SectionDivider />
                <PlaceholderBand id="drivers" num="01" title="The Drivers" />
                <PlaceholderBand id="teams" num="02" title="The Teams" />
            </div>

            {/* ═══════════ THE CALENDAR (globe 3D) ═══════════ */}
            {/* Fond transparent : c'est ChampionshipBackground, en position
                fixed, qui porte désormais la couleur et la fait évoluer. */}
            <section
                id="calendar"
                className="scroll-mt-20 relative z-10 px-5 sm:px-8 md:px-16 pt-16 pb-28"
            >
                <BackgroundShapes variant="sports" />

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
                            <SeasonPicker
                                seasons={seasons}
                                activeSeason={activeSeason}
                                onSelect={handleSeason}
                                disabled={status !== 'ready'}
                            />
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

            {/* ═══════════ THE STANDINGS (issue #6) ═══════════ */}
            <div className="relative z-10">
                <SectionDivider label="Chequered Flag" flip />
            </div>
            <StandingsSection
                season={activeSeason}
                seasons={seasons}
                onSeasonChange={handleSeason}
            />
        </main>
    )
}
