import Hero from '@/components/Hero'
import About from '@/components/About'
import SportsCategories from '@/components/SportsCategories'
import Scene3D from '@/components/Scene3D'
import Navbar from '@/components/Navbar'
import HomeBackground from '@/components/HomeBackground'

export default function Home() {
  return (
    <main className="relative w-full overflow-hidden bg-black">
      <HomeBackground />
      <Navbar disableEntryAnimation />
      <Hero startAnimation />
      <About />
      <SportsCategories />

      <section className="relative z-10 py-12 md:py-20 px-4 flex flex-col items-center justify-center text-white" id="model-section">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-6 md:mb-10 text-center">
          3D Model <span className="text-purple-700">Preview</span>
        </h2>
        <Scene3D />
      </section>
    </main>
  )
}
