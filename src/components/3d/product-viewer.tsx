"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  OrbitControls,
  Float,
} from "@react-three/drei";
import * as THREE from "three";

function ProductImage({ imageUrl }: { imageUrl: string }) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);

  const aspect = texture.image ? texture.image.width / texture.image.height : 1;
  const width = 2.8;
  const height = width / aspect;

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

interface Props {
  imageUrl?: string;
}

export function ProductViewer({ imageUrl }: Props) {
  if (!imageUrl) return null;

  return (
    <div className="w-full h-full bg-[#EFE9DF] overflow-hidden relative">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.2} />

          <spotLight
            position={[3, 5, 5]}
            angle={0.4}
            penumbra={1}
            intensity={0.8}
            color="#ffffff"
          />

          <ProductImage imageUrl={imageUrl} />

          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.3}
            scale={6}
            blur={3}
            far={4}
            color="#B89B5E"
          />

          <Environment preset="studio" environmentIntensity={0.3} />
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={2}
            maxDistance={6}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate
            autoRotateSpeed={0.5}
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
