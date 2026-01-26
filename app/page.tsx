'use client'
import { useState, useEffect } from 'react'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Scene3D from '@/components/Scene3D'
import Navbar from '@/components/Navbar'
import LoadingIntro from '@/components/LoadingIntro'

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showNavbar, setShowNavbar] = useState(false)

  const handleIntroComplete = () => {
    setIntroComplete(true)
    setShowContent(true)
  }

  const handleNavbarShow = () => {
    setShowNavbar(true)
  }

  return (
    <>
      <LoadingIntro onComplete={handleIntroComplete} />

      {showContent && (
        <main
          className="relative w-full overflow-hidden"
          style={{
            background: 'linear-gradient(to right, #000000 0%, #050812 50%, #0a0e27 100%)'
          }}
        >
        <Navbar shouldAnimate={showNavbar} />
        <Hero startAnimation={showContent} onNavbarShow={handleNavbarShow} />
        <About />

        {/* 3D Section */}
        <section className="py-20 flex flex-col items-center justify-center text-white" id="model-section">
          <h2 className="text-4xl font-bold tracking-tighter mb-10">TEST DE <span className="text-red-600">MODELE 3D bitch</span></h2>
          <Scene3D />
        </section>
        </main>
      )}
    </>
  )
}
