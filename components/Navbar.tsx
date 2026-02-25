"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { sportsCategories } from '@/data/sportsData';

interface NavbarProps {
    shouldAnimate?: boolean
    disableEntryAnimation?: boolean
}

export default function Navbar({ shouldAnimate = false, disableEntryAnimation = false }: NavbarProps) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSportsOpen, setIsSportsOpen] = useState(false);
    const [isMobileSportsOpen, setIsMobileSportsOpen] = useState(false);
    const [hoveredSportIndex, setHoveredSportIndex] = useState(0);
    const headerRef = useRef<HTMLElement>(null);
    const hasAnimatedRef = useRef(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const navItems = [
        { name: 'HOME', path: '/', hasDropdown: false },
        { name: 'SPORTS', path: '/sports', hasDropdown: true },
        { name: 'CREATORS', path: '/creators', hasDropdown: false },
    ];

    // Close mobile menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
            if (isMobileMenuOpen && window.scrollY > 50) {
                setIsMobileMenuOpen(false);
                setIsMobileSportsOpen(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isMobileMenuOpen]);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
                setIsMobileSportsOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

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

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        setIsMobileSportsOpen(false);
    };

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
                <div className="w-full px-4 sm:px-8 md:px-16 h-20 md:h-32 flex items-center justify-between">

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
                    <Link href="/" className="relative z-50 shrink-0 mx-4 md:mx-8">
                        <Image
                            src="/img/logo.png"
                            alt="Paddock World"
                            width={300}
                            height={100}
                            className="object-contain w-[180px] sm:w-[220px] md:w-[300px]"
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
                        onClick={() => {
                            setIsMobileMenuOpen(!isMobileMenuOpen);
                            if (isMobileMenuOpen) setIsMobileSportsOpen(false);
                        }}
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

            {/* Sports Mega Menu — Split Screen Takeover (Desktop) */}
            <div
                className={`fixed top-32 left-0 w-full z-40 transition-all duration-700 hidden md:block
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
                    <div className="w-[45%] h-full flex flex-col justify-center px-16 py-10">
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
                                                className={`text-[42px] font-bold uppercase tracking-[0.08em] leading-none transition-all duration-500
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
                    <div className="relative w-[55%] h-full overflow-hidden">
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

            {/* Mobile Dropdown Backdrop */}
            <div
                className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden
                    ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMobileMenu}
            />

            {/* Mobile Dropdown Menu */}
            <div
                ref={mobileMenuRef}
                className={`fixed top-20 left-0 right-0 z-40 md:hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                    ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            >
                <div className="mx-3 bg-[#0a0e27]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto">
                    {/* Navigation Links */}
                    <nav className="py-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');

                            if (item.hasDropdown) {
                                return (
                                    <div key={item.name}>
                                        {/* Sports button with accordion */}
                                        <button
                                            onClick={() => setIsMobileSportsOpen(!isMobileSportsOpen)}
                                            className="w-full flex items-center justify-between px-6 py-4 group"
                                        >
                                            <span className={`text-sm font-semibold tracking-[0.15em] uppercase transition-colors duration-300
                                                ${isActive ? 'text-white' : 'text-gray-400'}`}
                                            >
                                                {item.name}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-gray-500 transition-transform duration-300
                                                    ${isMobileSportsOpen ? 'rotate-180 text-purple-400' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Sports sub-menu accordion */}
                                        <div
                                            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                                                ${isMobileSportsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <div className="px-4 pb-3">
                                                {sportsCategories.map((sport, index) => (
                                                    <Link
                                                        key={sport.name}
                                                        href={sport.path}
                                                        onClick={closeMobileMenu}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors duration-200 group"
                                                    >
                                                        <span className="text-[10px] font-mono text-purple-500/60 tracking-wider">
                                                            0{index + 1}
                                                        </span>
                                                        <span className="text-white text-sm font-medium tracking-wider uppercase">
                                                            {sport.name}
                                                        </span>
                                                        <svg
                                                            className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 transition-colors duration-200"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                        </svg>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.path}
                                    onClick={closeMobileMenu}
                                    className="flex items-center px-6 py-4 group"
                                >
                                    <span className={`text-sm font-semibold tracking-[0.15em] uppercase transition-colors duration-300
                                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Divider */}
                    <div className="mx-6 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Account & Shop */}
                    <div className="py-3 px-6 flex items-center gap-6">
                        <Link
                            href="/account"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2 py-2 group"
                        >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            <span className="text-gray-400 text-xs tracking-[0.15em] uppercase group-hover:text-white transition-colors duration-200">
                                Account
                            </span>
                        </Link>
                        <Link
                            href="/shop"
                            onClick={closeMobileMenu}
                            className="flex items-center gap-2 py-2 group"
                        >
                            <svg className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <span className="text-gray-400 text-xs tracking-[0.15em] uppercase group-hover:text-white transition-colors duration-200">
                                Shop
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
