'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BackgroundShapes from '@/components/BackgroundShapes'
import OutlineText from '@/components/f1/OutlineText'
import SeasonPicker from '@/components/f1/SeasonPicker'
import TeamLogo from '@/components/f1/TeamLogo'
import { flagUrl } from '@/lib/f1/nationality'
import type { Standings } from '@/lib/f1/types'

gsap.registerPlugin(ScrollTrigger)

type LoadStatus = 'loading' | 'ready' | 'error'
type Tab = 'drivers' | 'constructors'

// Couleur de repli : `constructors.color` est saisi à la main en BD (absent de
// l'API Jolpica) et peut manquer pour une écurie récente.
const FALLBACK_TEAM_COLOR = '#6b7280'

/** Points : entier si rond, une décimale sinon (demi-points historiques). */
function formatPoints(points: number): string {
    return Number.isInteger(points) ? String(points) : points.toFixed(1)
}

function Flag({ nationality, className }: { nationality: string | null; className?: string }) {
    const url = flagUrl(nationality)
    if (!url) {
        // Nationalité absente (pilotes de réserve, cf. schema.ts) : pastille
        // neutre, pour ne pas désaligner la colonne.
        return <span className={`inline-block w-5 h-5 rounded-full bg-white/10 shrink-0 ${className ?? ''}`} aria-hidden />
    }
    return (
        // Drapeau 20px servi par flagcdn.com : next/image imposerait d'ouvrir un
        // domaine distant dans next.config pour zéro gain réel à cette taille.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt={nationality ?? ''}
            loading="lazy"
            className={`w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/15 ${className ?? ''}`}
        />
    )
}

/**
 * Portique de départ F1 : les 5 feux s'allument un par un, s'éteignent —
 * et la grille s'élance. Déclencheur visuel de l'entrée des tableaux,
 * escamoté (cf. StandingsSection) une fois son rôle joué.
 */
function StartLights({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
    return (
        <div
            ref={ref}
            className="start-lights inline-flex items-center gap-2 px-4 py-3 border border-white/10 bg-black/40 backdrop-blur-md rounded-sm overflow-hidden"
        >
            {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="flex flex-col items-center gap-1.5">
                    <span className="h-1.5 w-4 rounded-[1px] bg-white/[0.06]" />
                    <span
                        className="light-bulb h-3.5 w-3.5 rounded-full border border-white/10"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                    />
                </span>
            ))}
        </div>
    )
}



interface StandingsSectionProps {
    /**
     * Saison pilotée par la page (partagée avec le calendrier).
     * `null` : la page ne l'a pas encore résolue → on charge la plus récente.
     */
    season: number | null
    /** Saisons disponibles, pour le sélecteur local. */
    seasons: number[]
    onSeasonChange: (season: number) => void
}

/**
 * Section "The Standings" (issue #6) : classements pilotes et constructeurs,
 * en tabs, avec entrée en grille de départ.
 */
