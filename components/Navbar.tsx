"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

const sportsCategories = [
    {
        name: 'FORMULA 1',
        path: '/sports/f1',
        image: '/img/f1-bg.png'
    },
    {
        name: 'INDYCAR',
        path: '/sports/indycar',
        image: '/img/indycar.png'
    },
    {
        name: 'MOTOGP',
        path: '/sports/motogp',
        image: '/img/motogp-bg.jpg'
    },
    {
        name: 'WRC',
        path: '/sports/wrc',
        image: '/img/wrc-bg.jpg'
    },
    {
        name: 'F1 ACADEMY',
        path: '/sports/f1-academy',
        image: '/img/f1-academy-bg.jpg'
    },
    {
        name: 'SUPERMOT',
        path: '/sports/supermot',
        image: '/img/supermot-bg.jpg'
    },
];

interface NavbarProps {
    shouldAnimate?: boolean
    disableEntryAnimation?: boolean
}

export default function Navbar({ shouldAnimate = false, disableEntryAnimation = false }: NavbarProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSportsOpen, setIsSportsOpen] = useState(false);
    const [hoveredSportIndex, setHoveredSportIndex] = useState(0);
    const headerRef = useRef<HTMLElement>(null);
    const hasAnimatedRef = useRef(false);

    const navItems = [
        { name: 'HOME', path: '/', hasDropdown: false },
        { name: 'SPORTS', path: '/sports', hasDropdown: true },
        { name: 'CREATORS', path: '/creators', hasDropdown: false },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (disableEntryAnimation && headerRef.current) {
            gsap.set(headerRef.current, { opacity: 1, y: 0 });
            return;
        }

        if (shouldAnimate && headerRef.current && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            gsap.fromTo(headerRef.current,
                { opacity: 0, y: -50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power3.out"
                }
            );
        }
    }, [shouldAnimate, disableEntryAnimation]);

    return (
        <>
            <header
                ref={headerRef}
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
                    ${isScrolled ? 'bg-[#060918]/95 backdrop-blur-md' : 'bg-transparent'}`}
                style={disableEntryAnimation
                    ? { opacity: 1, transform: 'translateY(0)' }
                    : { opacity: 0, transform: 'translateY(-50px)' }
                }
            >
                <div className="w-full px-8 md:px-16 h-32 flex items-center justify-between">

                    {/* Navigation - Gauche */}
                    <nav className="hidden md:flex items-center gap-10 flex-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

                            if (item.hasDropdown) {
                                return (
                                    <div
                                        key={item.name}
                                        className="relative"
                                        onMouseEnter={() => setIsSportsOpen(true)}
                                        onMouseLeave={() => setIsSportsOpen(false)}
                                    >
                                        <button className="group relative py-2 flex items-center gap-1">
                                            <span className={`text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300
                                                ${isActive || isSportsOpen ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                                            >
                                                {item.name}
                                            </span>
                                            {/* Chevron */}
                                            <svg
                                                className={`w-3 h-3 transition-transform duration-300 ${isSportsOpen ? 'rotate-180' : ''} ${isActive || isSportsOpen ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                            {/* Underline animé */}
                                            <span
                                                className={`absolute -bottom-1 left-0 h-[2px] bg-purple-700 transition-all duration-500 origin-left
                                                    ${isActive || isSportsOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                            />
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    className="group relative py-2"
                                >
                                    <span className={`text-[13px] font-medium tracking-[0.15em] uppercase transition-colors duration-300
                                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                                    >
                                        {item.name}
                                    </span>
                                    {/* Underline animé */}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-[2px] bg-purple-700 transition-all duration-500 origin-left
                                            ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                        style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logo - Centre */}
                    <Link href="/" className="relative z-50 shrink-0 mx-8">
                        <Image
                            src="/img/logo.png"
                            alt="Paddock World"
                            width={300}
                            height={100}
                            className="object-contain"
                            priority
                        />
                    </Link>

                    {/* Actions - Droite */}
                    <div className="hidden md:flex items-center justify-end gap-8 flex-1">
                        <Link
                            href="/account"
                            className="group relative py-2"
                        >
                            <span className="text-[13px] font-medium tracking-[0.15em] uppercase text-gray-400 transition-colors duration-300 group-hover:text-white">
                                ACCOUNT
                            </span>
                            <span
                                className="absolute -bottom-1 left-0 h-[2px] bg-purple-700 w-0 group-hover:w-full transition-all duration-500 origin-left"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        </Link>
                        <Link
                            href="/shop"
                            className="group relative py-2"
                        >
                            <span className="text-[13px] font-medium tracking-[0.15em] uppercase text-gray-400 transition-colors duration-300 group-hover:text-white">
                                SHOP
                            </span>
                            <span
                                className="absolute -bottom-1 left-0 h-[2px] bg-purple-700 w-0 group-hover:w-full transition-all duration-500 origin-left"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center"
                        aria-label="Menu"
                    >
                        <div className="relative w-6 h-4 flex flex-col justify-between">
                            <span className={`w-full h-[2px] bg-white transition-all duration-300 origin-center
                                ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}
                            />
                            <span className={`w-full h-[2px] bg-white transition-all duration-300
                                ${isMobileMenuOpen ? 'opacity-0' : ''}`}
                            />
                            <span className={`w-full h-[2px] bg-white transition-all duration-300 origin-center
                                ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}
                            />
                        </div>
                    </button>
                </div>
            </header>

            {/* Sports Mega Menu — Split Screen Takeover */}
            <div
                className={`fixed top-32 left-0 w-full z-40 transition-all duration-700
                    ${isSportsOpen ? 'h-[calc(100vh-8rem)] opacity-100' : 'h-0 opacity-0'}`}
                style={{
                    transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
                    overflow: isSportsOpen ? 'visible' : 'hidden'
                }}
                onMouseEnter={() => setIsSportsOpen(true)}
                onMouseLeave={() => setIsSportsOpen(false)}
            >
                <div className="h-full bg-[#060918] border-t border-white/5 flex">

                    {/* LEFT — Sports List */}
                    <div className="w-full md:w-[45%] h-full flex flex-col justify-center px-8 md:px-16 py-10">
                        {sportsCategories.map((category, index) => {
                            const isHovered = hoveredSportIndex === index;
                            return (
                                <Link
                                    key={category.name}
                                    href={category.path}
                                    className={`group relative block py-5 transition-all duration-700
                                        ${isSportsOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
                                    style={{
                                        transitionDelay: isSportsOpen ? `${200 + index * 80}ms` : '0ms',
                                        transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                                    }}
                                    onMouseEnter={() => setHoveredSportIndex(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline gap-5">
                                            {/* Index */}
                                            <span className={`text-xs font-mono tracking-[0.3em] transition-colors duration-500
                                                ${isHovered ? 'text-purple-400' : 'text-white/20'}`}
                                            >
                                                0{index + 1}
                                            </span>
                                            {/* Sport Name */}
                                            <h3
                                                className={`text-3xl md:text-[42px] font-bold uppercase tracking-[0.08em] leading-none transition-all duration-500
                                                    ${isHovered ? 'text-white translate-x-3' : 'text-white/30'}`}
                                                style={{ fontFamily: 'var(--font-outfit)' }}
                                            >
                                                {category.name}
                                            </h3>
                                        </div>

                                        {/* Arrow */}
                                        <svg
                                            className={`w-6 h-6 transition-all duration-500
                                                ${isHovered ? 'text-purple-400 translate-x-0 opacity-100' : 'text-white/10 -translate-x-3 opacity-0'}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                        </svg>
                                    </div>

                                    {/* Animated underline */}
                                    <div className="mt-4 h-[1px] w-full relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/5" />
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700 ease-out"
                                            style={{
                                                width: isHovered ? '100%' : '0%',
                                                transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                                            }}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* RIGHT — Dynamic Image Panel */}
                    <div className="hidden md:block relative w-[55%] h-full overflow-hidden">
                        {sportsCategories.map((category, index) => (
                            <div
                                key={category.name}
                                className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                                style={{ opacity: hoveredSportIndex === index ? 1 : 0 }}
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out"
                                    style={{
                                        backgroundImage: `url(${category.image})`,
                                        transform: hoveredSportIndex === index ? 'scale(1.05)' : 'scale(1)'
                                    }}
                                />
                                {/* Gradient overlay for seamless blend */}
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#060918]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#060918]/80 via-transparent to-[#060918]/40" />
                            </div>
                        ))}

                        {/* Decorative purple line at the bottom of image panel */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-l from-purple-700 via-purple-500 to-transparent z-10" />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 z-40 bg-[#060918] transition-all duration-500 md:hidden
                ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
                <nav className="h-full flex flex-col items-center justify-center gap-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                href={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="group relative"
                            >
                                <span className={`text-3xl font-medium tracking-tight transition-colors duration-300
                                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`}
                                >
                                    {item.name}
                                </span>
                                <span
                                    className={`absolute -bottom-2 left-0 h-[2px] bg-purple-700 transition-all duration-500 origin-left
                                        ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                    style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                />
                            </Link>
                        );
                    })}
                    <div className="flex flex-col items-center gap-6 mt-8">
                        <Link
                            href="/account"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group relative"
                        >
                            <span className="text-gray-400 text-lg tracking-wider group-hover:text-white transition-colors duration-300">
                                ACCOUNT
                            </span>
                            <span
                                className="absolute -bottom-1 left-0 h-[2px] bg-purple-700 w-0 group-hover:w-full transition-all duration-500 origin-left"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        </Link>
                        <Link
                            href="/shop"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="group relative"
                        >
                            <span className="text-gray-400 text-lg tracking-wider group-hover:text-white transition-colors duration-300">
                                SHOP
                            </span>
                            <span
                                className="absolute -bottom-1 left-0 h-[2px] bg-purple-700 w-0 group-hover:w-full transition-all duration-500 origin-left"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}
