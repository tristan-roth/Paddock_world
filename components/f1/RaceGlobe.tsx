'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
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
const LAND_COLOR = '#1c2444' // remplissage des continents : plus clair que l'océan
const COAST_COLOR = '#8b93b8'
const GRATICULE_COLOR = '#3a4173'
const ATMOSPHERE_COLOR = '#7e22ce'
const MARKER_COLOR = '#c084fc' // teinte de repli quand l'ordre est masqué

// ── Ordre du calendrier (option B : dégradé de teinte par manche) ──
const ORDER_EARLY = '#f0d9ff' // manche 1 : début du dégradé (clair)
const ORDER_LATE = '#7c1fb5' // finale : fin du dégradé (violet profond)
// ── Repères d'extrémités (option C) ──
const START_RING_COLOR = '#a855f7' // anneau violet : manche d'ouverture
const FINALE_RING_COLOR = '#f5f5f5' // anneau blanc "damier" : finale

// Couleur d'une pastille selon sa position t (0 = manche 1 → 1 = finale).
function orderColor(t: number): THREE.Color {
  return new THREE.Color(ORDER_EARLY).lerp(new THREE.Color(ORDER_LATE), t)
}

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

// ── Texture équirectangulaire océan + continents ──
// Les côtes en LineSegments ne suffisaient pas à distinguer les continents de
// l'océan (les deux restaient sombres) : on peint donc un canvas 2D (mapping
// lng/lat → x/y linéaire, qui coïncide exactement avec l'UV par défaut de
// SphereGeometry) et on l'applique comme texture de la sphère. Un seul calcul,
// mémoïsé, bien moins coûteux qu'une triangulation 3D des polygones.
function useEarthTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const width = 2048
    const height = 1024
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    ctx.fillStyle = OCEAN_COLOR
    ctx.fillRect(0, 0, width, height)

    const project = (lng: number, lat: number): [number, number] => [
      ((lng + 180) / 360) * width,
      ((90 - lat) / 180) * height,
    ]

    const topology = landTopo as unknown as Topology
    const land = feature(topology, topology.objects.land as GeometryObject)
    const geometries =
      land.type === 'FeatureCollection' ? land.features.map((f) => f.geometry) : [land.geometry]

    ctx.fillStyle = LAND_COLOR
    for (const geometry of geometries) {
      const polygons =
        geometry?.type === 'MultiPolygon'
          ? (geometry.coordinates as number[][][][])
          : geometry?.type === 'Polygon'
            ? [geometry.coordinates as number[][][]]
            : []
      for (const polygon of polygons) {
        ctx.beginPath()
        for (const ring of polygon) {
          ring.forEach(([lng, lat], i) => {
            const [x, y] = project(lng, lat)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.closePath()
        }
        ctx.fill('evenodd')
      }
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
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

// Détermine la manche d'ouverture et la finale (parmi les circuits localisés).
function useSeasonEnds(races: RaceWithCircuit[]): { start: RaceWithCircuit | null; finale: RaceWithCircuit | null } {
  return useMemo(() => {
    const located = races
      .filter((r) => r.circuit.latitude != null && r.circuit.longitude != null)
      .sort((a, b) => a.round - b.round)
    if (located.length === 0) return { start: null, finale: null }
    const start = located[0]
    const finale = located.length > 1 ? located[located.length - 1] : null
    return { start, finale }
  }, [races])
}

interface MarkerProps {
  race: RaceWithCircuit
  /** Couleur dégradée selon la position de la manche dans la saison (option B). */
  color: THREE.Color
  isNext: boolean
  isActive: boolean
  isStart: boolean
  isFinale: boolean
  globeRef: React.RefObject<THREE.Mesh | null>
  onHover: (race: RaceWithCircuit | null) => void
  onSelect: (race: RaceWithCircuit) => void
}

// Une pastille de circuit : un petit pilier + un point lumineux posé sur la
// surface, avec une zone de clic élargie invisible pour faciliter le pointage.
function CircuitMarker({ race, color, isNext, isActive, isStart, isFinale, globeRef, onHover, onSelect }: MarkerProps) {
  const dotRef = useRef<THREE.Mesh>(null)
  const { surface, tip, quaternion, ringQuaternion } = useMemo(() => {
    const lat = race.circuit.latitude as number
    const lng = race.circuit.longitude as number
    const surfacePoint = latLngToVector3(lat, lng, GLOBE_RADIUS)
    const tipPoint = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.05)
    const normal = surfacePoint.clone().normalize()
    // Oriente le pilier le long de la normale (du centre vers l'extérieur).
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    // Un anneau (plan XY, normale +Z) posé à plat face à l'extérieur.
    const ringQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    return { surface: surfacePoint, tip: tipPoint, quaternion: quat, ringQuaternion: ringQuat }
  }, [race])

  const emphasized = isActive || isNext
  const isEnd = isStart || isFinale
  const ringColor = isStart ? START_RING_COLOR : FINALE_RING_COLOR
  const noRaycast = () => null

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
        <meshBasicMaterial color={color} transparent opacity={emphasized || isEnd ? 0.9 : 0.5} />
      </mesh>

      {/* Point lumineux (visuel seul) */}
      <mesh ref={dotRef} position={tip}>
        <sphereGeometry args={[emphasized || isEnd ? 0.02 : 0.015, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Halo du point mis en avant */}
      {emphasized && (
        <mesh position={tip}>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} toneMapped={false} />
        </mesh>
      )}

      {/* Repère d'extrémité (option C) : anneau sobre + étiquette persistante */}
      {isEnd && (
        <>
          <mesh position={tip} quaternion={ringQuaternion} raycast={noRaycast}>
            <ringGeometry args={[0.028, 0.038, 40]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0.9} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
          <Html
            position={tip}
            center
            occlude={[globeRef as React.RefObject<THREE.Object3D>]}
            style={{ pointerEvents: 'none', transform: 'translateY(-150%)' }}
            zIndexRange={[24, 0]}
          >
            {isStart ? (
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-purple-400/50 bg-black/85 px-2 py-0.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-purple-300 uppercase">Start</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 whitespace-nowrap rounded-sm border border-white/50 bg-black/85 px-2 py-0.5 backdrop-blur-sm">
                <span
                  className="h-2 w-2 rounded-[1px]"
                  style={{ background: 'conic-gradient(#fff 0 25%, #111 0 50%, #fff 0 75%, #111 0)' }}
                />
                <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-white uppercase">Finale</span>
              </div>
            )}
          </Html>
        </>
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
  zoomEnabled: boolean
  showOrder: boolean
  onHover: (race: RaceWithCircuit | null) => void
  onSelect: (race: RaceWithCircuit) => void
}

function GlobeScene({ races, nextRaceId, activeId, zoomEnabled, showOrder, onHover, onSelect }: SceneProps) {
  const globeRef = useRef<THREE.Mesh>(null)
  const coastlines = useCoastlineGeometry()
  const earthTexture = useEarthTexture()
  const graticule = useGraticuleGeometry()
  const [hovered, setHovered] = useState(false)

  const markers = useMemo(
    () => races.filter((r) => r.circuit.latitude != null && r.circuit.longitude != null),
    [races],
  )
  const { start, finale } = useSeasonEnds(races)

  // Couleur dégradée par circuit selon sa manche (option B). Trié par round :
  // manche 1 = clair → finale = violet profond. Repli sur la couleur unie si le
  // dégradé est désactivé.
  const colorMap = useMemo(() => {
    const map = new Map<string, THREE.Color>()
    const ordered = markers.slice().sort((a, b) => a.round - b.round)
    const denom = Math.max(1, ordered.length - 1)
    ordered.forEach((race, i) => {
      map.set(race.id, showOrder ? orderColor(i / denom) : new THREE.Color(MARKER_COLOR))
    })
    return map
  }, [markers, showOrder])

  const handleHover = (race: RaceWithCircuit | null) => {
    setHovered(race != null)
    onHover(race)
  }

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, 2, 2]} intensity={0.8} />

      {/* Océan + continents (texture équirectangulaire peinte sur la sphère) */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial map={earthTexture} roughness={1} metalness={0} />
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

      {/* Circuits (pastilles dégradées + repères d'extrémités) */}
      {markers.map((race) => (
        <CircuitMarker
          key={race.id}
          race={race}
          color={colorMap.get(race.id) ?? new THREE.Color(MARKER_COLOR)}
          isNext={race.id === nextRaceId}
          isActive={race.id === activeId}
          isStart={showOrder && race.id === start?.id}
          isFinale={showOrder && race.id === finale?.id}
          globeRef={globeRef}
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
        // Le zoom molette n'est actif que Ctrl enfoncé : sinon la molette
        // laisse défiler la page normalement (au lieu de dézoomer le globe).
        enableZoom={zoomEnabled}
        zoomSpeed={0.5}
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
  /** Circuit sélectionné (piloté par le parent, qui affiche la fiche détail). */
  selectedId?: string | null
  /** Notifie le parent d'un clic circuit (ou `null` sur clic dans le vide). */
  onSelectRace?: (race: RaceWithCircuit | null) => void
  /** Affiche l'ordre du calendrier : dégradé + repères ouverture/finale. */
  showOrder?: boolean
  className?: string
}

export default function RaceGlobe({
  races,
  nextRaceId = null,
  selectedId = null,
  onSelectRace,
  showOrder = true,
  className,
}: RaceGlobeProps) {
  const [hovered, setHovered] = useState<RaceWithCircuit | null>(null)
  const [zoomEnabled, setZoomEnabled] = useState(false)

  // Le circuit "actif" (étiquette + emphase) est celui survolé, sinon le
  // sélectionné (fiche détail ouverte côté parent).
  const activeId = hovered?.id ?? selectedId

  // Ctrl active le zoom molette ; le relâchement (ou la perte de focus fenêtre)
  // le désactive pour rendre le défilement de page à la molette.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') setZoomEnabled(true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setZoomEnabled(false)
    }
    const onBlur = () => setZoomEnabled(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return (
    <div className={`relative ${className ?? ''}`}>
      <Canvas camera={{ position: [0, 0.4, 2.8], fov: 42 }} dpr={[1, 2]}>
        <GlobeScene
          races={races}
          nextRaceId={nextRaceId}
          activeId={activeId}
          zoomEnabled={zoomEnabled}
          showOrder={showOrder}
          onHover={setHovered}
          onSelect={(race) => onSelectRace?.(race)}
        />
      </Canvas>

      {/* Légende : dégradé de l'ordre (option B) + repères ouverture/finale (C) */}
      {showOrder && (
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2 text-[10px] font-mono tracking-[0.2em] text-gray-400 uppercase">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-purple-400" />
              Start
            </span>
            <span
              className="h-1.5 w-16 rounded-full"
              style={{ background: `linear-gradient(90deg, ${ORDER_EARLY}, ${ORDER_LATE})` }}
            />
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-[1px]"
                style={{ background: 'conic-gradient(#fff 0 25%, #111 0 50%, #fff 0 75%, #111 0)' }}
              />
              Finale
            </span>
          </div>
        </div>
      )}

      {/* Indice d'interaction */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </svg>
        Drag to rotate · Ctrl + scroll to zoom
      </div>
    </div>
  )
}