export default function StandingsSection({ season, seasons, onSeasonChange }: StandingsSectionProps) {
    const [status, setStatus] = useState<LoadStatus>('loading')
    const [standings, setStandings] = useState<Standings | null>(null)
    const [tab, setTab] = useState<Tab>('drivers')
    const [reloadKey, setReloadKey] = useState(0)

    const sectionRef = useRef<HTMLElement>(null)
    const giantRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const tableRef = useRef<HTMLDivElement>(null)
    const startLightsRef = useRef<HTMLDivElement>(null)
    const didReveal = useRef(false)
    // Mise en grille en cours : tuée avant d'en relancer une (changement
    // d'onglet rapide) et au démontage.
    const gridRef = useRef<gsap.core.Timeline | null>(null)

    // Saison actuellement affichée — lue en ref dans l'effet de fetch pour
    // éviter de refetcher quand la page résout `season` sur la valeur déjà
    // chargée (au retour de /api/f1/calendar), sans la mettre en dépendance.
    const loadedSeason = useRef<number | null>(null)

    // ── Chargement des classements ──
    useEffect(() => {
        if (season !== null && loadedSeason.current === season) return

        let cancelled = false
        const url = season === null ? '/api/f1/standings' : `/api/f1/standings?season=${season}`
        setStatus('loading')

        fetch(url)
            .then((res) => {
                // 404 = saison sans classement en base : cas nominal, pas une erreur.
                if (res.status === 404) return null
                if (!res.ok) throw new Error(`API standings → ${res.status}`)
                return res.json() as Promise<Standings>
            })
            .then((data) => {
                if (cancelled) return
                loadedSeason.current = data?.season ?? season
                didReveal.current = false
                setStandings(data)
                setStatus('ready')
            })
            .catch(() => {
                if (!cancelled) setStatus('error')
            })

        return () => {
            cancelled = true
        }
    }, [season, reloadKey])

    // Saison mise en avant dans le sélecteur : celle demandée par la page, ou
    // à défaut celle réellement chargée (premier rendu, avant résolution).
    const pickerSeason = season ?? standings?.season ?? null

    const activeRound = standings
        ? tab === 'drivers'
            ? standings.driverRound
            : standings.constructorRound
        : null

    const rowCount = standings
        ? tab === 'drivers'
            ? standings.drivers.length
            : standings.constructors.length
        : 0

    /**
     * Mise en grille : les lignes rejoignent leur emplacement en quinconce
     * gauche/droite — la disposition réelle d'une grille de départ F1 — puis
     * les barres d'écart se déploient et les points défilent au compteur.
     */
    const formGrid = useCallback(() => {
        const root = tableRef.current
        if (!root) return

        const podiumCards = root.querySelectorAll<HTMLElement>('.podium-card')
        const capsules = root.querySelectorAll<HTMLElement>('.capsule-row')
        if (podiumCards.length === 0 && capsules.length === 0) return

        gridRef.current?.kill()
        const tl = gsap.timeline()
        gridRef.current = tl

        if (podiumCards.length > 0) {
            tl.fromTo(
                podiumCards,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.85,
                    ease: 'power4.out',
                    stagger: 0.08,
                    clearProps: 'transform',
                },
                0,
            )
        }

        if (capsules.length > 0) {
            tl.fromTo(
                capsules,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.75,
                    ease: 'power4.out',
                    stagger: 0.03,
                    clearProps: 'transform',
                },
                0.25,
            )
        }

        // Compteur de points facon télémétrie : arrondi pendant le défilé,
        // valeur exacte posée à la fin (préserve les demi-points).
        root.querySelectorAll<HTMLElement>('.standing-points').forEach((el, i) => {
            const target = Number(el.dataset.points ?? '0')
            const counter = { value: 0 }
            tl.to(
                counter,
                {
                    value: target,
                    duration: 1.2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = String(Math.round(counter.value))
                    },
                    onComplete: () => {
                        el.textContent = formatPoints(target)
                    },
                },
                0.25 + i * 0.04,
            )
        })

        return tl
    }, [])

    // ── Révélation au scroll : feux de départ puis mise en grille ──
    // Volontairement indépendant de `tab` : un changement d'onglet ne doit pas
    // rejouer la séquence des feux (l'effet ci-dessous s'en charge).
    useEffect(() => {
        if (status !== 'ready' || !standings) return
        if (!tableRef.current?.querySelector('.podium-card, .capsule-row')) return

        const ctx = gsap.context(() => {
            // Parallax du mot géant, comme la section calendrier.
            if (giantRef.current && headerRef.current) {
                gsap.fromTo(
                    giantRef.current,
                    { x: 60 },
                    {
                        x: -120,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: headerRef.current,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: 1,
                        },
                    },
                )
            }

            const bulbs = sectionRef.current?.querySelectorAll<HTMLElement>('.light-bulb')

            // Un changement de saison rejoue cet effet : on ramène le portique
            // dans son état visible avant de reconstruire la séquence.
            if (startLightsRef.current) {
                gsap.set(startLightsRef.current, { clearProps: 'all' })
            }

            const tl = gsap.timeline({
                scrollTrigger: { trigger: tableRef.current, start: 'top 80%', once: true },
            })

            if (bulbs && bulbs.length > 0) {
                // Allumage un par un…
                tl.to(bulbs, {
                    background: 'rgba(168,85,247,1)',
                    borderColor: 'rgba(216,180,254,0.9)',
                    boxShadow: '0 0 16px rgba(168,85,247,0.9)',
                    duration: 0.18,
                    stagger: 0.16,
                })
                    // …temps mort, comme avant un départ réel…
                    .to({}, { duration: 0.45 })
                    // …extinction : lights out.
                    .to(bulbs, {
                        background: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        boxShadow: '0 0 0 rgba(0,0,0,0)',
                        duration: 0.12,
                    })
            }

            // Le portique a joué son rôle de déclencheur : il se rétracte et
            // s'efface — sans être démonté, pour pouvoir rejouer la séquence
            // au prochain changement de saison.
            const lightsEl = startLightsRef.current
            if (lightsEl) {
                const startWidth = lightsEl.getBoundingClientRect().width
                tl.to(
                    lightsEl,
                    {
                        width: 0,
                        opacity: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                        duration: 0.6,
                        ease: 'power3.inOut',
                        onStart: () => {
                            lightsEl.style.width = `${startWidth}px`
                        },
                        onComplete: () => gsap.set(lightsEl, { display: 'none' }),
                    },
                    '+=0.15',
                )
            }

            // `call` plutôt que `add` : la grille est construite au moment où
            // les feux s'éteignent, à partir des lignes réellement affichées.
            tl.call(() => {
                didReveal.current = true
                formGrid()
            })
        }, sectionRef)

        return () => {
            ctx.revert()
            gridRef.current?.kill()
        }
    }, [status, standings, formGrid])

    // ── Changement d'onglet : remise en grille immédiate (hors scroll) ──
    // Tant que la section n'a pas été révélée, c'est la séquence des feux qui
    // animera les lignes du nouvel onglet — ne rien lancer ici.
    useEffect(() => {
        if (!didReveal.current || status !== 'ready') return
        formGrid()
    }, [tab, status, formGrid])

    return (
        <section
            ref={sectionRef as React.RefObject<HTMLElement>}
            id="standings"
            className="scroll-mt-20 relative z-10 px-5 sm:px-8 md:px-16 pt-10 pb-28"
        >
            {/* Fond transparent : la couleur vient de ChampionshipBackground,
                en position fixed, qui évolue au fil des sections. */}
            <BackgroundShapes variant="sports" drawStart="top 85%" drawEnd="bottom 60%" />

            {/* Mot géant en parallax derrière l'en-tête */}
            <div ref={giantRef} className="absolute top-6 left-0 whitespace-nowrap pointer-events-none">
                <OutlineText className="text-[110px] sm:text-[160px] lg:text-[220px]">
                    STANDINGS
                </OutlineText>
            </div>

            <div className="relative max-w-6xl mx-auto">
                {/* ── En-tête de section ── */}
                <div ref={headerRef} className="relative pt-14 mb-8">
                    <div className="flex items-baseline gap-5 mb-2">
                        <span className="text-xs font-mono tracking-[0.3em] text-purple-400">04</span>
                        <h2
                            className="text-white text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-[0.06em]"
                            style={{ fontFamily: 'var(--font-outfit)' }}
                        >
                            The Standings
                        </h2>
                    </div>
                    <p className="text-gray-500 text-sm md:text-base ml-0 sm:ml-12" style={{ fontFamily: 'var(--font-barlow)' }}>
                        Every point scored, every position defended — refreshed after each Grand Prix.
                    </p>
                </div>

                {/* ── Saison + round : hors du garde `ready`, pour pouvoir changer
                       d'année sans attendre (ni remonter jusqu'au calendrier). ── */}
                <div className="flex flex-wrap items-center justify-between gap-5 mb-5">
                    <SeasonPicker
                        seasons={seasons}
                        activeSeason={pickerSeason}
                        onSelect={onSeasonChange}
                        disabled={status === 'loading'}
                    />
                    {activeRound !== null && (
                        <span className="px-4 py-1.5 border border-white/15 -skew-x-12 text-[10px] font-mono tracking-[0.25em] uppercase text-gray-400">
                            <span className="inline-flex items-center gap-2 skew-x-12">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                Updated after Round {activeRound}
                            </span>
                        </span>
                    )}
                </div>

                {/* ── Onglets pilotes / écuries + portique de départ ── */}
                {status === 'ready' && standings && (
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="flex gap-2">
                            {([
                                { key: 'drivers', label: 'Drivers' },
                                { key: 'constructors', label: 'Constructors' },
                            ] as const).map(({ key, label }) => {
                                const isActive = tab === key
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setTab(key)}
                                        aria-pressed={isActive}
                                        className={`relative rounded-sm border px-5 py-2 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                            ${isActive
                                                ? 'border-purple-500 bg-purple-700/20 shadow-[0_0_30px_rgba(126,34,206,0.25)]'
                                                : 'border-white/20 bg-black/30 hover:border-white/50 hover:bg-white/[0.06]'}`}
                                    >
                                        <span
                                            className={`text-sm tracking-[0.1em] uppercase ${isActive ? 'text-white' : 'text-gray-400'}`}
                                            style={{ fontFamily: 'var(--font-russo)' }}
                                        >
                                            {label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                        <StartLights ref={startLightsRef} />
                    </div>
                )}

                {/* ── États ── */}
                {status === 'error' && (
                    <div className="py-16 flex flex-col items-center text-center gap-6">
                        <p className="text-gray-400 text-lg" style={{ fontFamily: 'var(--font-barlow)' }}>
                            The standings could not be loaded right now.
                        </p>
                        <button
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="px-8 py-3 border border-white/20 rounded-sm text-white text-sm font-semibold tracking-wider uppercase cursor-pointer
                                       transition-all duration-500 hover:border-purple-700 hover:bg-purple-700/10"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="space-y-2.5 py-6" aria-label="Loading standings">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-14 border border-white/5 bg-white/[0.03] animate-pulse" />
                        ))}
                    </div>
                )}

                {status === 'ready' && !standings && (
                    <p className="py-16 text-center text-gray-400 text-lg" style={{ fontFamily: 'var(--font-barlow)' }}>
                        No standings in the database yet — the next data sync will populate them.
                    </p>
                )}

                {status === 'ready' && standings && rowCount === 0 && (
                    <p className="py-16 text-center text-gray-400 text-lg" style={{ fontFamily: 'var(--font-barlow)' }}>
                        No {tab === 'drivers' ? 'driver' : 'constructor'} standings for this season yet.
                    </p>
                )}

                {status === 'ready' && standings && rowCount > 0 && (
                    <div ref={tableRef} className="relative overflow-visible">
                        {/* Styles pour Option 2 Podium & Capsules */}
                        <style>{`
                            .podium-card {
                                transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s !important;
                            }
                            .podium-card:hover {
                                transform: translateY(-10px) scale(1.025) !important;
                                border-color: var(--team-color) !important;
                                box-shadow: 0 15px 40px var(--team-color-glow) !important;
                                background-color: rgba(255, 255, 255, 0.05) !important;
                                z-index: 10;
                            }
                            .capsule-row {
                                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s !important;
                            }
                            @media (min-width: 768px) {
                                .capsule-row {
                                    transform: skewX(-8deg) !important;
                                }
                                .capsule-row:hover {
                                    transform: translateY(-3px) skewX(-8deg) !important;
                                    border-color: var(--team-color) !important;
                                    box-shadow: 0 8px 24px var(--team-color-glow) !important;
                                    background-color: rgba(255, 255, 255, 0.04) !important;
                                    z-index: 10;
                                }
                                .capsule-inner {
                                    transform: skewX(8deg) !important;
                                }
                            }
                        `}</style>

                        {/* Section Podium (Top 3) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12 max-w-5xl mx-auto px-2">
                            {(() => {
                                const top3 = (tab === 'drivers' ? standings.drivers : standings.constructors).slice(0, 3)
                                if (top3.length === 0) return null

                                return top3.map((entry) => {
                                    const color = (tab === 'drivers' 
                                        ? (entry as typeof standings.drivers[0]).constructor.color 
                                        : (entry as typeof standings.constructors[0]).constructor.color) ?? FALLBACK_TEAM_COLOR
                                    const isFirst = entry.position === 1
                                    const isSecond = entry.position === 2

                                    const heightClass = isFirst
                                        ? 'h-[22rem] md:h-[26rem] border-purple-500/30 bg-purple-950/5 shadow-[0_0_40px_rgba(168,85,247,0.06)]'
                                        : isSecond
                                        ? 'h-[19.5rem] md:h-[23rem] border-white/5 bg-white/[0.02]'
                                        : 'h-[18rem] md:h-[21.5rem] border-white/5 bg-white/[0.01]'

                                    const orderClass = isFirst
                                        ? 'order-1 md:order-2'
                                        : isSecond
                                        ? 'order-2 md:order-1'
                                        : 'order-3 md:order-3'

                                    return (
                                        <div
                                            key={tab === 'drivers' 
                                                ? (entry as typeof standings.drivers[0]).driver.id 
                                                : (entry as typeof standings.constructors[0]).constructor.id}
                                            className={`podium-card group relative ${heightClass} ${orderClass} flex flex-col justify-between p-6 md:p-8 rounded-2xl border backdrop-blur-md`}
                                            style={{
                                                '--team-color': color,
                                                '--team-color-glow': `${color}44`,
                                                opacity: 0,
                                            } as React.CSSProperties}
                                        >
                                            {/* Card Top: label + numéro de position en contour, teinté écurie */}
                                            <div className="flex items-center justify-between w-full relative z-10">
                                                <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] text-gray-500 uppercase">
                                                    {isFirst ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                                                                <path d="M5 16h14a1 1 0 001-.8L22 4.5l-4.5 4.5L12 2 6.5 9 2 4.5 4 15.2a1 1 0 001 .8zM4 18h16v2H4z" />
                                                            </svg>
                                                            Championship Leader
                                                        </>
                                                    ) : isSecond ? (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="8" r="7" />
                                                                <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                                                            </svg>
                                                            2nd Place
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-3.5 h-3.5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="8" r="7" />
                                                                <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
                                                            </svg>
                                                            3rd Place
                                                        </>
                                                    )}
                                                </span>
                                                <OutlineText
                                                    className="text-2xl md:text-3xl"
                                                    stroke={`1.5px ${isFirst ? '#fbbf24' : isSecond ? '#cbd5e1' : '#b45309'}`}
                                                >
                                                    {String(entry.position).padStart(2, '0')}
                                                </OutlineText>
                                            </div>

                                            {/* Card Middle: Driver or Constructor details */}
                                            {tab === 'drivers' ? (
                                                <div className="my-auto flex flex-col items-center text-center gap-3 relative z-10">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-[0.15em] mb-0.5" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                            {(entry as typeof standings.drivers[0]).driver.firstName}
                                                        </span>
                                                        <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-wider font-outfit">
                                                            {(entry as typeof standings.drivers[0]).driver.lastName}
                                                        </h3>
                                                        <div className="flex items-center justify-center gap-2 mt-2">
                                                            <Flag nationality={(entry as typeof standings.drivers[0]).driver.nationality} />
                                                            {(entry as typeof standings.drivers[0]).driver.code && (
                                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest bg-white/5 text-gray-500 border border-white/5">
                                                                    {(entry as typeof standings.drivers[0]).driver.code}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Écurie secondaire sous forme de pillule discrète */}
                                                    <div className="mt-4 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/5 hover:border-[var(--team-color)]/30 hover:bg-white/[0.05] transition-all duration-300">
                                                        <TeamLogo
                                                            id={(entry as typeof standings.drivers[0]).constructor.id}
                                                            name={(entry as typeof standings.drivers[0]).constructor.name}
                                                            color={color}
                                                            className="h-4 w-8 opacity-70"
                                                        />
                                                        <span className="text-gray-400 text-xs font-medium" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                            {(entry as typeof standings.drivers[0]).constructor.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="my-auto flex flex-col items-center text-center gap-3 relative z-10">
                                                    <TeamLogo
                                                        id={(entry as typeof standings.constructors[0]).constructor.id}
                                                        name={(entry as typeof standings.constructors[0]).constructor.name}
                                                        color={color}
                                                        className="h-16 w-24 opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                                                    />
                                                    <div className="mt-2">
                                                        <h3 className="text-white text-lg md:text-2xl font-black uppercase tracking-wider font-outfit mt-0.5">
                                                            {(entry as typeof standings.constructors[0]).constructor.name}
                                                        </h3>
                                                        <Flag nationality={(entry as typeof standings.constructors[0]).constructor.nationality} className="mt-1 mx-auto" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Card Bottom: Stats */}
                                            <div className="mt-auto w-full pt-4 border-t border-white/5 flex flex-col gap-2 relative z-10">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Wins</span>
                                                    <span className="text-white font-semibold font-barlow">
                                                        {entry.wins > 0 ? `${entry.wins} win${entry.wins > 1 ? 's' : ''}` : '—'}
                                                    </span>
                                                </div>
                                                <div className="flex items-end justify-between mt-2">
                                                    <span className="text-gray-500 text-[10px] uppercase font-mono tracking-wider">Points</span>
                                                    <span 
                                                        className="standing-points text-2xl md:text-3xl font-black font-russo leading-none text-white"
                                                        data-points={entry.points}
                                                    >
                                                        {formatPoints(entry.points)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
                        </div>

                        {/* Section Capsules (Rest 4th+) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto px-2">
                            {tab === 'drivers'
                                ? standings.drivers.slice(3).map((entry) => {
                                    const color = entry.constructor.color ?? FALLBACK_TEAM_COLOR

                                    return (
                                        <div
                                            key={entry.driver.id}
                                            className="capsule-row group relative border border-white/[0.08] bg-black/20 backdrop-blur-md px-5 py-4 flex items-center justify-between overflow-hidden rounded-xl md:rounded-none"
                                            style={{
                                                '--team-color': color,
                                                '--team-color-glow': `${color}22`,
                                                opacity: 0,
                                            } as React.CSSProperties}
                                        >
                                            {/* Telemetry LED glow sweep */}
                                            <span
                                                className="absolute inset-y-0 -left-full w-1/2 pointer-events-none opacity-0
                                                           group-hover:opacity-100 group-hover:translate-x-[400%]
                                                           transition-all duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                                                style={{ background: `linear-gradient(90deg, transparent, ${color}14, transparent)` }}
                                            />
                                            {/* Liseré écurie sur le côté gauche */}
                                            <span
                                                className="absolute left-0 top-0 bottom-0 w-[4px]"
                                                style={{ background: color }}
                                            />

                                            <div className="capsule-inner w-full flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-500 font-mono">
                                                        {entry.position}
                                                    </span>
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Flag nationality={entry.driver.nationality} />
                                                        <div className="min-w-0 truncate">
                                                            <span className="text-gray-400 text-xs hidden sm:inline mr-1" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                                {entry.driver.firstName}
                                                            </span>
                                                            <span className="text-white text-sm font-bold uppercase tracking-wider font-outfit">
                                                                {entry.driver.lastName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="hidden sm:flex items-center gap-2">
                                                        <TeamLogo id={entry.constructor.id} name={entry.constructor.name} color={color} className="h-5 w-8 opacity-80" />
                                                        <span className="text-gray-500 text-xs truncate max-w-[90px]" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                            {entry.constructor.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {entry.wins > 0 && (
                                                            <span className="hidden lg:inline text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                                                                {entry.wins} win{entry.wins > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span
                                                        className="standing-points text-white text-base font-black font-russo min-w-[50px] text-right"
                                                        data-points={entry.points}
                                                    >
                                                        {formatPoints(entry.points)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                                : standings.constructors.slice(3).map((entry) => {
                                    const color = entry.constructor.color ?? FALLBACK_TEAM_COLOR

                                    return (
                                        <div
                                            key={entry.constructor.id}
                                            className="capsule-row group relative border border-white/[0.08] bg-black/20 backdrop-blur-md px-5 py-4 flex items-center justify-between overflow-hidden rounded-xl md:rounded-none"
                                            style={{
                                                '--team-color': color,
                                                '--team-color-glow': `${color}22`,
                                                opacity: 0,
                                            } as React.CSSProperties}
                                        >
                                            <span
                                                className="absolute inset-y-0 -left-full w-1/2 pointer-events-none opacity-0
                                                           group-hover:opacity-100 group-hover:translate-x-[400%]
                                                           transition-all duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                                                style={{ background: `linear-gradient(90deg, transparent, ${color}14, transparent)` }}
                                            />
                                            <span
                                                className="absolute left-0 top-0 bottom-0 w-[4px]"
                                                style={{ background: color }}
                                            />

                                            <div className="capsule-inner w-full flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-500 font-mono">
                                                        {entry.position}
                                                    </span>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <TeamLogo id={entry.constructor.id} name={entry.constructor.name} color={color} className="h-6 w-9 shrink-0" />
                                                        <span className="text-white text-sm font-bold uppercase tracking-wider font-outfit truncate">
                                                            {entry.constructor.name}
                                                        </span>
                                                        <Flag nationality={entry.constructor.nationality} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="flex items-center gap-3">
                                                        {entry.wins > 0 && (
                                                            <span className="hidden lg:inline text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                                                                {entry.wins} win{entry.wins > 1 ? 's' : ''}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <span
                                                        className="standing-points text-white text-base font-black font-russo min-w-[50px] text-right"
                                                        data-points={entry.points}
                                                    >
                                                        {formatPoints(entry.points)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
