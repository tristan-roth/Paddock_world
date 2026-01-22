import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
    return (
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/img/piste.png"
                    alt="Race Track Background"
                    fill
                    priority
                    quality={90}
                    sizes="100vw"
                    className="object-cover"
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center pt-20">
                <h1 className="text-white text-[120px] md:text-[180px] font-playfair font-black italic tracking-tighter leading-none drop-shadow-xl select-none">
                    WELCOME
                </h1>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 z-10 animate-bounce">
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-white"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                </div>
            </div>
        </section>
    );
}
