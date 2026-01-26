'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '@/components/Navbar'

gsap.registerPlugin(ScrollTrigger)

// Données des équipes F1 2024
const teams = [
    {
        name: 'Red Bull Racing',
        color: '#1E41FF',
        drivers: ['Max Verstappen', 'Sergio Pérez'],
        logo: '/img/f1/redbull.png'
    },
    {
        name: 'Ferrari',
        color: '#DC0000',
        drivers: ['Charles Leclerc', 'Carlos Sainz'],
        logo: '/img/f1/ferrari.png'
    },
    {
        name: 'Mercedes',
        color: '#00D2BE',
        drivers: ['Lewis Hamilton', 'George Russell'],
        logo: '/img/f1/mercedes.png'
    },
    {
        name: 'McLaren',
        color: '#FF8700',
        drivers: ['Lando Norris', 'Oscar Piastri'],
        logo: '/img/f1/mclaren.png'
    },
]

// Prochaines courses
const upcomingRaces = [
    { name: 'Grand Prix de Bahrain', date: '2 Mars 2025', circuit: 'Bahrain International Circuit', flag: '🇧🇭' },
    { name: 'Grand Prix d\'Arabie Saoudite', date: '9 Mars 2025', circuit: 'Jeddah Corniche Circuit', flag: '🇸🇦' },
    { name: 'Grand Prix d\'Australie', date: '23 Mars 2025', circuit: 'Albert Park Circuit', flag: '🇦🇺' },
]

