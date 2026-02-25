'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface LoadingIntroProps {
    onComplete: () => void
    hideOverlay: boolean
}

export default function LoadingIntro({ onComplete, hideOverlay }: LoadingIntroProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const overlayBlackRef = useRef<HTMLDivElement>(null)
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (!hasAnimated.current && containerRef.current && imageRef.current && overlayBlackRef.current) {
            hasAnimated.current = true
            const timeline = gsap.timeline({
                onComplete: () => {
                    onComplete()
                }
            })

            // État initial: fenêtre moyenne au centre avec image zoomée
            gsap.set(containerRef.current, {
                clipPath: `inset(25% 10% 25% 10% round 16px)`,
                opacity: 1
            })
            gsap.set(imageRef.current, {
                scale: 1.4
            })
            gsap.set(overlayBlackRef.current, {
                opacity: 1
            })

            timeline
                // La fenêtre s'agrandit ET l'image dé-zoom en même temps
                .to(containerRef.current,
                    {
                        clipPath: `inset(0% 0% 0% 0% round 0px)`,
                        duration: 1.5,
                        ease: "power4.inOut"
                    },
                    "expand"
                )
                .to(imageRef.current,
                    {
                        scale: 1,
                        duration: 1.5,
                        ease: "power4.inOut"
                    },
                    "expand"
                )
                // Petite pause avant de terminer
                .to({}, { duration: 0.2 })
                // Fade out uniquement du container (l'overlay reste visible)
                .to(containerRef.current,
                    { opacity: 0, duration: 0.4 }
                )
        }
    }, [onComplete])

    // Gérer la disparition de l'overlay quand Hero commence son animation
    useEffect(() => {
        if (hideOverlay && overlayBlackRef.current) {
            gsap.to(overlayBlackRef.current, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.inOut"
            })
        }
    }, [hideOverlay])

    return (
        <>
            {/* Overlay noir qui entoure la fenêtre */}
            <div
                ref={overlayBlackRef}
                className="fixed inset-0 z-[9998] bg-black pointer-events-none"
            />

            {/* Container avec l'image de fond */}
            <div
                ref={containerRef}
                className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
            >
                <div ref={imageRef} className="w-full h-full relative">
                    <video
                        src="/video/home.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Overlay pour assombrir légèrement */}
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            </div>
        </>
    )
}
