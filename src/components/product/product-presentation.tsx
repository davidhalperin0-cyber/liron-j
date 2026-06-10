"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Box, Images, Rotate3D, Sparkles } from "lucide-react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import {
  getPresentationImages,
  getProductPresentationDecision,
} from "@/lib/product-media";
import { DiamondRingModel } from "@/components/3d/models/diamond-ring";
import { DropEarringsModel } from "@/components/3d/models/earrings";
import { NecklaceModel } from "@/components/3d/models/necklace";
import { BangleBraceletModel } from "@/components/3d/models/bracelet";
import type { Product360Sprite, Product3DModelKind, ProductMedia } from "@/types";

interface ProductPresentationProps {
  media?: ProductMedia;
  fallbackImage?: string;
  productName: string;
  className?: string;
}

function ModelAsset({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const model = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.rotation.x = Math.sin(t * 0.35) * 0.04;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.08} floatIntensity={0.25}>
      <group ref={groupRef} scale={1.4}>
        <primitive object={model} />
      </group>
    </Float>
  );
}

function ProceduralModelAsset({ kind }: { kind: Product3DModelKind }) {
  switch (kind) {
    case "earrings":
      return <DropEarringsModel goldColor="#B89B5E" spacing={0.7} />;
    case "necklace":
      return <NecklaceModel goldColor="#B89B5E" chainLength={1.4} />;
    case "bracelet":
      return <BangleBraceletModel goldColor="#B89B5E" radius={1.0} />;
    case "ring":
    default:
      return <DiamondRingModel goldColor="#B89B5E" />;
  }
}

