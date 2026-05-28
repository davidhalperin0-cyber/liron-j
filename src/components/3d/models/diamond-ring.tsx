"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// ─── Realistic Brilliant-Cut Diamond Geometry ────────────────
// Models the classic round brilliant cut: table, crown facets, girdle, pavilion
function createBrilliantCutGeometry(radius = 0.1, crownHeight = 0.035, pavilionDepth = 0.06, tableRatio = 0.53) {
  const vertices: number[] = [];
  const indices: number[] = [];

  const tableRadius = radius * tableRatio;
  const facetCount = 16; // 16 main facets around

  // Key heights
  const tableY = crownHeight;
  const girdleY = 0;
  const culletY = -pavilionDepth;

  // Generate points
  const pts: THREE.Vector3[] = [];

  // 0: Table center
  pts.push(new THREE.Vector3(0, tableY, 0));

  // 1-16: Table edge points
  for (let i = 0; i < facetCount; i++) {
    const angle = (i / facetCount) * Math.PI * 2;
    pts.push(new THREE.Vector3(
      Math.cos(angle) * tableRadius,
      tableY,
      Math.sin(angle) * tableRadius
    ));
  }

  // 17-32: Crown/girdle edge (star facets midpoints, slightly higher)
  for (let i = 0; i < facetCount; i++) {
    const angle = ((i + 0.5) / facetCount) * Math.PI * 2;
    const crownRadius = radius * 0.82;
    pts.push(new THREE.Vector3(
      Math.cos(angle) * crownRadius,
      crownHeight * 0.4,
      Math.sin(angle) * crownRadius
    ));
  }

  // 33-48: Girdle points
  for (let i = 0; i < facetCount; i++) {
    const angle = (i / facetCount) * Math.PI * 2;
    pts.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      girdleY,
      Math.sin(angle) * radius
    ));
  }

  // 49: Culet (bottom point)
  pts.push(new THREE.Vector3(0, culletY, 0));

  // Convert to flat array
  for (const p of pts) {
    vertices.push(p.x, p.y, p.z);
  }

  const tableStart = 1;
  const crownStart = 17;
  const girdleStart = 33;
  const culet = 49;

  // Table facets (flat top)
  for (let i = 0; i < facetCount; i++) {
    const next = (i + 1) % facetCount;
    indices.push(0, tableStart + i, tableStart + next);
  }

  // Crown facets (table edge → crown mid → next table edge)
  for (let i = 0; i < facetCount; i++) {
    const next = (i + 1) % facetCount;
    // Upper crown triangle
    indices.push(tableStart + i, crownStart + i, tableStart + next);
    // Lower crown triangle
    indices.push(crownStart + i, girdleStart + next, tableStart + next);
    // Crown side
    indices.push(crownStart + i, girdleStart + i, girdleStart + next);
  }

  // Pavilion facets (girdle → culet)
  for (let i = 0; i < facetCount; i++) {
    const next = (i + 1) % facetCount;
    indices.push(girdleStart + i, culet, girdleStart + next);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

function DiamondGem({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => createBrilliantCutGeometry(0.08 * scale), [scale]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} castShadow>
      <meshPhysicalMaterial
        // Real diamond appearance
        color="#ffffff"
        metalness={0}
        roughness={0}
        // High transmission for see-through clarity
        transmission={0.95}
        thickness={0.5}
        // Diamond IOR = 2.42 (highest natural gemstone)
        ior={2.42}
        // Clearcoat for surface luster
        clearcoat={1}
        clearcoatRoughness={0}
        // Strong environment reflections
        envMapIntensity={4}
        // Subtle warm attenuation (simulates fire)
        attenuationColor={new THREE.Color("#fffaf0")}
        attenuationDistance={0.15}
        // Specular properties
        specularIntensity={1}
        specularColor={new THREE.Color("#ffffff")}
        // Sheen for extra surface sparkle
        sheen={0.3}
        sheenRoughness={0.1}
        sheenColor={new THREE.Color("#f0e8ff")}
      />
    </mesh>
  );
}

function SmallDiamond({ position, scale = 0.3 }: { position: [number, number, number]; scale?: number }) {
  const geometry = useMemo(() => createBrilliantCutGeometry(0.06 * scale), [scale]);

  return (
    <mesh position={position} geometry={geometry} castShadow>
      <meshPhysicalMaterial
        color="#ffffff"
        metalness={0}
        roughness={0}
        transmission={0.9}
        thickness={0.3}
        ior={2.42}
        clearcoat={1}
        clearcoatRoughness={0}
        envMapIntensity={3.5}
        attenuationColor={new THREE.Color("#fffaf0")}
        attenuationDistance={0.2}
        specularIntensity={1}
      />
    </mesh>
  );
}

interface Props {
  goldColor?: string;
  bandWidth?: number;
  withPave?: boolean;
}

export function DiamondRingModel({ goldColor = "#B89B5E", bandWidth = 0.13, withPave = true }: Props) {
  const ringRef = useRef<THREE.Group>(null);

  const pavePositions = useMemo(() => {
    if (!withPave) return [];
    const positions: [number, number, number][] = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.0;
      if (Math.abs(angle - Math.PI) < Math.PI * 0.6) {
        positions.push([
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          0,
        ]);
      }
    }
    return positions;
  }, [withPave]);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.elapsedTime;
    ringRef.current.rotation.x = Math.sin(t * 0.12) * 0.04 + 0.15;
    ringRef.current.rotation.z = Math.cos(t * 0.08) * 0.02;
    ringRef.current.position.y = Math.sin(t * 0.15) * 0.03;
  });

  return (
    <Float speed={0.4} rotationIntensity={0.05} floatIntensity={0.15}>
      <group ref={ringRef}>
        {/* Main band — polished 18K gold */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[1.0, bandWidth, 64, 128]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.03}
            reflectivity={1}
            envMapIntensity={3}
          />
        </mesh>

        {/* Prong setting base */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 0.2, 24]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.03}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* 6-prong setting (Tiffany-style) */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * 0.065;
          const z = Math.sin(angle) * 0.065;
          return (
            <mesh
              key={i}
              position={[x, 1.13, z]}
              rotation={[Math.cos(angle) * 0.25, 0, Math.sin(angle) * 0.25]}
              castShadow
            >
              <cylinderGeometry args={[0.005, 0.01, 0.17, 8]} />
              <meshPhysicalMaterial
                color={goldColor}
                metalness={1}
                roughness={0.1}
                clearcoat={1}
                envMapIntensity={2.5}
              />
            </mesh>
          );
        })}

        {/* Main diamond — brilliant cut, raised higher */}
        <DiamondGem position={[0, 1.19, 0]} scale={1.8} />

        {/* Pavé diamonds around band */}
        {pavePositions.map((pos, i) => (
          <SmallDiamond key={i} position={pos} scale={0.4} />
        ))}

        {/* Inner band — slightly satin finish */}
        <mesh>
          <torusGeometry args={[1.0, bandWidth * 0.85, 32, 128]} />
          <meshPhysicalMaterial
            color={goldColor}
            metalness={1}
            roughness={0.3}
            envMapIntensity={1.2}
          />
        </mesh>
      </group>
    </Float>
  );
}
