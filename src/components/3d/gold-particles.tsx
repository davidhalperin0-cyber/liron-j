"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function GoldParticles({ count = 40 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (seededRandom(i + 1) - 0.5) * 20;
      positions[i * 3 + 1] = (seededRandom(i + 101) - 0.5) * 20;
      positions[i * 3 + 2] = (seededRandom(i + 201) - 0.5) * 10;
      sizes[i] = seededRandom(i + 301) * 2 + 0.3;
      speeds[i] = seededRandom(i + 401) * 0.15 + 0.03;
    }

    return { positions, sizes, speeds };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] += particles.speeds[i] * 0.004;
      positions[i * 3] += Math.sin(time * 0.3 + i) * 0.0008;

      if (positions[i * 3 + 1] > 10) {
        positions[i * 3 + 1] = -10;
      }
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = time * 0.005;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particles.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#B89B5E"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
