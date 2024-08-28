"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { easing } from "maath";
import type { Product } from "@/lib/products";
import { DisplayStand, StudioLights, TopModel } from "./Studio";

/** Small turntable for shop cards; spins faster and leans in on hover. */
export default function CardStage({ product, hovered }: { product: Product; hovered: boolean }) {
  const turn = useRef<THREE.Group>(null);
  const speed = useRef(0.25);
  useFrame((_, delta) => {
    if (!turn.current) return;
    speed.current = THREE.MathUtils.damp(speed.current, hovered ? 1.1 : 0.25, 4, delta);
    turn.current.rotation.y += delta * speed.current;
    const s = hovered ? 1.06 : 1;
    easing.damp3(turn.current.scale, [s, s, s], 0.25, delta);
  });
  return (
    <>
      <PerspectiveCamera makeDefault fov={28} position={[0, 0.02, 3.15]} />
      <color attach="background" args={[product.tint]} />
      <StudioLights />
      <group ref={turn}>
        <DisplayStand from={-0.62} to={0} />
        <TopModel slug={product.slug} height={1.05} />
      </group>
      <ContactShadows position-y={-0.62} opacity={0.3} scale={3} blur={2.4} far={1.2} color="#3d3027" />
    </>
  );
}
