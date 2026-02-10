'use client'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Scene3D from '@/components/Scene3D'
import Navbar from '@/components/Navbar'

export default function Home() {
  return (
    <>
      <main
        className="relative w-full overflow-hidden"
        style={{
          background: 'linear-gradient(to right, #000000 0%, #050812 50%, #0a0e27 100%)'
        }}
      >
        <Navbar disableEntryAnimation />
        <Hero startAnimation={true} />
        <About />

        {/* 3D Section */}
        <section className="py-20 flex flex-col items-center justify-center text-white" id="model-section">
          <h2 className="text-4xl font-bold tracking-tighter mb-10">TEST DE <span className="text-purple-700">MODELE 3D bitch</span></h2>
          <Scene3D />
        </section>
      </main>
    </>
  )
}

