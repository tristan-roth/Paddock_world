'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

function RotatingCube() {
    const meshRef = useRef<Mesh>(null)

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.3
            meshRef.current.rotation.y += delta * 0.5
        }
    })

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#dc2626" metalness={0.3} roughness={0.4} />
        </mesh>
    )
}

export default function Scene3D() {
    return (
        <div className="w-full h-[400px] bg-neutral-900">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <RotatingCube />
                </Suspense>
            </Canvas>
        </div>
    )
}
