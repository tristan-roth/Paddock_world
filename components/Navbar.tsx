"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'HOME', path: '/' },
        { name: 'ABOUT', path: '/about' },
        { name: 'SPORTS', path: '/sports' },
        { name: 'CREATORS', path: '/creators' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
                    ${isScrolled ? 'bg-neutral-950/95 backdrop-blur-md' : 'bg-transparent'}`}
            >
                <div className="w-full px-8 md:px-16 h-24 flex items-center justify-between">

                    {/* Logo - Gauche */}
                    <Link href="/" className="relative z-50 shrink-0">
                        <Image
                            src="/img/logo.png"
                            alt="Paddock World"
                            width={140}
                            height={45}
                            className="object-contain"
                            priority
                        />
                    </Link>

                    {/* Navigation centrale - Desktop */}
                    <nav className="hidden md:flex items-center justify-center gap-12 flex-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
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
                                    {/* Underline animé avec cubic-bezier */}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-[2px] bg-red-500 transition-all duration-500 origin-left
                                            ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                        style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions - Droite */}
                    <div className="hidden md:flex items-center gap-8 shrink-0">
                        <Link
                            href="/account"
                            className="group relative py-2"
                        >
                            <span className="text-[13px] font-medium tracking-[0.15em] uppercase text-gray-400 transition-colors duration-300 group-hover:text-white">
                                ACCOUNT
                            </span>
                            <span
                                className="absolute -bottom-1 left-0 h-[2px] bg-red-500 w-0 group-hover:w-full transition-all duration-500 origin-left"
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
                                className="absolute -bottom-1 left-0 h-[2px] bg-red-500 w-0 group-hover:w-full transition-all duration-500 origin-left"
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

            {/* Mobile Menu */}
            <div className={`fixed inset-0 z-40 bg-neutral-950 transition-all duration-500 md:hidden
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
                                    className={`absolute -bottom-2 left-0 h-[2px] bg-red-500 transition-all duration-500 origin-left
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
                                className="absolute -bottom-1 left-0 h-[2px] bg-red-500 w-0 group-hover:w-full transition-all duration-500 origin-left"
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
                                className="absolute -bottom-1 left-0 h-[2px] bg-red-500 w-0 group-hover:w-full transition-all duration-500 origin-left"
                                style={{ transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)' }}
                            />
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    );
}
