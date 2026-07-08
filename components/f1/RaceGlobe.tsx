'use client'
import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import type { GeometryObject, Topology } from 'topojson-specification'
import landTopo from 'world-atlas/land-110m.json'
import { latLngToVector3 } from '@/lib/f1/geo'
import type { RaceWithCircuit } from '@/lib/f1/types'

const GLOBE_RADIUS = 1

// ── Palette (alignée sur le thème violet du site) ──
const OCEAN_COLOR = '#080b1f'
const COAST_COLOR = '#8b93b8'
const GRATICULE_COLOR = '#3a4173'
const ATMOSPHERE_COLOR = '#7e22ce'
const MARKER_COLOR = '#c084fc'
const MARKER_NEXT_COLOR = '#a855f7'

// ── Géométrie des côtes (world-atlas land-110m, tracé en LineSegments) ──
// Un seul BufferGeometry pour toutes les côtes = un seul draw call. Chaque
// segment relie deux points consécutifs d'un anneau, projeté sur la sphère.
function useCoastlineGeometry(): THREE.BufferGeometry {
  return useMemo(() => {
    const topology = landTopo as unknown as Topology
    const land = feature(topology, topology.objects.land as GeometryObject)
    const positions: number[] = []

    const addRing = (ring: number[][]) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const a = latLngToVector3(ring[i][1], ring[i][0], GLOBE_RADIUS * 1.001)
        const b = latLngToVector3(ring[i + 1][1], ring[i + 1][0], GLOBE_RADIUS * 1.001)
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    }

    // land-110m expose une seule géométrie MultiPolygon (toutes les terres) ;
    // on gère aussi le cas FeatureCollection par sécurité de typage.
    const geometries =
      land.type === 'FeatureCollection'
        ? land.features.map((f) => f.geometry)
        : [land.geometry]
    for (const geometry of geometries) {
      if (geometry?.type === 'MultiPolygon') {
        for (const polygon of geometry.coordinates as number[][][][]) {
          for (const ring of polygon) addRing(ring)
        }
      } else if (geometry?.type === 'Polygon') {
        for (const ring of geometry.coordinates as number[][][]) addRing(ring)
      }
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [])
}

// ── Grille lat/long (graticule) ──
function useGraticuleGeometry(): THREE.BufferGeometry {
  return useMemo(() => {
    const positions: number[] = []
    const radius = GLOBE_RADIUS * 1.0005
    const arcStep = 4 // subdivision pour suivre la courbure

    const addArc = (from: [number, number], to: [number, number]) => {
      const a = latLngToVector3(from[0], from[1], radius)
      const b = latLngToVector3(to[0], to[1], radius)
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z)
    }

    // Méridiens tous les 30°
    for (let lng = -180; lng < 180; lng += 30) {
      for (let lat = -90; lat < 90; lat += arcStep) addArc([lat, lng], [lat + arcStep, lng])
    }
    // Parallèles tous les 30°
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lng = -180; lng < 180; lng += arcStep) addArc([lat, lng], [lat, lng + arcStep])
    }

    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geom
  }, [])
}

interface MarkerProps {
  race: RaceWithCircuit
  isNext: boolean
  isActive: boolean
  onHover: (race: RaceWithCircuit | null) => void
  onSelect: (race: RaceWithCircuit) => void
}

// Une pastille de circuit : un petit pilier + un point lumineux posé sur la
// surface, avec une zone de clic élargie invisible pour faciliter le pointage.
function CircuitMarker({ race, isNext, isActive, onHover, onSelect }: MarkerProps) {
  const dotRef = useRef<THREE.Mesh>(null)
  const { surface, tip, quaternion } = useMemo(() => {
    const lat = race.circuit.latitude as number
    const lng = race.circuit.longitude as number
    const surfacePoint = latLngToVector3(lat, lng, GLOBE_RADIUS)
    const tipPoint = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.05)
    // Oriente le pilier le long de la normale (du centre vers l'extérieur).
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      surfacePoint.clone().normalize(),
    )
    return { surface: surfacePoint, tip: tipPoint, quaternion: quat }
  }, [race])

  const emphasized = isActive || isNext
  const color = isNext ? MARKER_NEXT_COLOR : MARKER_COLOR

  // Pulsation douce du point du prochain GP / du circuit actif.
  useFrame((state) => {
    if (!dotRef.current) return
    const pulse = emphasized ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.18 : 1
    dotRef.current.scale.setScalar(pulse)
  })

  const pillarMid = surface.clone().add(tip).multiplyScalar(0.5)
  const pillarHeight = surface.distanceTo(tip)

  return (
    <group>
      {/* Pilier reliant la surface au point */}
      <mesh position={pillarMid} quaternion={quaternion}>
        <cylinderGeometry args={[0.004, 0.004, pillarHeight, 6]} />
        <meshBasicMaterial color={color} transparent opacity={emphasized ? 0.9 : 0.5} />
      </mesh>

      {/* Point lumineux (visuel seul) */}
      <mesh ref={dotRef} position={tip}>
        <sphereGeometry args={[emphasized ? 0.02 : 0.015, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Halo du point mis en avant */}
      {emphasized && (
        <mesh position={tip}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      )}

      {/* Zone d'interaction élargie invisible (raycast sur la géométrie,
          indépendante de l'opacité) pour faciliter le survol/clic. */}
      <mesh
        position={tip}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          onHover(race)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          onSelect(race)
        }}
      >
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}

