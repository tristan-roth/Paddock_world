'use client'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type Token = {
    text: string
    type: 'normal' | 'gradient' | 'highlight'
    spaceBefore: boolean
}

interface RevealTextProps {
    tokens: Token[]
    className?: string
    style?: React.CSSProperties
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
    onGradientSpansReady?: (spans: HTMLSpanElement[]) => void
    gradientStyle?: React.CSSProperties
    highlightClassName?: string
}

/**
 * RevealText: renders content that detects line breaks dynamically,
 * then applies a per-line purple wipe reveal animation.
 */
export default function RevealText({
    tokens,
    className,
    style,
    as: Component = 'h2',
    onGradientSpansReady,
    gradientStyle,
    highlightClassName = 'text-white font-medium',
}: RevealTextProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const hiddenTextRef = useRef<HTMLElement>(null)
    const [lines, setLines] = useState<Token[][]>([])
    const [isDone, setIsDone] = useState(false)
    const [fontsReady, setFontsReady] = useState(false)
    const tlRef = useRef<gsap.core.Timeline | null>(null)

    useEffect(() => {
        document.fonts.ready.then(() => {
            setFontsReady(true)
        })
    }, [])

    const processedTokens = useMemo(() => {
        return tokens.flatMap(token => {
            const words = token.text.split(' ')
            if (words.length <= 1) return token
            return words.map((word, index) => ({
                text: word,
                type: token.type,
                spaceBefore: index === 0 ? token.spaceBefore : true
            }))
        })
    }, [tokens])

    const buildLines = useCallback(() => {
        if (isDone || !fontsReady) return
        const hidden = hiddenTextRef.current
        if (!hidden) return

        const spans = hidden.querySelectorAll<HTMLSpanElement>('[data-token]')
        if (spans.length === 0) return

        const groupedLines: Token[][] = []
        let currentLine: Token[] = []
        let lastTop = -1

        spans.forEach((span, i) => {
            const rect = span.getBoundingClientRect()
            const top = rect.top
            // Use half height as threshold to detect new line accurately
            if (lastTop !== -1 && Math.abs(top - lastTop) > (rect.height / 2)) {
                if (currentLine.length > 0) {
                    groupedLines.push(currentLine)
                }
                currentLine = []
            }
            currentLine.push(processedTokens[i])
            lastTop = top
        })
        if (currentLine.length > 0) {
            groupedLines.push(currentLine)
        }

        setLines(groupedLines)
    }, [isDone, fontsReady, processedTokens])

    // Detect lines on mount and on resize
    useEffect(() => {
        buildLines()
        const onResize = () => buildLines()
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [buildLines])

    // Orchestrate animation and ref passing
    useEffect(() => {
        if (isDone) {
            // Animation finished -> pass native gradient spans to parent
            if (hiddenTextRef.current && onGradientSpansReady) {
                const spans = hiddenTextRef.current.querySelectorAll<HTMLSpanElement>('[data-gradient-span]')
                onGradientSpansReady(Array.from(spans))
            }
            return
        }

        if (lines.length === 0 || !containerRef.current || !fontsReady) return

        // While animating, pass the animated gradient spans to parent
        if (onGradientSpansReady) {
            const spans = containerRef.current.querySelectorAll<HTMLSpanElement>('[data-gradient-animated]')
            onGradientSpansReady(Array.from(spans))
        }

        const overlays = containerRef.current.querySelectorAll<HTMLSpanElement>('[data-overlay]')
        const texts = containerRef.current.querySelectorAll<HTMLDivElement>('[data-line-text]')

        if (overlays.length === 0) return

        texts.forEach((t) => gsap.set(t, { opacity: 0 }))

        // Kill any previous timeline if re-measuring
        if (tlRef.current) {
            tlRef.current.scrollTrigger?.kill()
            tlRef.current.kill()
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 75%',
            },
            onComplete: () => {
                setIsDone(true)
            },
        })
        tlRef.current = tl

        overlays.forEach((overlay, i) => {
            const text = texts[i]
            const startTime = i * 0.4

            tl.fromTo(
                overlay,
                { x: '-100%' },
                { x: '0%', duration: 0.5, ease: 'power2.in' },
                startTime
            )
                .set(text, { opacity: 1 }, startTime + 0.5)
                .to(overlay, { x: '100%', duration: 0.5, ease: 'power2.out' }, startTime + 0.5)
        })

        return () => {
            if (tlRef.current) {
                tlRef.current.scrollTrigger?.kill()
                tlRef.current.kill()
            }
        }
    }, [lines, isDone, fontsReady, onGradientSpansReady])

    const renderToken = (token: Token, isAnimatedLayer: boolean) => {
        if (token.type === 'gradient') {
            return (
                <span
                    {...(isAnimatedLayer ? { 'data-gradient-animated': true } : { 'data-gradient-span': true })}
                    className="bg-clip-text text-transparent font-bold"
                    style={gradientStyle}
                >
                    {token.text}
                </span>
            )
        }
        if (token.type === 'highlight') {
            return (
                <span className={highlightClassName}>
                    {token.text}
                </span>
            )
        }
        return <>{token.text}</>
    }

    return (
        <div ref={containerRef} className="reveal-block relative md:inline-block w-full">
            {/* The natural text block determining the layout */}
            <Component
                ref={hiddenTextRef as any}
                className={className}
                style={{ ...style, visibility: isDone ? 'visible' : 'hidden', opacity: 1, margin: 0 }}
                aria-hidden={!isDone ? "true" : undefined}
            >
                {processedTokens.map((token, i) => (
                    <span key={i} style={{ display: 'inline' }}>
                        {token.spaceBefore ? ' ' : ''}
                        <span data-token style={{ display: 'inline' }}>
                            {renderToken(token, false)}
                        </span>
                    </span>
                ))}
            </Component>

            {/* Absolute overlay for animation */}
            {!isDone && lines.length > 0 && (
                <Component
                    className={className}
                    style={{ ...style, position: 'absolute', top: 0, left: 0, width: '100%', opacity: 1, margin: 0 }}
                    aria-hidden="true"
                >
                    {lines.map((line, lineIdx) => (
                        <span
                            key={lineIdx}
                            data-line
                            style={{
                                display: 'block', // Use block for the line container
                                position: 'relative',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap', // Prevent unwanted wrapping inside the animated line
                            }}
                        >
                            <span data-line-text style={{ display: 'block', opacity: 0 }}>
                                {line.map((token, tokenIdx) => (
                                    <span key={tokenIdx}>
                                        {(tokenIdx > 0 && token.spaceBefore) ? ' ' : ''}
                                        {renderToken(token, true)}
                                    </span>
                                ))}
                            </span>
                            <span
                                data-overlay
                                style={{
                                    display: 'block',
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: '#9333ea',
                                    transform: 'translateX(-100%)',
                                    zIndex: 10,
                                }}
                            />
                        </span>
                    ))}
                </Component>
            )}
        </div>
    )
}
