"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface BangleProps {
  goldColor?: string;
  radius?: number;
  thickness?: number;
}

export function BangleBraceletModel({ goldColor = "#B89B5E", radius = 1.1, thickness = 0.06 }: BangleProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.1 + 0.3;
    groupRef.current.rotation.z = Math.cos(t * 0.18) * 0.05;
  });

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Main bangle */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[radius, thickness, 48, 128]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.03}
            reflectivity={1}
            envMapIntensity={2.8}
          />
        </mesh>

        {/* Inner surface with different finish */}
        <mesh>
          <torusGeometry args={[radius, thickness * 0.88, 32, 128]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.25}
            envMapIntensity={1.5}
          />
        </mesh>

        {/* Edge detail - top */}
        <mesh castShadow>
          <torusGeometry args={[radius, thickness * 0.3, 16, 128]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.05}
            clearcoat={1}
            envMapIntensity={3}
          />
        </mesh>

        {/* Decorative stations with gems */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <group key={i} position={[x, y, 0]} rotation={[0, 0, angle + Math.PI / 2]}>
              {/* Gold setting */}
              <mesh castShadow>
                <cylinderGeometry args={[0.035, 0.04, 0.02, 16]} />
                <meshPhysicalMaterial
                  color={goldColor}
                  metalness={1}
                  roughness={0.1}
                  clearcoat={1}
                  envMapIntensity={2.5}
                />
              </mesh>
              {/* Diamond */}
              <mesh position={[0, 0.015, 0]} castShadow>
                <octahedronGeometry args={[0.025, 1]} />
                <meshPhysicalMaterial
                  color="#f0f4ff"
                  metalness={0}
                  roughness={0}
                  transmission={0.88}
                  thickness={0.2}
                  ior={2.42}
                  clearcoat={1}
                  envMapIntensity={3}
                />
              </mesh>
            </group>
          );
        })}
      </group>
    </Float>
  );
}

interface ChainBraceletProps {
  goldColor?: string;
  length?: number;
}

export function ChainBraceletModel({ goldColor = "#B89B5E", length = 1.0 }: ChainBraceletProps) {
  const groupRef = useRef<THREE.Group>(null);

  const links = useMemo(() => {
    const items: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = length;
      items.push({
        pos: [Math.cos(angle) * r, Math.sin(angle) * r, 0],
        rot: [0, 0, angle + (i % 2 === 0 ? Math.PI / 2 : 0)],
      });
    }
    return items;
  }, [length]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.12 + 0.35;
    groupRef.current.rotation.z = Math.cos(t * 0.2) * 0.04;
  });

  return (
    <Float speed={0.9} rotationIntensity={0.12} floatIntensity={0.45}>
      <group ref={groupRef}>
        {/* Chain links */}
        {links.map((link, i) => (
          <mesh key={i} position={link.pos} rotation={link.rot} castShadow>
            <torusGeometry args={[0.025, 0.006, 12, 24]} />
            <meshPhysicalMaterial
              color={goldColor}
              metalness={1}
              roughness={0.12}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={2.5}
            />
          </mesh>
        ))}

        {/* Charm / pendant piece */}
        <group position={[0, -length, 0]}>
          {/* Heart charm */}
          <mesh castShadow>
            <sphereGeometry args={[0.06, 32, 32]} />
            <meshPhysicalMaterial
              color={goldColor}
              metalness={1}
              roughness={0.08}
              clearcoat={1}
              envMapIntensity={2.8}
            />
          </mesh>
          {/* Gem on charm */}
          <mesh position={[0, 0, 0.05]} castShadow>
            <octahedronGeometry args={[0.03, 2]} />
            <meshPhysicalMaterial
              color="#f0f4ff"
              metalness={0}
              roughness={0}
              transmission={0.9}
              thickness={0.3}
              ior={2.42}
              clearcoat={1}
              envMapIntensity={3}
            />
          </mesh>
        </group>

        {/* Lobster clasp */}
        <group position={[length, 0, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.008, 0.03, 8, 16]} />
            <meshPhysicalMaterial
              color={goldColor}
              metalness={1}
              roughness={0.15}
              clearcoat={1}
              envMapIntensity={2}
            />
          </mesh>
        </group>

        {/* Jump ring at other end */}
        <mesh position={[-length, 0, 0]} castShadow>
          <torusGeometry args={[0.015, 0.004, 8, 16]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.15}
            clearcoat={1}
            envMapIntensity={2}
          />
        </mesh>
      </group>
    </Float>
  );
}