interface LabelProps {
  race: RaceWithCircuit
  globeRef: React.RefObject<THREE.Mesh | null>
}

// Étiquette HTML ancrée au circuit, masquée quand elle passe derrière le globe.
function CircuitLabel({ race, globeRef }: LabelProps) {
  const position = useMemo(
    () => latLngToVector3(race.circuit.latitude as number, race.circuit.longitude as number, GLOBE_RADIUS * 1.08),
    [race],
  )
  return (
    <Html
      position={position}
      center
      occlude={[globeRef as React.RefObject<THREE.Object3D>]}
      style={{ pointerEvents: 'none', transform: 'translateY(-140%)' }}
      zIndexRange={[20, 0]}
    >
      <div className="whitespace-nowrap rounded-sm border border-purple-500/50 bg-black/85 px-3 py-1.5 backdrop-blur-sm shadow-[0_0_20px_rgba(126,34,206,0.3)]">
        <p className="text-[10px] font-mono tracking-[0.2em] text-purple-400 uppercase">
          Round {race.round}
        </p>
        <p className="text-xs font-bold text-white uppercase tracking-wide" style={{ fontFamily: 'var(--font-outfit)' }}>
          {race.circuit.locality}
        </p>
      </div>
    </Html>
  )
}

interface SceneProps {
  races: RaceWithCircuit[]
  nextRaceId: string | null
  activeId: string | null
  onHover: (race: RaceWithCircuit | null) => void
  onSelect: (race: RaceWithCircuit) => void
}

function GlobeScene({ races, nextRaceId, activeId, onHover, onSelect }: SceneProps) {
  const globeRef = useRef<THREE.Mesh>(null)
  const coastlines = useCoastlineGeometry()
  const graticule = useGraticuleGeometry()
  const [hovered, setHovered] = useState(false)

  const markers = useMemo(
    () => races.filter((r) => r.circuit.latitude != null && r.circuit.longitude != null),
    [races],
  )

  const handleHover = (race: RaceWithCircuit | null) => {
    setHovered(race != null)
    onHover(race)
  }

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 2, 2]} intensity={0.8} />

      {/* Océan */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial color={OCEAN_COLOR} roughness={1} metalness={0} />
      </mesh>

      {/* Graticule */}
      <lineSegments geometry={graticule}>
        <lineBasicMaterial color={GRATICULE_COLOR} transparent opacity={0.35} />
      </lineSegments>

      {/* Côtes */}
      <lineSegments geometry={coastlines}>
        <lineBasicMaterial color={COAST_COLOR} transparent opacity={0.75} />
      </lineSegments>

      {/* Atmosphère (halo violet en face arrière) */}
      <mesh scale={1.16}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color={ATMOSPHERE_COLOR}
          transparent
          opacity={0.09}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Circuits */}
      {markers.map((race) => (
        <CircuitMarker
          key={race.id}
          race={race}
          isNext={race.id === nextRaceId}
          isActive={race.id === activeId}
          onHover={handleHover}
          onSelect={onSelect}
        />
      ))}

      {/* Étiquette du circuit survolé / sélectionné */}
      {(() => {
        const labelRace =
          markers.find((r) => r.id === activeId) ?? null
        return labelRace ? <CircuitLabel race={labelRace} globeRef={globeRef} /> : null
      })()}

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={1.7}
        maxDistance={4}
        autoRotate={!hovered}
        autoRotateSpeed={0.45}
        rotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

interface RaceGlobeProps {
  races: RaceWithCircuit[]
  nextRaceId?: string | null
  className?: string
}

export default function RaceGlobe({ races, nextRaceId = null, className }: RaceGlobeProps) {
  const [hovered, setHovered] = useState<RaceWithCircuit | null>(null)
  const [selected, setSelected] = useState<RaceWithCircuit | null>(null)

  // Le circuit "actif" (étiquette + emphase) est celui survolé, sinon le
  // dernier cliqué. Le panneau de détails complet viendra plus tard.
  const activeId = hovered?.id ?? selected?.id ?? null

  return (
    <div className={`relative ${className ?? ''}`}>
      <Canvas camera={{ position: [0, 0.4, 2.8], fov: 42 }} dpr={[1, 2]}>
        <GlobeScene
          races={races}
          nextRaceId={nextRaceId}
          activeId={activeId}
          onHover={setHovered}
          onSelect={setSelected}
        />
      </Canvas>

      {/* Indice d'interaction */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </svg>
        Drag to rotate · click a circuit
      </div>
    </div>
  )
}
