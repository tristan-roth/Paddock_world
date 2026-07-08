'use client'
import { useEffect, useState } from 'react'
import { formatFullDate } from '@/lib/f1/date'
import type { RaceWithCircuit } from '@/lib/f1/types'

interface CircuitDetailPanelProps {
    race: RaceWithCircuit
    totalRounds: number
    onClose: () => void
}

function formatCoord(value: number | null, positive: string, negative: string): string {
    if (value == null) return '—'
    const hemisphere = value >= 0 ? positive : negative
    return `${Math.abs(value).toFixed(2)}° ${hemisphere}`
}

/**
 * Fiche détaillée d'un circuit, affichée au clic sur une pastille du globe.
 * Remontée en fondu/glissement à chaque changement de course (remount via key).
 */
export default function CircuitDetailPanel({ race, totalRounds, onClose }: CircuitDetailPanelProps) {
    const [shown, setShown] = useState(false)

    // rAF pour déclencher la transition d'entrée après le montage (évite le
    // setState synchrone en effet, cf. règle react-hooks/set-state-in-effect).
    useEffect(() => {
        const id = requestAnimationFrame(() => setShown(true))
        return () => cancelAnimationFrame(id)
    }, [])

    const specs = [
        { label: 'Circuit', value: race.circuit.name },
        { label: 'Location', value: `${race.circuit.locality}, ${race.circuit.country}` },
        { label: 'Continent', value: race.circuit.continent ?? '—' },
        { label: 'Length', value: race.lengthKm != null ? `${race.lengthKm.toFixed(3)} km` : '—' },
        { label: 'Laps', value: race.laps != null ? String(race.laps) : '—' },
        { label: 'Format', value: race.sprintWeekend ? '🏎️ Sprint Weekend' : 'Standard' },
    ]

    return (
        <div
            className={`pointer-events-auto w-full sm:w-[350px] overflow-hidden rounded-sm border border-purple-500/40
                        bg-black/80 backdrop-blur-xl shadow-[0_0_50px_rgba(126,34,206,0.2)]
                        transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                        ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            {/* En-tête */}
            <div className="relative px-6 pt-6 pb-5">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at top left, rgba(126,34,206,0.15) 0%, transparent 60%)' }}
                />
                <div className="relative flex items-start justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-mono tracking-[0.3em] text-purple-400 uppercase">
                            Round {String(race.round).padStart(2, '0')} / {totalRounds}
                        </span>
                        <h3
                            className="mt-1 text-white text-xl sm:text-2xl font-bold uppercase tracking-wide leading-tight"
                            style={{ fontFamily: 'var(--font-outfit)' }}
                        >
                            {race.name}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-gray-400 cursor-pointer
                                   transition-all duration-300 hover:border-purple-500/60 hover:text-white hover:bg-white/[0.06]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative mt-3 inline-flex items-center gap-2 px-3 py-1.5 border border-white/15 rounded-full text-white text-xs tracking-[0.12em] uppercase">
                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {formatFullDate(race.date)}
                </div>
            </div>

            {/* Spécifications */}
            <div className="border-t border-white/[0.08] px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-4">
                {specs.map((spec) => (
                    <div key={spec.label} className={spec.label === 'Circuit' || spec.label === 'Location' ? 'col-span-2' : ''}>
                        <p className="text-[9px] font-mono tracking-[0.3em] text-gray-600 uppercase mb-1">{spec.label}</p>
                        <p className="text-white/90 text-sm" style={{ fontFamily: 'var(--font-barlow)' }}>{spec.value}</p>
                    </div>
                ))}
            </div>

            {/* Coordonnées */}
            <div className="border-t border-white/[0.08] px-6 py-4 flex items-center justify-between text-[10px] font-mono tracking-[0.2em] text-gray-500 uppercase">
                <span>{formatCoord(race.circuit.latitude, 'N', 'S')}</span>
                <span className="h-1 w-1 rounded-full bg-purple-500/60" />
                <span>{formatCoord(race.circuit.longitude, 'E', 'W')}</span>
            </div>
        </div>
    )
}
