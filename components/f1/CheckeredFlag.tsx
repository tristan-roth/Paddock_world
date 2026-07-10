/**
 * Damier SVG net (le conic-gradient CSS produit des bords baveux) — partagé
 * entre la clôture de saison de la page calendrier et la bande décorative
 * du widget NextRace.
 */
export default function CheckeredFlag({ className }: { className?: string }) {
    const size = 8
    const cols = 6
    const rows = 4
    const squares: React.ReactNode[] = []
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if ((row + col) % 2 === 0) {
                squares.push(
                    <rect key={`${row}-${col}`} x={col * size} y={row * size} width={size} height={size} fill="#fff" />,
                )
            }
        }
    }
    return (
        <svg
            viewBox={`0 0 ${cols * size} ${rows * size}`}
            className={className}
            shapeRendering="crispEdges"
            aria-hidden
        >
            <rect width={cols * size} height={rows * size} fill="#0a0e27" />
            {squares}
            <rect
                x="0.5"
                y="0.5"
                width={cols * size - 1}
                height={rows * size - 1}
                fill="none"
                stroke="rgba(255,255,255,0.3)"
            />
        </svg>
    )
}

/** Tuile damier 16px encodée en SVG pour un rendu net en background répété. */
export const CHECKER_TILE = `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" shape-rendering="crispEdges"><rect width="8" height="8" fill="#fff"/><rect x="8" y="8" width="8" height="8" fill="#fff"/></svg>',
)}")`
