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
        image: '/img/indycar-bg.jpg'
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

            {/* Sports Mega Menu Dropdown */}
            <div
                className={`fixed top-32 left-0 w-full z-40 transition-all duration-700 overflow-hidden
                    ${isSportsOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                onMouseEnter={() => setIsSportsOpen(true)}
                onMouseLeave={() => setIsSportsOpen(false)}
            >
                <div className="bg-[#060918]/98 backdrop-blur-xl border-t border-white/10">
                    <div className="w-full px-8 md:px-16 py-12">
                        <div className="grid grid-cols-3 gap-6">
                            {sportsCategories.map((category, index) => (
                                <Link
                                    key={category.name}
                                    href={category.path}
                                    className={`group relative h-64 overflow-hidden transition-all duration-1000
                                        ${isSportsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                    style={{
                                        transitionDelay: isSportsOpen ? `${index * 100}ms` : '0ms',
                                        transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)'
                                    }}
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0 bg-neutral-800">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url(${category.image})` }}
                                        />
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative h-full flex items-end p-8">
                                        <div className="w-full">
                                            <h3 className="text-white text-3xl font-bold tracking-tight mb-2 group-hover:translate-x-2 transition-transform duration-500">
                                                {category.name}
                                            </h3>
                                            {/* Underline animé */}
                                            <div className="h-[3px] bg-purple-700 w-0 group-hover:w-full transition-all duration-500 origin-left"
                                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Border hover effect */}
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-700/50 transition-all duration-500" />
                                </Link>
                            ))}
                        </div>
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
