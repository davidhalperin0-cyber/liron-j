"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

export function FloatingRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.1 + 0.3;
    ringRef.current.rotation.z = Math.cos(t * 0.2) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={ringRef} castShadow>
        <torusGeometry args={[1.2, 0.15, 64, 128]} />
        <meshPhysicalMaterial
          color="#B89B5E"
          metalness={1}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Inner diamond accent */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <octahedronGeometry args={[0.12, 2]} />
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
    </Float>
  );
}
