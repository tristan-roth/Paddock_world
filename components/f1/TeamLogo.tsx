'use client'
import { useEffect, useState } from 'react'

/**
 * Abréviation d'écurie pour le monogramme de repli : initiales si le nom est
 * composé, 3 premières lettres sinon. Le suffixe commercial "F1 Team" (présent
 * dans les noms Jolpica : "Alpine F1 Team", "Haas F1 Team"...) est retiré, il
 * n'apporte rien et fausserait les initiales.
 */
function abbreviate(name: string): string {
    const words = name
        .replace(/\bF1\b/gi, '')
        .replace(/\bteam\b/gi, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    if (words.length === 0) return '—'
    if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
    return words
        .slice(0, 3)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
}

interface TeamLogoProps {
    /** constructorId Jolpica (ex: "red_bull") — sert à résoudre le fichier. */
    id: string
    name: string
    color: string
    className?: string
}

/**
 * Logo d'écurie, avec repli automatique sur un monogramme à la couleur de
 * l'équipe.
 *
 * Les logos F1 sont des marques déposées : aucun fichier n'est versionné dans
 * le repo. Déposer `public/img/teams/<constructorId>.png` (ex:
 * `red_bull.png`) et il s'affiche automatiquement à la place du monogramme —
 * aucun code à toucher.
 */
export default function TeamLogo({ id, name, color, className }: TeamLogoProps) {
    const [logoSrc, setLogoSrc] = useState<string | null>(null)

    // Le monogramme est rendu d'emblée et le logo ne le remplace qu'une fois
    // chargé pour de bon. Monter un <img> puis se rabattre sur `onError`
    // ferait clignoter l'icône d'image cassée sur chaque ligne tant qu'aucun
    // fichier n'est déposé — c'est-à-dire, aujourd'hui, sur toutes.
    useEffect(() => {
        const src = `/img/teams/${id}.png`
        const probe = new Image()
        let cancelled = false

        probe.onload = () => {
            if (!cancelled) setLogoSrc(src)
        }
        probe.src = src

        return () => {
            cancelled = true
            probe.onload = null
        }
    }, [id])

    if (logoSrc) {
        return (
            // Asset optionnel et hors pipeline : next/image exige des fichiers
            // connus au build, alors qu'ici l'absence est le cas nominal.
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={logoSrc}
                alt={name}
                className={`object-contain shrink-0 ${className ?? ''}`}
            />
        )
    }

    return (
        <span
            aria-hidden
            className={`inline-flex items-center justify-center shrink-0 -skew-x-12 border ${className ?? ''}`}
            style={{
                borderColor: `${color}66`,
                background: `linear-gradient(135deg, ${color}26 0%, transparent 100%)`,
            }}
            title={name}
        >
            <span
                className="skew-x-12 text-[9px] font-black tracking-[0.08em] leading-none"
                style={{ fontFamily: 'var(--font-russo)', color }}
            >
                {abbreviate(name)}
            </span>
        </span>
    )
}