export default function F1Page() {
    const heroRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const subtitleRef = useRef<HTMLParagraphElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)
    const teamsRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setIsLoaded(true)

        // Animation du titre
        if (titleRef.current) {
            gsap.fromTo(titleRef.current,
                { opacity: 0, y: 100, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    ease: "power4.out",
                    delay: 0.3
                }
            )
        }

        // Animation du sous-titre
        if (subtitleRef.current) {
            gsap.fromTo(subtitleRef.current,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    delay: 0.6
                }
            )
        }

        // Animation des stats
        if (statsRef.current) {
            const stats = statsRef.current.querySelectorAll('.stat-item')
            gsap.fromTo(stats,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.15,
                    delay: 0.9
                }
            )
        }

        // Animation des équipes au scroll
        if (teamsRef.current) {
            const teamCards = teamsRef.current.querySelectorAll('.team-card')
            gsap.fromTo(teamCards,
                { opacity: 0, x: -100 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    stagger: 0.2,
                    scrollTrigger: {
                        trigger: teamsRef.current,
                        start: "top 75%",
                        end: "top 25%",
                    }
                }
            )
        }
    }, [])

    return (
        <main className="relative w-full overflow-hidden bg-[#060918]">
            <Navbar shouldAnimate={true} />

            {/* Hero Section */}
            <section ref={heroRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <Image
                        src="/img/f1-bg.png"
                        alt="Formula 1 Background"
                        fill
                        priority
                        quality={90}
                        sizes="100vw"
                        className="object-cover"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#060918]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-red-900/20" />
                </div>

                {/* F1 Racing stripes decoratives */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center px-8 pt-32 pb-20 text-center">
                    {/* Badge */}
                    <div className="mb-8 px-6 py-2 border border-red-500/50 rounded-full backdrop-blur-sm bg-red-500/10">
                        <span className="text-red-400 text-sm font-bold tracking-[0.3em] uppercase">Saison 2025</span>
                    </div>

                    {/* Titre principal */}
                    <h1
                        ref={titleRef}
                        className="text-white text-7xl md:text-9xl font-black tracking-tighter mb-6 drop-shadow-2xl"
                        style={{ fontFamily: 'var(--font-russo)', opacity: 0 }}
                    >
                        <span className="text-red-500">F</span>ORMULA
                        <span className="block md:inline md:ml-6 text-red-500">1</span>
                    </h1>

                    {/* Sous-titre */}
                    <p
                        ref={subtitleRef}
                        className="text-gray-300 text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
                        style={{ opacity: 0 }}
                    >
                        Plongez au cœur du pinnacle du sport automobile mondial.
                        Vitesse, technologie et passion à l'état pur.
                    </p>

                    {/* Stats rapides */}
                    <div ref={statsRef} className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="stat-item text-center" style={{ opacity: 0 }}>
                            <span className="block text-5xl md:text-6xl font-black text-white mb-2">24</span>
                            <span className="text-gray-400 text-sm tracking-wider uppercase">Grands Prix</span>
                        </div>
                        <div className="stat-item text-center" style={{ opacity: 0 }}>
                            <span className="block text-5xl md:text-6xl font-black text-white mb-2">10</span>
                            <span className="text-gray-400 text-sm tracking-wider uppercase">Écuries</span>
                        </div>
                        <div className="stat-item text-center" style={{ opacity: 0 }}>
                            <span className="block text-5xl md:text-6xl font-black text-white mb-2">20</span>
                            <span className="text-gray-400 text-sm tracking-wider uppercase">Pilotes</span>
                        </div>
                        <div className="stat-item text-center" style={{ opacity: 0 }}>
                            <span className="block text-5xl md:text-6xl font-black text-red-500 mb-2">370</span>
                            <span className="text-gray-400 text-sm tracking-wider uppercase">Km/h Max</span>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
                        <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Section Équipes */}
            <section className="relative py-24 px-8 md:px-16">
                <div className="max-w-7xl mx-auto">
                    {/* Titre de section */}
                    <div className="mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-russo)' }}>
                            Les <span className="text-red-500">Écuries</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl">
                            Découvrez les équipes qui repoussent les limites de la technologie et de la performance.
                        </p>
                    </div>

                    {/* Grille des équipes */}
                    <div ref={teamsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {teams.map((team, index) => (
                            <div
                                key={team.name}
                                className="team-card group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-500 cursor-pointer"
                                style={{ opacity: 0 }}
                            >
                                {/* Accent line */}
                                <div
                                    className="absolute top-0 left-0 w-full h-1 transition-all duration-500"
                                    style={{ backgroundColor: team.color }}
                                />

                                {/* Glow effect on hover */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                                    style={{ background: `radial-gradient(circle at center, ${team.color}, transparent)` }}
                                />

                                {/* Content */}
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:translate-x-2 transition-transform duration-300">
                                        {team.name}
                                    </h3>
                                    <div className="space-y-2">
                                        {team.drivers.map((driver) => (
                                            <p key={driver} className="text-gray-400 text-sm flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                                                {driver}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Arrow icon */}
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section Calendrier */}
            <section className="relative py-24 px-8 md:px-16 bg-gradient-to-b from-transparent to-black/50">
                <div className="max-w-7xl mx-auto">
                    {/* Titre de section */}
                    <div className="mb-16 text-center">
                        <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-russo)' }}>
                            Prochaines <span className="text-red-500">Courses</span>
                        </h2>
                        <p className="text-gray-400 text-lg">
                            Ne manquez aucun départ de la saison 2025
                        </p>
                    </div>

                    {/* Liste des courses */}
                    <div className="space-y-4">
                        {upcomingRaces.map((race, index) => (
                            <div
                                key={race.name}
                                className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all duration-500 cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Info course */}
                                    <div className="flex items-center gap-6">
                                        <span className="text-4xl">{race.flag}</span>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                                                {race.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm">{race.circuit}</p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-red-400 font-bold text-lg md:text-xl tracking-wide">
                                            {race.date}
                                        </span>
                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500/20 transition-all duration-300">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Decorative line */}
                                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-red-500 group-hover:w-full transition-all duration-500" />
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/sports/f1/calendar"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/30"
                        >
                            Voir le calendrier complet
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Section News / Articles */}
            <section className="relative py-24 px-8 md:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div>
                            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-russo)' }}>
                                Dernières <span className="text-red-500">Actualités</span>
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Restez informé de toutes les nouvelles du paddock
                            </p>
                        </div>
                        <Link href="/sports/f1/news" className="text-red-400 hover:text-red-300 font-medium tracking-wide flex items-center gap-2 transition-colors">
                            Toutes les actualités
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>

                    {/* Grille d'articles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Article 1 - Grand */}
                        <div className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-[16/9] cursor-pointer">
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                            <Image
                                src="/img/f1-bg.png"
                                alt="Article F1"
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full mb-4">BREAKING</span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                                    Les nouveautés techniques pour la saison 2025
                                </h3>
                                <p className="text-gray-400 line-clamp-2">
                                    Découvrez toutes les évolutions réglementaires et techniques prévues pour cette nouvelle saison de Formule 1.
                                </p>
                            </div>
                        </div>

                        {/* Articles 2 & 3 */}
                        <div className="space-y-6">
                            <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-[4/3] cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                                <div className="absolute inset-0 bg-[#1E41FF]/30" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-3">RED BULL</span>
                                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                                        Verstappen vise un quatrième titre consécutif
                                    </h3>
                                </div>
                            </div>
                            <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-[4/3] cursor-pointer">
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                                <div className="absolute inset-0 bg-[#DC0000]/30" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                                    <span className="inline-block px-3 py-1 bg-red-700 text-white text-xs font-bold rounded-full mb-3">FERRARI</span>
                                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                                        Ferrari dévoile sa nouvelle monoplace
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer de la page */}
            <footer className="relative py-12 px-8 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-gray-500 text-sm">
                        © 2025 Paddock World. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </main>
    )
}
