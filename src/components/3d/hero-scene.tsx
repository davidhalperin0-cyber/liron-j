"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import { GoldParticles } from "./gold-particles";
import { FloatingRing } from "./floating-ring";

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 10, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1.5}
        color="#C9A96E"
        castShadow
      />
      <spotLight
        position={[-5, 8, -5]}
        angle={0.4}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#C9A96E" />

      <FloatingRing />
      <GoldParticles count={150} />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
        color="#C9A96E"
      />

      <Environment preset="studio" environmentIntensity={0.5} />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
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
