'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

function Flag({ nationality }: { nationality: string | null }) {
    const url = flagUrl(nationality)
    if (!url) {
        // Nationalité absente (pilotes de réserve, cf. schema.ts) : pastille
        // neutre, pour ne pas désaligner la colonne.
        return <span className="inline-block w-5 h-5 rounded-full bg-white/10 shrink-0" aria-hidden />
    }
    return (
        // Drapeau 20px servi par flagcdn.com : next/image imposerait d'ouvrir un
        // domaine distant dans next.config pour zéro gain réel à cette taille.
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt={nationality ?? ''}
            loading="lazy"
            className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-white/15"
        />
    )
}

/**
 * Portique de départ F1 : les 5 feux s'allument un par un, s'éteignent —
 * et la grille s'élance. Déclencheur visuel de l'entrée des tableaux.
 */
function StartLights() {
    return (
        <div className="start-lights inline-flex items-center gap-2 px-4 py-3 border border-white/10 bg-black/40 backdrop-blur-md rounded-sm">
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

/** Numéro de position : violet lumineux sur le podium, effacé ailleurs. */
function PositionCell({ position }: { position: number }) {
    return (
        <span
            className={`text-xl md:text-2xl font-black tabular-nums leading-none
                ${position === 1 ? 'text-purple-400' : position <= 3 ? 'text-purple-500/80' : 'text-white/30'}`}
            style={{ fontFamily: 'var(--font-russo)' }}
        >
            {String(position).padStart(2, '0')}
        </span>
    )
}

/**
 * Barre d'écart : longueur = points rapportés au leader, teintée à la couleur
 * de l'écurie. Se déploie après l'arrivée de la ligne (scaleX piloté en GSAP).
 */
function GapBar({ points, leaderPoints, color }: { points: number; leaderPoints: number; color: string }) {
    const pct = leaderPoints > 0 ? Math.max((points / leaderPoints) * 100, 1.5) : 0
    return (
        <div className="relative h-[5px] w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
                className="standing-gap-fill absolute inset-y-0 left-0 rounded-full origin-left"
                style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}55 0%, ${color} 100%)`,
                    boxShadow: `0 0 12px ${color}66`,
                }}
            />
        </div>
    )
}

/** Colonnes partagées par les deux tableaux (une seule source de vérité). */
const GRID_DRIVERS =
    'grid grid-cols-[3.25rem_1fr_4.5rem] sm:grid-cols-[3.25rem_1fr_4rem_5rem] lg:grid-cols-[3.5rem_minmax(210px,1.05fr)_200px_1fr_4rem_5.5rem] items-center gap-x-4'
const GRID_TEAMS =
    'grid grid-cols-[3.25rem_1fr_4.5rem] sm:grid-cols-[3.25rem_1fr_4rem_5rem] lg:grid-cols-[3.5rem_minmax(230px,1.05fr)_1fr_4rem_5.5rem] items-center gap-x-4'

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

    const leaderPoints = useMemo(() => {
        if (!standings) return 0
        return tab === 'drivers'
            ? (standings.drivers[0]?.points ?? 0)
            : (standings.constructors[0]?.points ?? 0)
    }, [standings, tab])

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

        // DOM interrogé à l'appel (et non à la construction de la timeline de
        // révélation) : l'onglet actif a pu changer entre-temps, les lignes ne
        // sont alors plus les mêmes.
        const rows = root.querySelectorAll<HTMLElement>('.standing-row')
        if (rows.length === 0) return

        gridRef.current?.kill()
        const tl = gsap.timeline()
        gridRef.current = tl

        tl.fromTo(
            rows,
            { opacity: 0, x: (i: number) => (i % 2 === 0 ? -110 : 110) },
            {
                opacity: 1,
                x: 0,
                duration: 0.85,
                // Forte décélération : la ligne "freine" pour se poser dans son
                // emplacement, au lieu d'un glissement linéaire.
                ease: 'power4.out',
                stagger: 0.05,
                clearProps: 'transform',
            },
            0,
        )

        const bars = root.querySelectorAll<HTMLElement>('.standing-gap-fill')
        if (bars.length > 0) {
            tl.fromTo(
                bars,
                { scaleX: 0 },
                { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.05 },
                0.3,
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
                    duration: 1,
                    ease: 'power2.out',
                    onUpdate: () => {
                        el.textContent = String(Math.round(counter.value))
                    },
                    onComplete: () => {
                        el.textContent = formatPoints(target)
                    },
                },
                0.3 + i * 0.05,
            )
        })

        return tl
    }, [])

    // ── Révélation au scroll : feux de départ puis mise en grille ──
    // Volontairement indépendant de `tab` : un changement d'onglet ne doit pas
    // rejouer la séquence des feux (l'effet ci-dessous s'en charge).
    useEffect(() => {
        if (status !== 'ready' || !standings) return
        if (!tableRef.current?.querySelector('.standing-row')) return

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
                        <StartLights />
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
                    <div ref={tableRef} className="relative border border-white/[0.08] bg-black/30 backdrop-blur-md overflow-hidden">
                        {/* En-têtes de colonnes */}
                        <div
                            className={`${tab === 'drivers' ? GRID_DRIVERS : GRID_TEAMS} px-4 md:px-6 py-3 border-b border-white/10 text-[9px] font-mono tracking-[0.3em] text-gray-600 uppercase`}
                        >
                            <span>Pos</span>
                            <span>{tab === 'drivers' ? 'Driver' : 'Team'}</span>
                            {tab === 'drivers' && <span className="hidden lg:block">Team</span>}
                            <span className="hidden lg:block">Gap to leader</span>
                            <span className="hidden sm:block text-right">Wins</span>
                            <span className="text-right">Pts</span>
                        </div>

                        {tab === 'drivers'
                            ? standings.drivers.map((entry) => {
                                const color = entry.constructor.color ?? FALLBACK_TEAM_COLOR
                                const isLeader = entry.position === 1
                                return (
                                    <div
                                        key={entry.driver.id}
                                        className={`standing-row group relative ${GRID_DRIVERS} px-4 md:px-6 py-3.5 border-b border-white/5 last:border-b-0
                                            transition-colors duration-300 hover:bg-white/[0.04]
                                            ${isLeader ? 'bg-purple-950/20' : ''}`}
                                        style={{ opacity: 0 }}
                                    >
                                        {/* Liseré couleur écurie */}
                                        <span
                                            className="absolute left-0 top-0 bottom-0 w-[3px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ background: color }}
                                        />
                                        {/* Balayage télémétrie au survol */}
                                        <span
                                            className="absolute inset-y-0 -left-full w-1/2 pointer-events-none opacity-0
                                                       group-hover:opacity-100 group-hover:translate-x-[400%]
                                                       transition-all duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                                            style={{ background: `linear-gradient(90deg, transparent, ${color}1f, transparent)` }}
                                        />
                                        {isLeader && (
                                            <span
                                                className="absolute inset-0 pointer-events-none"
                                                style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(126,34,206,0.12) 0%, transparent 55%)' }}
                                            />
                                        )}

                                        <PositionCell position={entry.position} />

                                        <div className="relative flex items-center gap-3 min-w-0">
                                            <Flag nationality={entry.driver.nationality} />
                                            <div className="min-w-0">
                                                <p className="flex items-baseline gap-2 truncate">
                                                    <span className="text-gray-400 text-sm hidden md:inline" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                        {entry.driver.firstName}
                                                    </span>
                                                    <span
                                                        className="text-white text-sm md:text-base font-bold uppercase tracking-[0.06em]"
                                                        style={{ fontFamily: 'var(--font-outfit)' }}
                                                    >
                                                        {entry.driver.lastName}
                                                    </span>
                                                    {entry.driver.code && (
                                                        <span className="hidden xl:inline text-[10px] font-mono tracking-[0.2em] text-gray-600">
                                                            {entry.driver.code}
                                                        </span>
                                                    )}
                                                </p>
                                                {/* Écurie repliée sous le nom en dessous de lg */}
                                                <p className="lg:hidden text-[11px] text-gray-500 truncate" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                    {entry.constructor.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="relative hidden lg:flex items-center gap-2.5 min-w-0">
                                            <TeamLogo
                                                id={entry.constructor.id}
                                                name={entry.constructor.name}
                                                color={color}
                                                className="h-6 w-9"
                                            />
                                            <span className="text-gray-400 text-sm truncate" style={{ fontFamily: 'var(--font-barlow)' }}>
                                                {entry.constructor.name}
                                            </span>
                                        </div>

                                        <div className="relative hidden lg:flex items-center gap-3">
                                            <GapBar points={entry.points} leaderPoints={leaderPoints} color={color} />
                                            <span className="w-14 shrink-0 text-right text-[11px] font-mono tabular-nums text-gray-600">
                                                {isLeader ? 'LEADER' : `-${formatPoints(leaderPoints - entry.points)}`}
                                            </span>
                                        </div>

                                        <span className="relative hidden sm:block text-right text-sm tabular-nums text-gray-400" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            {entry.wins > 0 ? entry.wins : '—'}
                                        </span>

                                        <span
                                            className={`standing-points relative text-right text-base md:text-lg font-black tabular-nums ${isLeader ? 'text-purple-400' : 'text-white'}`}
                                            style={{ fontFamily: 'var(--font-russo)' }}
                                            data-points={entry.points}
                                        >
                                            {formatPoints(entry.points)}
                                        </span>
                                    </div>
                                )
                            })
                            : standings.constructors.map((entry) => {
                                const color = entry.constructor.color ?? FALLBACK_TEAM_COLOR
                                const isLeader = entry.position === 1
                                return (
                                    <div
                                        key={entry.constructor.id}
                                        className={`standing-row group relative ${GRID_TEAMS} px-4 md:px-6 py-4 border-b border-white/5 last:border-b-0
                                            transition-colors duration-300 hover:bg-white/[0.04]
                                            ${isLeader ? 'bg-purple-950/20' : ''}`}
                                        style={{ opacity: 0 }}
                                    >
                                        <span
                                            className="absolute left-0 top-0 bottom-0 w-[3px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ background: color }}
                                        />
                                        <span
                                            className="absolute inset-y-0 -left-full w-1/2 pointer-events-none opacity-0
                                                       group-hover:opacity-100 group-hover:translate-x-[400%]
                                                       transition-all duration-[900ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                                            style={{ background: `linear-gradient(90deg, transparent, ${color}1f, transparent)` }}
                                        />
                                        {isLeader && (
                                            <span
                                                className="absolute inset-0 pointer-events-none"
                                                style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(126,34,206,0.12) 0%, transparent 55%)' }}
                                            />
                                        )}

                                        <PositionCell position={entry.position} />

                                        <div className="relative flex items-center gap-3 min-w-0">
                                            <TeamLogo
                                                id={entry.constructor.id}
                                                name={entry.constructor.name}
                                                color={color}
                                                className="h-7 w-10"
                                            />
                                            <span
                                                className="text-white text-sm md:text-base font-bold uppercase tracking-[0.06em] truncate"
                                                style={{ fontFamily: 'var(--font-outfit)' }}
                                            >
                                                {entry.constructor.name}
                                            </span>
                                            <Flag nationality={entry.constructor.nationality} />
                                        </div>

                                        <div className="relative hidden lg:flex items-center gap-3">
                                            <GapBar points={entry.points} leaderPoints={leaderPoints} color={color} />
                                            <span className="w-14 shrink-0 text-right text-[11px] font-mono tabular-nums text-gray-600">
                                                {isLeader ? 'LEADER' : `-${formatPoints(leaderPoints - entry.points)}`}
                                            </span>
                                        </div>

                                        <span className="relative hidden sm:block text-right text-sm tabular-nums text-gray-400" style={{ fontFamily: 'var(--font-barlow)' }}>
                                            {entry.wins > 0 ? entry.wins : '—'}
                                        </span>

                                        <span
                                            className={`standing-points relative text-right text-base md:text-lg font-black tabular-nums ${isLeader ? 'text-purple-400' : 'text-white'}`}
                                            style={{ fontFamily: 'var(--font-russo)' }}
                                            data-points={entry.points}
                                        >
                                            {formatPoints(entry.points)}
                                        </span>
                                    </div>
                                )
                            })}

                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-700 via-purple-500/40 to-transparent" />
                    </div>
                )}
            </div>
        </section>
    )
}
