/**
 * Texte géant contourné (outline), signature visuelle des pages Championship —
 * partagé entre la page calendrier (mot "CALENDAR" en parallax) et le widget
 * NextRace (numéro de manche géant).
 */
export default function OutlineText({ children, className, stroke }: {
    children: React.ReactNode
    className?: string
    stroke?: string
}) {
    return (
        <span
            aria-hidden
            className={`select-none pointer-events-none font-black leading-none ${className ?? ''}`}
            style={{
                fontFamily: 'var(--font-russo)',
                color: 'transparent',
                WebkitTextStroke: stroke ?? '1px rgba(147,51,234,0.22)',
            }}
        >
            {children}
        </span>
    )
}
