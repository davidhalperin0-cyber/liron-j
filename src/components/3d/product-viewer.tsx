"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  Float,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";

function JewelryModel({ type = "ring" }: { type?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group>
        {type === "ring" && (
          <mesh ref={meshRef} castShadow>
            <torusGeometry args={[1, 0.12, 64, 128]} />
            <meshPhysicalMaterial
              color="#C9A96E"
              metalness={1}
              roughness={0.12}
              clearcoat={1}
              clearcoatRoughness={0.08}
              reflectivity={1}
              envMapIntensity={2.5}
            />
          </mesh>
        )}

        {type === "necklace" && (
          <>
            <mesh ref={meshRef} castShadow>
              <torusGeometry args={[1.5, 0.03, 32, 128]} />
              <meshPhysicalMaterial
                color="#C9A96E"
                metalness={1}
                roughness={0.15}
                clearcoat={1}
                envMapIntensity={2}
              />
            </mesh>
            <mesh position={[0, -1.5, 0]} castShadow>
              <octahedronGeometry args={[0.15, 2]} />
              <meshPhysicalMaterial
                color="#ffffff"
                metalness={0.1}
                roughness={0}
                transmission={0.9}
                thickness={0.5}
                ior={2.4}
                clearcoat={1}
              />
            </mesh>
          </>
        )}

        {type === "earring" && (
          <>
            <mesh ref={meshRef} position={[-0.5, 0, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.8, 16, 32]} />
              <meshPhysicalMaterial
                color="#C9A96E"
                metalness={1}
                roughness={0.12}
                clearcoat={1}
                envMapIntensity={2}
              />
            </mesh>
            <mesh position={[0.5, 0, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.8, 16, 32]} />
              <meshPhysicalMaterial
                color="#C9A96E"
                metalness={1}
                roughness={0.12}
                clearcoat={1}
                envMapIntensity={2}
              />
            </mesh>
          </>
        )}

        {/* Diamond accent */}
        {type === "ring" && (
          <mesh position={[0, 1, 0]} castShadow>
            <octahedronGeometry args={[0.1, 2]} />
            <meshPhysicalMaterial
              color="#f0f0ff"
              metalness={0}
              roughness={0}
              transmission={0.95}
              thickness={0.3}
              ior={2.42}
              clearcoat={1}
              clearcoatRoughness={0}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

interface Props {
  type?: string;
}

export function ProductViewer({ type = "ring" }: Props) {
  return (
    <div className="w-full aspect-square bg-charcoal rounded-sm overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <spotLight
            position={[5, 8, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1.5}
            color="#C9A96E"
            castShadow
          />
          <spotLight
            position={[-3, 5, -3]}
            angle={0.4}
            penumbra={1}
            intensity={0.8}
            color="#ffffff"
          />

          <JewelryModel type={type} />

          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.5}
            scale={5}
            blur={2}
            far={3}
            color="#C9A96E"
          />

          <Environment preset="studio" environmentIntensity={0.6} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>

      {/* 360 badge */}
      <div className="absolute bottom-4 left-4 glass px-3 py-1.5 rounded-full text-xs text-white/60 flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M21 3v6h-6" />
        </svg>
        360°
      </div>
    </div>
  );
}
