'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const f1Tabs = [
    {
        name: 'THE CHAMPIONSHIP',
        path: '/sports/f1/championship',
        subTabs: [
            { name: 'The Drivers', anchor: 'drivers' },
            { name: 'The Teams', anchor: 'teams' },
            { name: 'The Calendar', anchor: 'calendar' },
            { name: 'The Standings', anchor: 'standings' },
        ],
    },
    {
        name: 'THE UNIVERS',
        path: '/sports/f1/univers',
        subTabs: [
            { name: 'The History', anchor: 'history' },
            { name: 'The Impact', anchor: 'impact' },
            { name: 'The Fans', anchor: 'fans' },
            { name: 'Follow a Race Week', anchor: 'race-week' },
        ],
    },
    {
        name: 'MASTERING F1',
        path: '/sports/f1/mastering',
        subTabs: [
            { name: 'The Rules', anchor: 'rules' },
            { name: 'The Strategy', anchor: 'strategy' },
            { name: 'The Technology', anchor: 'technology' },
            { name: 'The Driving', anchor: 'driving' },
        ],
    },
]

export default function F1SubNav() {
    const pathname = usePathname()
    const [visible, setVisible] = useState(false)
    const [hoveredTab, setHoveredTab] = useState<number | null>(null)
    const lastScrollY = useRef(0)
    const ticking = useRef(false)
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (ticking.current) return
            ticking.current = true
            requestAnimationFrame(() => {
                const currentY = window.scrollY
                if (currentY < 120) {
                    setVisible(false)
                } else if (currentY < lastScrollY.current - 4) {
                    setVisible(true)
                } else if (currentY > lastScrollY.current + 4) {
                    setVisible(false)
                    setHoveredTab(null)
                }
                lastScrollY.current = currentY
                ticking.current = false
            })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const openTab = (i: number) => {
        if (closeTimer.current) clearTimeout(closeTimer.current)
        setHoveredTab(i)
    }

    const closeTab = () => {
        closeTimer.current = setTimeout(() => setHoveredTab(null), 120)
    }

    return (
        <div
            className={`fixed left-0 w-full z-40 transition-all duration-500
                top-14 md:top-20
                ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
        >
            {/* Bar principale */}
            <div
                className="w-full px-4 py-3 flex items-center justify-center gap-1 md:gap-2"
                style={{ background: 'rgba(6, 9, 24, 0.95)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
                {f1Tabs.map((tab, i) => {
                    const isActive = pathname === tab.path || pathname.startsWith(tab.path + '/')
                    const isOpen = hoveredTab === i

                    return (
                        <div
                            key={tab.name}
                            className="relative"
                            onMouseEnter={() => openTab(i)}
                            onMouseLeave={closeTab}
                        >
                            {/* Bouton principal */}
                            <Link
                                href={tab.path}
                                className={`group relative flex items-center px-6 md:px-8 py-2.5 text-[11px] md:text-[13px] tracking-[0.2em] uppercase font-bold rounded-[4px]
                                    transition-all duration-300
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                                style={{ fontFamily: 'var(--font-outfit)' }}
                            >
                                {/* Fond du bouton */}
                                <span
                                    className={`absolute inset-0 rounded-[4px] border transition-all duration-300
                                        ${isActive
                                            ? 'border-white/30 bg-white/[0.06]'
                                            : 'border-white/15 bg-transparent group-hover:border-white/25 group-hover:bg-white/[0.04]'
                                        }`}
                                />

                                <span className="relative z-10">{tab.name}</span>

                                {/* Barre violette active */}
                                <span
                                    className={`absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-purple-600 transition-all duration-500 origin-center
                                        ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`}
                                />

                                {/* Chevron */}
                                <svg
                                    className={`relative z-10 ml-2 w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-purple-400' : 'text-gray-600 group-hover:text-gray-400'}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </Link>

                            {/* Dropdown sous-sections */}
                            <div
                                className={`absolute left-0 top-full pt-1.5 z-50 min-w-[200px] transition-all duration-300 ease-[cubic-bezier(0.19,1,0.22,1)]
                                    ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                                onMouseEnter={() => openTab(i)}
                                onMouseLeave={closeTab}
                            >
                                <div
                                    className="rounded-[4px] overflow-hidden shadow-2xl shadow-black/60"
                                    style={{ background: 'rgba(6, 9, 24, 0.98)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.10)' }}
                                >
                                    {tab.subTabs.map((sub) => (
                                        <Link
                                            key={sub.anchor}
                                            href={`${tab.path}#${sub.anchor}`}
                                            className="group/sub flex items-center gap-3 px-5 py-3.5 transition-all duration-200 hover:bg-white/[0.05]"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-700/40 group-hover/sub:bg-purple-500 transition-colors duration-200 shrink-0" />
                                            <span
                                                className="text-gray-400 text-[11px] tracking-[0.15em] uppercase group-hover/sub:text-white transition-colors duration-200"
                                                style={{ fontFamily: 'var(--font-barlow)' }}
                                            >
                                                {sub.name}
                                            </span>
                                            <svg
                                                className="w-3 h-3 text-gray-700 ml-auto opacity-0 group-hover/sub:opacity-100 group-hover/sub:translate-x-0.5 transition-all duration-200"
                                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
