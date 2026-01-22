'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const textRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        if (textRef.current && sectionRef.current) {
            gsap.fromTo(textRef.current,
                { opacity: 0, y: 100 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.5,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                        end: "top 30%",
                        scrub: 1,
                        toggleActions: "play reverse play reverse"
                    }
                }
            )
        }
    }, [])

    return (
        <section ref={sectionRef} className="min-h-screen flex items-center justify-center p-8 md:p-20 relative z-10" id="about">
            <div className="max-w-5xl w-full">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    <div className="md:w-1/3">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-4 border-l-2 border-red-500 pl-4">Our Mission</h3>
                    </div>
                    <div className="md:w-2/3">
                        <p ref={textRef} className="text-3xl md:text-5xl font-bold leading-tight text-white mb-8">
                            We are building the ultimate information hub for the modern motorsport enthusiast.
                            <span className="text-gray-400 block mt-8 text-xl md:text-2xl font-normal">
                                From F1 to MotoGP, we dissect the machines, the strategy, and the business behind the speed.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
