"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { GoldParticles } from "./gold-particles";
import { DiamondRingModel } from "./models/diamond-ring";

function SceneContent() {
  return (
    <>
      {/* Restrained lighting — designed for diamond brilliance */}
      <ambientLight intensity={0.1} />

      {/* Key light — warm white from top-right, makes diamond sparkle */}
      <spotLight
        position={[3, 7, 5]}
        angle={0.2}
        penumbra={0.8}
        intensity={2.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Secondary — cooler, creates contrast on diamond facets */}
      <spotLight
        position={[-4, 5, 3]}
        angle={0.3}
        penumbra={1}
        intensity={1.2}
        color="#f0f0ff"
      />

      {/* Fill — subtle ambient from below for gold reflection */}
      <spotLight
        position={[0, -3, 4]}
        angle={0.6}
        penumbra={1}
        intensity={0.4}
        color="#B89B5E"
      />

      {/* Rim light — subtle back separation */}
      <pointLight position={[2, 0, -6]} intensity={0.3} color="#e0d8c8" />

      {/* Hero: Single diamond ring — centered, commanding */}
      <group position={[0, -0.3, 0]} scale={1.2}>
        <DiamondRingModel goldColor="#B89B5E" />
      </group>

      {/* Minimal dust particles — atmosphere, not decoration */}
      <GoldParticles count={40} />

      {/* Ground reflection */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.3}
        scale={8}
        blur={3}
        far={4}
        color="#B89B5E"
      />

      <Environment preset="city" environmentIntensity={0.6} />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 40 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
