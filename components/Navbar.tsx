import Image from 'next/image';
import Link from 'next/link';

const NavLink = ({ href, children, isActive = false }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
    <Link
        href={href}
        className={`group relative px-2 py-1 text-xl font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-300 hover:text-white'}`}
    >
        {children}
        <span className={`absolute left-0 bottom-0 h-[2px] w-full bg-white transform origin-center transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
    </Link>
);

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-12 py-8 text-white bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            {/* Pointer events auto enabled on children */}

            {/* Left Navigation */}
            <div className="pointer-events-auto flex items-center gap-10 bg-[#121218]/90 px-10 py-4 rounded-full backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-300">
                <NavLink href="/" isActive={true}>Home</NavLink>
                <NavLink href="/about">About</NavLink>
                <NavLink href="/sports">Sports</NavLink>
                <NavLink href="/creators">Creators</NavLink>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto transform hover:scale-105 transition-transform duration-500 cursor-pointer">
                <Link href="/">
                    <Image
                        src="/img/logo.png"
                        alt="Paddock World Logo"
                        width={280}
                        height={90}
                        className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                        priority
                    />
                </Link>
            </div>

            {/* Right Actions */}
            <div className="pointer-events-auto flex items-center gap-6">
                <button className="group relative bg-[#121218]/90 hover:bg-[#1a1a24] px-8 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg text-lg font-medium transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden">
                    <span className="relative z-10">Account</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                </button>
                <button className="group relative bg-white text-black px-8 py-3 rounded-full backdrop-blur-md border border-white shadow-lg text-lg font-bold transition-all duration-300 hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    Shop
                </button>
            </div>
        </nav>
    );
}
