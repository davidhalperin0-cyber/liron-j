"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function ChainLink({ position, rotation, goldColor }: {
  position: [number, number, number];
  rotation: [number, number, number];
  goldColor: string;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <torusGeometry args={[0.018, 0.004, 12, 24]} />
      <meshPhysicalMaterial
        color={goldColor}
        metalness={1}
        roughness={0.15}
        clearcoat={1}
        envMapIntensity={2}
      />
    </mesh>
  );
}

function PendantGem({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <octahedronGeometry args={[0.1, 2]} />
      <meshPhysicalMaterial
        color="#f0f4ff"
        metalness={0}
        roughness={0}
        transmission={0.92}
        thickness={0.5}
        ior={2.42}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={3.5}
        attenuationColor={new THREE.Color("#e0e8ff")}
        attenuationDistance={0.4}
      />
    </mesh>
  );
}

interface Props {
  goldColor?: string;
  chainLength?: number;
  pendantStyle?: "diamond" | "teardrop" | "star";
}

export function NecklaceModel({ goldColor = "#B89B5E", chainLength = 1.6, pendantStyle = "diamond" }: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const chainPositions = useMemo(() => {
    const positions: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const segmentCount = 40;
    for (let i = 0; i < segmentCount; i++) {
      const t = (i / segmentCount) * Math.PI;
      const x = Math.cos(t) * chainLength;
      const y = -Math.sin(t) * chainLength * 0.5;
      const tangentAngle = Math.atan2(
        -Math.cos(t) * chainLength * 0.5,
        -Math.sin(t) * chainLength
      );
      positions.push({
        pos: [x, y, 0],
        rot: [0, 0, tangentAngle + (i % 2 === 0 ? Math.PI / 2 : 0)],
      });
    }
    return positions;
  }, [chainLength]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.05 + 0.1;
    groupRef.current.rotation.z = Math.cos(t * 0.2) * 0.03;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.12} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Chain */}
        {chainPositions.map((link, i) => (
          <ChainLink key={i} position={link.pos} rotation={link.rot} goldColor={goldColor} />
        ))}

        {/* Bail (connects pendant to chain) */}
        <mesh position={[0, -chainLength * 0.5 - 0.02, 0]} castShadow>
          <torusGeometry args={[0.025, 0.006, 12, 24, Math.PI]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.1}
            clearcoat={1}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* Pendant setting */}
        <group position={[0, -chainLength * 0.5 - 0.06, 0]}>
          {/* Gold bezel */}
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.03, 24]} />
            <meshPhysicalMaterial
              color={goldColor}
              metalness={1}
              roughness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={2.5}
            />
          </mesh>

          {/* Prongs */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i / 6) * Math.PI * 2;
            const px = Math.cos(angle) * 0.075;
            const pz = Math.sin(angle) * 0.075;
            return (
              <mesh
                key={i}
                position={[px, 0.02, pz]}
                rotation={[Math.cos(angle) * 0.4, 0, Math.sin(angle) * 0.4]}
                castShadow
              >
                <cylinderGeometry args={[0.004, 0.007, 0.06, 6]} />
                <meshPhysicalMaterial
                  color={goldColor}
                  metalness={1}
                  roughness={0.12}
                  clearcoat={1}
                  envMapIntensity={2}
                />
              </mesh>
            );
          })}

          {/* Main pendant gem */}
          {pendantStyle === "diamond" && (
            <PendantGem position={[0, 0.04, 0]} scale={1.2} />
          )}

          {pendantStyle === "teardrop" && (
            <mesh position={[0, -0.02, 0]} castShadow>
              <sphereGeometry args={[0.08, 32, 32]} />
              <meshPhysicalMaterial
                color="#f0e8ff"
                metalness={0}
                roughness={0}
                transmission={0.88}
                thickness={0.5}
                ior={2.2}
                clearcoat={1}
                envMapIntensity={3}
                attenuationColor={new THREE.Color("#e8d8ff")}
                attenuationDistance={0.3}
              />
            </mesh>
          )}

          {pendantStyle === "star" && (
            <group>
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                return (
                  <mesh
                    key={i}
                    position={[Math.cos(angle) * 0.06, Math.sin(angle) * 0.06 + 0.02, 0]}
                    castShadow
                  >
                    <octahedronGeometry args={[0.025, 1]} />
                    <meshPhysicalMaterial
                      color="#f8faff"
                      metalness={0}
                      roughness={0}
                      transmission={0.85}
                      thickness={0.2}
                      ior={2.42}
                      clearcoat={1}
                      envMapIntensity={2.5}
                    />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Small accent stones around bezel */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={`accent-${i}`}
                position={[Math.cos(angle) * 0.09, 0.005, Math.sin(angle) * 0.09]}
                scale={0.25}
                castShadow
              >
                <octahedronGeometry args={[0.02, 1]} />
                <meshPhysicalMaterial
                  color="#f8faff"
                  metalness={0}
                  roughness={0}
                  transmission={0.8}
                  thickness={0.15}
                  ior={2.42}
                  clearcoat={1}
                  envMapIntensity={2}
                />
              </mesh>
            );
          })}
        </group>

        {/* Clasp */}
        <group position={[0, 0, 0]}>
          <mesh position={[chainLength + 0.02, 0, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.03, 8]} />
            <meshPhysicalMaterial
              color={goldColor}
              metalness={1}
              roughness={0.15}
              clearcoat={1}
              envMapIntensity={2}
            />
          </mesh>
          <mesh position={[-chainLength - 0.02, 0, 0]} castShadow>
            <torusGeometry args={[0.012, 0.004, 8, 16]} />
            <meshPhysicalMaterial
              color={goldColor}
              metalness={1}
              roughness={0.15}
              clearcoat={1}
              envMapIntensity={2}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}