function RealModelViewer({
  url,
  kind,
}: {
  url?: string;
  kind?: Product3DModelKind;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EFE9DF]">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.65} />
          <spotLight
            position={[4, 6, 5]}
            angle={0.35}
            penumbra={1}
            intensity={1.4}
            color="#B89B5E"
          />
          <spotLight
            position={[-3, 4, 3]}
            angle={0.45}
            penumbra={1}
            intensity={0.8}
            color="#ffffff"
          />
          {url ? (
            <ModelAsset url={url} />
          ) : (
            <group position={[0, -0.1, 0]} scale={1.15}>
              <ProceduralModelAsset kind={kind ?? "ring"} />
            </group>
          )}
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.35}
            scale={6}
            blur={2.5}
            far={4}
            color="#B89B5E"
          />
          <Environment preset="studio" environmentIntensity={0.45} />
          <OrbitControls
            enablePan={false}
            minDistance={2.5}
            maxDistance={7}
            autoRotate
            autoRotateSpeed={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function ImageSequence360({ images, productName }: { images: string[]; productName: string }) {
  const [frame, setFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);
  const frameRef = useRef(0);

  const updateFrame = (clientX: number) => {
    const delta = clientX - lastX.current;
    if (Math.abs(delta) < 6) return;

    const next =
      (frameRef.current + (delta > 0 ? -1 : 1) + images.length) % images.length;
    frameRef.current = next;
    lastX.current = clientX;
    setFrame(next);
  };

  return (
    <div
      className="relative h-full w-full cursor-grab overflow-hidden bg-charcoal active:cursor-grabbing"
      onPointerDown={(event) => {
        setIsDragging(true);
        lastX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (isDragging) updateFrame(event.clientX);
      }}
      onPointerUp={(event) => {
        setIsDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => setIsDragging(false)}
    >
      <motion.div
        key={images[frame]}
        initial={{ opacity: 0.55, scale: 1.025 }}
        animate={{ opacity: 1, scale: isDragging ? 1.06 : 1 }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${images[frame]})` }}
        aria-label={`${productName} 360 frame ${frame + 1}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,110,0.18),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
      <motion.div
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-screen"
        animate={{ x: isDragging ? ["-45%", "260%"] : ["-35%", "220%"] }}
        transition={{ duration: isDragging ? 0.9 : 3.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-4 right-4 glass px-3 py-1.5 text-xs text-white/60">
        גררו לסיבוב · {frame + 1}/{images.length}
      </div>
    </div>
  );
}

function Sprite360Viewer({
  sprite,
  productName,
}: {
  sprite: Product360Sprite;
  productName: string;
}) {
  const firstFrame = sprite.startFrame ?? 0;
  const [displayPosition, setDisplayPosition] = useState(firstFrame);
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 28 });
  const lastX = useRef(0);
  const targetPosition = useRef(firstFrame);
  const displayPositionRef = useRef(firstFrame);
  const velocity = useRef(0);
  const frameCount = Math.max(1, sprite.frames);
  const frameZoom = sprite.frameZoom ?? 1;
  const frameOffsetX = sprite.frameOffsetX ?? 0;
  const frameOffsetY = sprite.frameOffsetY ?? 0;
  const normalizedPosition =
    ((displayPosition % frameCount) + frameCount) % frameCount;
  const currentFrame = Math.round(normalizedPosition) % frameCount;

  useEffect(() => {
    let frameId = 0;

    const animate = () => {
      if (!isDragging) {
        targetPosition.current += velocity.current;
        velocity.current *= 0.92;

        if (Math.abs(velocity.current) < 0.002) {
          velocity.current = 0;
        }
      }

      displayPositionRef.current +=
        (targetPosition.current - displayPositionRef.current) * 0.32;
      setDisplayPosition(displayPositionRef.current);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isDragging]);

  const updateFrame = (clientX: number) => {
    const delta = clientX - lastX.current;
    const frameDelta = delta / -34;
    targetPosition.current += frameDelta;
    velocity.current = frameDelta * 0.22;
    lastX.current = clientX;
  };

  const moveTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setTilt({
      x: (y - 50) * -0.035,
      y: (x - 50) * 0.045,
      shineX: x,
      shineY: y,
    });
  };

  return (
    <div
      className="relative h-full w-full cursor-grab overflow-hidden bg-[#EFE9DF] active:cursor-grabbing"
      onPointerDown={(event) => {
        setIsDragging(true);
        lastX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        moveTilt(event);
        if (isDragging) updateFrame(event.clientX);
      }}
      onPointerUp={(event) => {
        setIsDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => setIsDragging(false)}
      onPointerLeave={() => {
        setTilt({ x: 0, y: 0, shineX: 50, shineY: 28 });
        setIsDragging(false);
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(201,169,110,0.22),transparent_28%),radial-gradient(circle_at_50%_72%,rgba(0,0,0,0.88),transparent_38%)]" />
      <motion.div
        className="absolute inset-0"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isDragging ? 1.12 : 1.07,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <SpriteFrameLayer
          sprite={sprite}
          frame={currentFrame}
          opacity={1}
          frameZoom={frameZoom}
          frameOffsetX={frameOffsetX}
          frameOffsetY={frameOffsetY}
          productName={productName}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        animate={{
          background: `radial-gradient(460px circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.32), rgba(201,169,110,0.14) 24%, transparent 58%)`,
        }}
        transition={{ duration: 0.16 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-screen"
        animate={{ x: isDragging ? ["0%", "285%"] : ["0%", "235%"] }}
        transition={{ duration: isDragging ? 0.75 : 3.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-x-[18%] bottom-[12%] h-10 rounded-full bg-black/55 blur-2xl" />
      <div className="absolute bottom-4 right-4 glass px-3 py-1.5 text-xs text-white/70">
        גררו לסיבוב פרימיום · {currentFrame + 1}/{frameCount}
      </div>
    </div>
  );
}

function SpriteFrameLayer({
  sprite,
  frame,
  opacity,
  frameZoom,
  frameOffsetX,
  frameOffsetY,
  productName,
}: {
  sprite: Product360Sprite;
  frame: number;
  opacity: number;
  frameZoom: number;
  frameOffsetX: number;
  frameOffsetY: number;
  productName: string;
}) {
  const column = frame % sprite.columns;
  const row = Math.floor(frame / sprite.columns);
  const backgroundSize = `${sprite.columns * 100}% ${sprite.rows * 100}%`;
  const backgroundPositionX =
    sprite.columns === 1 ? "0%" : `${(column / (sprite.columns - 1)) * 100}%`;
  const backgroundPositionY =
    sprite.rows === 1 ? "0%" : `${(row / (sprite.rows - 1)) * 100}%`;

  return (
    <div
      className="absolute inset-0 bg-no-repeat"
      style={{
        opacity,
        backgroundImage: `url(${sprite.url})`,
        backgroundSize,
        backgroundPosition: `${backgroundPositionX} ${backgroundPositionY}`,
        transform: `scale(${frameZoom}) translate(${frameOffsetX}%, ${frameOffsetY}%)`,
        willChange: "background-position, transform",
      }}
      aria-label={`${productName} 360 contact sheet frame ${frame + 1}`}
    />
  );
}

function GeneratedLuxuryPreview({ productName }: { productName: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#EFE9DF]">
      <motion.div
        className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/30"
        animate={{ rotate: 360, scale: [1, 1.08, 1] }}
        transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-xl"
        animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.25, 1] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(201,169,110,0.28),transparent_30%),linear-gradient(180deg,transparent,rgba(0,0,0,0.65))]" />
      <div className="absolute bottom-6 right-6 left-6 text-center">
        <p className="font-display text-2xl text-gradient-gold">{productName}</p>
        <p className="mt-2 text-xs text-white/35">Interactive atelier preview</p>
      </div>
    </div>
  );
}

function EnhancedImageViewer({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 35 });
  const startX = useRef(0);

  const moveTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setTilt({
      x: (y - 50) * -0.08,
      y: (x - 50) * 0.1,
      shineX: x,
      shineY: y,
    });
  };

  const maybeChangeImage = (clientX: number) => {
    if (images.length < 2) return;
    const delta = clientX - startX.current;
    if (Math.abs(delta) < 48) return;
    setActiveImage((current) =>
      (current + (delta < 0 ? 1 : -1) + images.length) % images.length
    );
    startX.current = clientX;
  };

  if (!images.length) {
    return <GeneratedLuxuryPreview productName={productName} />;
  }

  return (
    <div
      className="relative h-full w-full cursor-grab overflow-hidden bg-charcoal active:cursor-grabbing"
      onPointerDown={(event) => {
        setIsDragging(true);
        startX.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        moveTilt(event);
        if (isDragging) maybeChangeImage(event.clientX);
      }}
      onPointerLeave={() => {
        setTilt({ x: 0, y: 0, shineX: 50, shineY: 35 });
        setIsDragging(false);
      }}
      onPointerUp={(event) => {
        setIsDragging(false);
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => setIsDragging(false)}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isDragging ? 1.075 : 1.035,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          key={images[activeImage]}
          initial={{ opacity: 0, scale: 1.08, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images[activeImage]})` }}
          aria-label={`${productName} enhanced interactive image`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        animate={{
          background: `radial-gradient(420px circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.25), rgba(201,169,110,0.12) 24%, transparent 52%)`,
        }}
        transition={{ duration: 0.18 }}
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-gradient-to-r from-transparent via-gold/25 to-transparent mix-blend-screen"
        animate={{ x: isDragging ? ["0%", "280%"] : ["0%", "230%"] }}
        transition={{ duration: isDragging ? 0.85 : 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-1.5">
          {images.map((image, index) => (
            <button
              key={image}
              onClick={() => setActiveImage(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeImage === index ? "w-8 bg-gold" : "w-3 bg-white/25"
              )}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-4 right-4 glass px-3 py-1.5 text-xs text-white/60">
        הטו / גררו / התקרבו
      </div>
    </div>
  );
}

export function ProductPresentation({
  media,
  fallbackImage,
  productName,
  className,
}: ProductPresentationProps) {
  const decision = getProductPresentationDecision(media);
  const images = getPresentationImages(media, fallbackImage);
  const sequenceImages = media?.sequence360 ?? [];

  return (
    <div className={cn("relative aspect-square overflow-hidden bg-black", className)}>
      {decision.mode === "real-3d" ? (
        <RealModelViewer url={media?.model3dUrl} kind={media?.model3dKind} />
      ) : decision.mode === "image-360" && media?.sprite360 ? (
        <Sprite360Viewer sprite={media.sprite360} productName={productName} />
      ) : decision.mode === "image-360" ? (
        <ImageSequence360 images={sequenceImages} productName={productName} />
      ) : (
        <EnhancedImageViewer images={images} productName={productName} />
      )}

      <div className="absolute top-4 right-4 glass flex items-center gap-2 px-3 py-1.5 text-[10px] uppercase tracking-widest text-gold">
        {decision.mode === "real-3d" && <Box size={14} />}
        {decision.mode === "image-360" && <Rotate3D size={14} />}
        {decision.mode === "enhanced-image" && <Sparkles size={14} />}
        {decision.label}
      </div>

      <div className="absolute top-4 left-4 glass flex items-center gap-2 px-3 py-1.5 text-[10px] text-white/50">
        <Images size={14} />
        Premium interactive
      </div>
    </div>
  );
}
