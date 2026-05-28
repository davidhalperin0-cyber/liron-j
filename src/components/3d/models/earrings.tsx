"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function GemStone({ position, scale = 1, color = "#f0f4ff" }: { position: [number, number, number]; scale?: number; color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.6;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} castShadow>
      <octahedronGeometry args={[0.06, 2]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0}
        roughness={0}
        transmission={0.92}
        thickness={0.4}
        ior={2.42}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={3}
        attenuationColor={new THREE.Color("#e8f0ff")}
        attenuationDistance={0.3}
      />
    </mesh>
  );
}

interface DropEarringProps {
  position: [number, number, number];
  goldColor?: string;
  gemColor?: string;
  swingPhase?: number;
}

function DropEarring({ position, goldColor = "#B89B5E", gemColor = "#f0f4ff", swingPhase = 0 }: DropEarringProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime + swingPhase;
    groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.06;
    groupRef.current.rotation.x = Math.cos(t * 0.8) * 0.03;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Hook / ear wire */}
      <mesh castShadow>
        <torusGeometry args={[0.08, 0.01, 16, 32, Math.PI * 1.2]} />
        <meshPhysicalMaterial
          color={goldColor}
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Vertical drop bar */}
      <mesh position={[0, -0.12, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
        <meshPhysicalMaterial
          color={goldColor}
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Decorative gold cap */}
      <mesh position={[0, -0.22, 0]} castShadow>
        <coneGeometry args={[0.025, 0.04, 16]} />
        <meshPhysicalMaterial
          color={goldColor}
          metalness={1}
          roughness={0.12}
          clearcoat={1}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Main gem */}
      <GemStone position={[0, -0.3, 0]} scale={1.4} color={gemColor} />

      {/* Bottom gold accent */}
      <mesh position={[0, -0.38, 0]} castShadow>
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshPhysicalMaterial
          color={goldColor}
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Small accent gems along the bar */}
      <GemStone position={[0, -0.08, 0]} scale={0.4} color={gemColor} />
      <GemStone position={[0, -0.16, 0]} scale={0.5} color={gemColor} />
    </group>
  );
}

interface HuggieEarringProps {
  position: [number, number, number];
  goldColor?: string;
  withStones?: boolean;
}

function HuggieEarring({ position, goldColor = "#B89B5E", withStones = true }: HuggieEarringProps) {
  const groupRef = useRef<THREE.Group>(null);

  const stonePositions = useMemo(() => {
    if (!withStones) return [];
    const positions: [number, number, number][] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 1.4 - Math.PI * 0.2;
      const r = 0.12;
      positions.push([
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        0.015,
      ]);
    }
    return positions;
  }, [withStones]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main hoop */}
      <mesh castShadow>
        <torusGeometry args={[0.12, 0.025, 32, 64, Math.PI * 1.6]} />
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

      {/* Hinge mechanism */}
      <mesh position={[0.1, 0.07, 0]} castShadow>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshPhysicalMaterial
          color={goldColor}
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          envMapIntensity={2}
        />
      </mesh>

      {/* Pave stones on the front */}
      {stonePositions.map((pos, i) => (
        <mesh key={i} position={pos} scale={0.3} castShadow>
          <octahedronGeometry args={[0.02, 1]} />
          <meshPhysicalMaterial
            color="#f8faff"
            metalness={0}
            roughness={0}
            transmission={0.85}
            thickness={0.15}
            ior={2.42}
            clearcoat={1}
            envMapIntensity={2.5}
          />
        </mesh>
      ))}
    </group>
  );
}

interface DropEarringsModelProps {
  goldColor?: string;
  gemColor?: string;
  spacing?: number;
}

export function DropEarringsModel({ goldColor = "#B89B5E", gemColor = "#f0f4ff", spacing = 0.8 }: DropEarringsModelProps) {
  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
      <group>
        <DropEarring position={[-spacing / 2, 0, 0]} goldColor={goldColor} gemColor={gemColor} swingPhase={0} />
        <DropEarring position={[spacing / 2, 0, 0]} goldColor={goldColor} gemColor={gemColor} swingPhase={Math.PI * 0.3} />
      </group>
    </Float>
  );
}

interface HuggieEarringsModelProps {
  goldColor?: string;
  withStones?: boolean;
  spacing?: number;
}

export function HuggieEarringsModel({ goldColor = "#B89B5E", withStones = true, spacing = 0.7 }: HuggieEarringsModelProps) {
  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.4}>
      <group>
        <HuggieEarring position={[-spacing / 2, 0, 0]} goldColor={goldColor} withStones={withStones} />
        <HuggieEarring position={[spacing / 2, 0, 0]} goldColor={goldColor} withStones={withStones} />
      </group>
    </Float>
  );
}
