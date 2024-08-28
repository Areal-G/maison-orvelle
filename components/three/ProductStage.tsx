"use client";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, ContactShadows, PerspectiveCamera, PresentationControls } from "@react-three/drei";
import { easing } from "maath";
import type { Product } from "@/lib/products";
import { DisplayStand, StudioLights, TopModel } from "./Studio";

const HEIGHT = 1.15;
const FLOOR = -0.68;
const DOT = new THREE.MeshBasicMaterial({ color: "#a8875a", toneMapped: false });
const HALO = new THREE.MeshBasicMaterial({
  color: "#fffaf2",
  transparent: true,
  opacity: 0.85,
  toneMapped: false,
  depthWrite: false,
});

type Props = {
  product: Product;
  isMobile: boolean;
  colour: string | null;
  activeNote: number | null;
  onNote: (i: number | null) => void;
};

function HotspotDot({
  position,
  index,
  active,
  onSelect,
}: {
  position: THREE.Vector3;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const dot = useRef<THREE.Group>(null);
  const [hover, setHover] = useState(false);
  useFrame((state, delta) => {
    if (ring.current) {
      // A slow breathing pulse, offset per dot so they don't blink in sync.
      const t = (state.clock.elapsedTime * 0.7 + index * 0.33) % 1;
      const s = 1 + t * 1.6;
      ring.current.scale.set(s, s, s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.55;
    }
    if (dot.current) {
      const s = active ? 1.45 : hover ? 1.25 : 1;
      easing.damp3(dot.current.scale, [s, s, s], 0.15, delta);
    }
  });
  return (
    <Billboard position={position}>
      <group
        ref={dot}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
      >
        <mesh material={HALO}>
          <circleGeometry args={[0.03, 32]} />
        </mesh>
        <mesh material={DOT} position-z={0.001}>
          <circleGeometry args={[0.017, 32]} />
        </mesh>
        <mesh ref={ring} position-z={-0.001}>
          <ringGeometry args={[0.028, 0.032, 48]} />
          <meshBasicMaterial color="#a8875a" transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </Billboard>
  );
}

/** Product page: one piece on a display stand. Drag to turn it; it settles back to a slow turntable. */
export default function ProductStage({ product, isMobile, colour, activeNote, onNote }: Props) {
  const turn = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const [spots, setSpots] = useState<(THREE.Vector3 | null)[]>([]);

  // Pin each note to the cloth: cast a ray at the front of the piece and keep the first surface it hits.
  useEffect(() => {
    const g = turn.current;
    const m = model.current;
    if (!g || !m) return;
    const saved = g.rotation.y;
    g.rotation.y = 0;
    g.updateWorldMatrix(true, true);
    const ray = new THREE.Raycaster();
    const found = product.hotspots.map((h) => {
      const origin = new THREE.Vector3(h.x * HEIGHT, h.y * HEIGHT, 3).applyMatrix4(g.matrixWorld);
      const dir = new THREE.Vector3(0, 0, -1).transformDirection(g.matrixWorld);
      ray.set(origin, dir);
      const hit = ray.intersectObject(m, true)[0];
      if (!hit) return null;
      // Sit just proud of the surface so the dot never sinks into the cloth.
      return g.worldToLocal(hit.point.clone().addScaledVector(dir, -0.012));
    });
    g.rotation.y = saved;
    setSpots(found);
  }, [product]);

  const focus = activeNote !== null ? spots[activeNote] : null;

  useFrame((state, delta) => {
    const g = turn.current;
    if (g) {
      if (focus) {
        // Turn the piece so the chosen note faces the camera.
        easing.dampAngle(g.rotation, "y", -Math.atan2(focus.x, focus.z), 0.35, delta);
      } else {
        g.rotation.y += delta * 0.18;
      }
    }
    if (cam.current) {
      // Desktop frames the piece left of centre to leave room for the buy panel.
      const base: [number, number, number] = isMobile ? [0, 0.12, 3.75] : [0.55, 0.05, 2.9];
      // Leaning in a little when a note is open.
      const target: [number, number, number] = focus ? [base[0], base[1] + focus.y * 0.4, base[2] - 0.45] : base;
      easing.damp3(cam.current.position, target, focus ? 0.4 : 0.55, delta);
      cam.current.lookAt(isMobile ? 0 : 0.55, isMobile ? -0.1 : 0.05, 0);
    }
  });

  return (
    <>
      {/* starts further back and higher, then glides in to the piece */}
      <PerspectiveCamera ref={cam} makeDefault fov={30} position={isMobile ? [0, 0.5, 5.4] : [0.55, 0.4, 4.6]} />
      <color attach="background" args={[product.tint]} />
      <StudioLights intensity={1.05} />
      <PresentationControls
        global
        cursor
        snap
        speed={1.6}
        rotation={[0, 0, 0]}
        polar={[-0.25, 0.25]}
        azimuth={[-Infinity, Infinity]}
      >
        <group ref={turn}>
          <DisplayStand from={FLOOR} to={0} />
          <TopModel
            ref={model}
            slug={product.slug}
            height={HEIGHT}
            colour={colour}
            protectNeutrals={product.protectNeutrals}
          />
          {spots.map((p, i) =>
            p ? (
              <HotspotDot
                key={i}
                position={p}
                index={i}
                active={activeNote === i}
                onSelect={() => onNote(activeNote === i ? null : i)}
              />
            ) : null,
          )}
        </group>
      </PresentationControls>
      <ContactShadows position-y={FLOOR} opacity={0.32} scale={4} blur={2.6} far={1.5} color="#3d3027" />
    </>
  );
}
