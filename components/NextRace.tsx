'use client'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHECKER_TILE } from '@/components/f1/CheckeredFlag'
import OutlineText from '@/components/f1/OutlineText'
import { formatFullDate, todayISO } from '@/lib/f1/date'
import type { RaceWithCircuit } from '@/lib/f1/types'

gsap.registerPlugin(ScrollTrigger)

type Status = 'loading' | 'ready' | 'empty' | 'error'

interface NextRaceProps {
    /**
     * Course déjà connue par le parent (ex: page championship, qui a déjà
     * chargé tout le calendrier de la saison) — évite un second fetch.
     * `null` signifie explicitement "pas de prochaine course" (saison passée).
     * Omis : le composant appelle lui-même GET /api/f1/calendar pour un usage
     * autonome ailleurs sur le site (issue #3 — ex. la homepage F1).
     */
    race?: RaceWithCircuit | null
    /** Total de manches de la saison, affiché "Round X of Y". Omis si inconnu. */
    totalRounds?: number
    className?: string
}

/** Compte à rebours vers minuit (heure locale) du jour de course. */
function useCountdown(targetISO: string | null) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(id)
    }, [])

    if (!targetISO) return null
    const diff = new Date(`${targetISO}T00:00:00`).getTime() - now
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, raceDay: true }

    return {
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor(diff / 3_600_000) % 24,
        minutes: Math.floor(diff / 60_000) % 60,
        seconds: Math.floor(diff / 1000) % 60,
        raceDay: false,
    }
}

export default function NextRace({ race: raceProp, totalRounds, className }: NextRaceProps) {
    const controlled = raceProp !== undefined
    const [fetchedRace, setFetchedRace] = useState<RaceWithCircuit | null>(null)
    const [fetchStatus, setFetchStatus] = useState<'loading' | 'ready' | 'error'>('loading')
    const rootRef = useRef<HTMLDivElement>(null)

    // Mode autonome uniquement : en mode contrôlé, la donnée vient déjà du
    // parent — pas d'effet à déclencher, `race`/`status` sont dérivés au rendu.
    useEffect(() => {
        if (controlled) return

        let cancelled = false
        fetch('/api/f1/calendar')
            .then((res) => {
                if (!res.ok) throw new Error(`API calendar → ${res.status}`)
                return res.json() as Promise<RaceWithCircuit[]>
            })
            .then((data) => {
                if (cancelled) return
                const today = todayISO()
                setFetchedRace(data.find((r) => r.date >= today) ?? null)
                setFetchStatus('ready')
            })
            .catch(() => {
                if (!cancelled) setFetchStatus('error')
            })

        return () => {
            cancelled = true
        }
    }, [controlled])

    const race = controlled ? (raceProp ?? null) : fetchedRace
    const status: Status = controlled
        ? raceProp
            ? 'ready'
            : 'empty'
        : fetchStatus === 'loading'
            ? 'loading'
            : fetchStatus === 'error'
                ? 'error'
                : race
                    ? 'ready'
                    : 'empty'

    const countdown = useCountdown(race?.date ?? null)

    // Entrée en fondu au scroll, indépendante du parent qui monte ce widget.
    useEffect(() => {
        if (status !== 'ready' || !rootRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo(
                rootRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 85%' },
                },
            )
        })
        return () => ctx.revert()
    }, [status])

    if (status === 'loading') {
        return <div className={`h-56 border border-white/10 bg-white/[0.04] animate-pulse ${className ?? ''}`} />
    }
    if (!race || !countdown) {
        // 'error' et 'empty' (saison sans course à venir) dégradent en
        // silence : ce widget est un bonus, jamais un bloqueur d'affichage.
        return null
    }

    return (
        <div ref={rootRef} className={`relative ${className ?? ''}`} style={{ opacity: 0 }}>
            <div
                className="relative overflow-hidden border border-purple-500/40 bg-black/50"
                style={{
                    clipPath:
                        'polygon(28px 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%, 0 28px)',
                }}
            >
                {/* Bande damier sur le bord droit */}
                <div
                    className="absolute top-0 right-0 bottom-0 w-16 opacity-[0.10] pointer-events-none"
                    style={{ backgroundImage: CHECKER_TILE, backgroundSize: '16px 16px' }}
                />
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'radial-gradient(ellipse at 20% 0%, rgba(126,34,206,0.16) 0%, transparent 55%)',
                    }}
                />
                {/* Numéro de manche géant contourné */}
                <div className="absolute -right-2 -bottom-10 pointer-events-none">
                    <OutlineText className="text-[170px] md:text-[240px]" stroke="1px rgba(255,255,255,0.07)">
                        {String(race.round).padStart(2, '0')}
                    </OutlineText>
                </div>

                <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-10 p-8 md:p-12 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600" />
                            </span>
                            <span className="text-xs font-mono tracking-[0.35em] text-purple-400 uppercase">
                                Up next — Round {race.round}{totalRounds ? ` of ${totalRounds}` : ''}
                            </span>
                        </div>
                        <h3
                            className="text-white text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wide leading-tight mb-4"
                            style={{ fontFamily: 'var(--font-outfit)' }}
                        >
                            {race.name}
                        </h3>
                        <p className="text-gray-400 text-lg mb-1" style={{ fontFamily: 'var(--font-barlow)' }}>
                            {race.circuit.name}
                        </p>
                        <p className="flex items-center gap-2 text-gray-500 text-sm mb-6" style={{ fontFamily: 'var(--font-barlow)' }}>
                            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {race.circuit.locality}, {race.circuit.country}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-4 py-1.5 border border-white/15 -skew-x-12 text-white text-xs tracking-[0.15em] uppercase font-medium">
                                <span className="inline-block skew-x-12">{formatFullDate(race.date)}</span>
                            </span>
                            {race.sprintWeekend && (
                                <span className="px-4 py-1.5 -skew-x-12 text-xs tracking-[0.15em] uppercase font-semibold text-white
                                                 bg-gradient-to-r from-purple-700 to-purple-500 shadow-[0_0_20px_rgba(126,34,206,0.35)]">
                                    <span className="inline-block skew-x-12">🏎️ Sprint Weekend</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {countdown.raceDay ? (
                        <div className="-skew-x-12 flex items-center justify-center px-12 py-8 border border-purple-500/60 bg-purple-700/20">
                            <span
                                className="skew-x-12 text-white text-3xl font-black tracking-[0.15em]"
                                style={{ fontFamily: 'var(--font-russo)' }}
                            >
                                RACE DAY
                            </span>
                        </div>
                    ) : (
                        <div className="flex gap-2 sm:gap-3">
                            {[
                                { value: countdown.days, label: 'DAYS' },
                                { value: countdown.hours, label: 'HRS' },
                                { value: countdown.minutes, label: 'MIN' },
                                { value: countdown.seconds, label: 'SEC' },
                            ].map((unit) => (
                                <div
                                    key={unit.label}
                                    className="-skew-x-12 flex flex-col items-center gap-2 px-3 sm:px-5 py-4 border border-white/10 bg-black/50 min-w-[64px] sm:min-w-[84px]"
                                >
                                    <span
                                        className="skew-x-12 text-2xl sm:text-4xl font-black text-purple-400 tabular-nums leading-none"
                                        style={{ fontFamily: 'var(--font-russo)' }}
                                    >
                                        {String(unit.value).padStart(2, '0')}
                                    </span>
                                    <span className="skew-x-12 text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-gray-500">
                                        {unit.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-700 via-purple-500 to-transparent" />
            </div>
        </div>
    )
}
