'use client'

interface SeasonPickerProps {
    seasons: number[]
    activeSeason: number | null
    onSelect: (season: number) => void
    /** Désactive les boutons pendant un chargement en cours. */
    disabled?: boolean
    className?: string
}

/**
 * Sélecteur de saison, partagé par les sections calendrier et classements de
 * la page Championship : les deux pilotent la même saison, et l'afficher au
 * dessus de chacune évite de remonter la page pour en changer.
 */
export default function SeasonPicker({
    seasons,
    activeSeason,
    onSelect,
    disabled = false,
    className,
}: SeasonPickerProps) {
    if (seasons.length === 0) return null

    return (
        <div className={`flex flex-wrap items-center gap-4 ${className ?? ''}`}>
            <span className="text-[10px] font-mono tracking-[0.35em] text-gray-500 uppercase">Season</span>
            <div className="flex flex-wrap gap-2">
                {seasons.map((value) => {
                    const isActive = value === activeSeason
                    return (
                        <button
                            key={value}
                            onClick={() => onSelect(value)}
                            disabled={disabled}
                            aria-pressed={isActive}
                            className={`relative rounded-sm border px-5 py-2 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                disabled:cursor-not-allowed disabled:opacity-50
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
    )
}
