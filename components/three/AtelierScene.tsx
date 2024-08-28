"use client";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { easing } from "maath";
import type { Product } from "@/lib/products";
import { DisplayStand, StudioLights, TopModel } from "./Studio";
import { marbleTexture } from "./boutique";

const RADIUS = 1.3;
const PIECE_Y = 0.96;
const GOLD = new THREE.MeshStandardMaterial({ color: "#b8955f", metalness: 1, roughness: 0.32 });
const STONE = new THREE.MeshStandardMaterial({ color: "#ece6dd", roughness: 0.45, metalness: 0 });

type Props = {
  products: Product[];
  active: number;
  hovered: number | null;
  onSelect: (i: number) => void;
  onOpen: (slug: string) => void;
  onHover: (i: number | null) => void;
  isMobile: boolean;
  /** Set while leaving for a product page: the camera glides up to the front piece. */
  leaving?: boolean;
};

/**
 * Tracks whether a mouse is moving over the page. The cursor light fades out when the mouse rests or
 * leaves, and never shows on touch screens.
 */
function useMouseActivity() {
  const live = useRef(0);
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const move = () => {
      live.current = 1;
      clearTimeout(timer);
      timer = setTimeout(() => (live.current = 0), 2600);
    };
    const leave = () => (live.current = 0);
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);
  return live;
}

function Plinth() {
  return (
    <group>
      <mesh material={STONE} position-y={0.02}>
        <cylinderGeometry args={[0.36, 0.38, 0.04, 64]} />
      </mesh>
      <mesh material={STONE} position-y={0.21}>
        <cylinderGeometry args={[0.27, 0.29, 0.34, 64]} />
      </mesh>
      <mesh material={STONE} position-y={0.4}>
        <cylinderGeometry args={[0.34, 0.32, 0.04, 64]} />
      </mesh>
      <mesh material={GOLD} position-y={0.42} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.34, 0.005, 8, 96]} />
      </mesh>
    </group>
  );
}

function Piece({
  product,
  index,
  count,
  isActive,
  isHovered,
  onClick,
  onHover,
}: {
  product: Product;
  index: number;
  count: number;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (on: boolean) => void;
}) {
  const spin = useRef<THREE.Group>(null);
  const lean = useRef<THREE.Group>(null);
  const size = useRef<THREE.Group>(null);
  const turn = useRef(0);
  const angle = (index / count) * Math.PI * 2;

  useFrame((_, delta) => {
    if (!spin.current || !lean.current || !size.current) return;
    if (isActive) {
      // Slow turntable that runs by itself; the mouse never turns the piece, it only clicks.
      turn.current += delta * 0.45;
      easing.damp(spin.current.rotation, "y", turn.current, 0.35, delta);
      easing.damp(lean.current.rotation, "x", 0, 0.35, delta);
    } else {
      const home = Math.round(spin.current.rotation.y / (Math.PI * 2)) * Math.PI * 2;
      easing.damp(spin.current.rotation, "y", home, 0.6, delta);
      turn.current = home;
      easing.damp(lean.current.rotation, "x", 0, 0.4, delta);
    }
    const s = (isActive ? 1 : 0.86) * (isHovered ? 1.05 : 1);
    easing.damp3(size.current.scale, [s, s, s], 0.3, delta);
  });

  return (
    <group position={[Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS]} rotation-y={angle}>
      <Plinth />
      {/* brass rod from the plinth up into the piece, like a boutique display stand */}
      <DisplayStand from={0.42} to={PIECE_Y} foot={false} />
      <group ref={size} position-y={PIECE_Y}>
        <group ref={lean}>
          <group
            ref={spin}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(true);
            }}
            onPointerOut={() => onHover(false)}
          >
            <TopModel slug={product.slug} height={0.92} />
          </group>
        </group>
      </group>
    </group>
  );
}

const PLASTER = new THREE.MeshStandardMaterial({ color: "#d9cdbd", roughness: 0.85, metalness: 0, fog: false });
const MOULDING = new THREE.MeshStandardMaterial({ color: "#efe7dc", roughness: 0.6, metalness: 0, fog: false });

/** One raised moulding frame on the wall: four slim bars around a rectangle. */
function Frame({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const t = 0.035;
  return (
    <group position={[x, y, 0.02]}>
      {[h / 2, -h / 2].map((dy) => (
        <mesh key={dy} material={MOULDING} position-y={dy}>
          <boxGeometry args={[w + t, t, 0.03]} />
        </mesh>
      ))}
      {[w / 2, -w / 2].map((dx) => (
        <mesh key={dx} material={MOULDING} position-x={dx}>
          <boxGeometry args={[t, h, 0.03]} />
        </mesh>
      ))}
    </group>
  );
}

/** A Parisian salon wall behind the ring: plaster, panel mouldings, pilasters, dado rail, skirting and cornice. */
function Wall() {
  const bays = [-4.2, -2.1, 0, 2.1, 4.2];
  return (
    <group position={[0, 0, -3.4]}>
      <mesh material={PLASTER} position-y={2.6}>
        <planeGeometry args={[16, 5.2]} />
      </mesh>
      {/* skirting, dado rail and cornice */}
      <mesh material={MOULDING} position={[0, 0.09, 0.03]}>
        <boxGeometry args={[16, 0.18, 0.06]} />
      </mesh>
      <mesh material={MOULDING} position={[0, 0.92, 0.025]}>
        <boxGeometry args={[16, 0.05, 0.05]} />
      </mesh>
      <mesh material={MOULDING} position={[0, 3.9, 0.05]}>
        <boxGeometry args={[16, 0.14, 0.1]} />
      </mesh>
      <mesh material={GOLD} position={[0, 3.82, 0.1]}>
        <boxGeometry args={[16, 0.012, 0.012]} />
      </mesh>
      {bays.map((x) => (
        <group key={x}>
          <Frame x={x} y={2.35} w={1.4} h={2.5} />
          <Frame x={x} y={0.52} w={1.4} h={0.5} />
        </group>
      ))}
      {/* pilasters between the bays */}
      {[-5.25, -3.15, -1.05, 1.05, 3.15, 5.25].map((x) => (
        <mesh key={x} material={MOULDING} position={[x, 2, 0.04]}>
          <boxGeometry args={[0.22, 3.8, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function Arch() {
  return (
    <group position={[0, 0, -2.4]}>
      <mesh material={GOLD} position-y={1.7}>
        <torusGeometry args={[1.05, 0.018, 16, 128, Math.PI]} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} material={GOLD} position={[x, 0.85, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 1.7, 16]} />
        </mesh>
      ))}
    </group>
  );
}

/** A warm light that follows the cursor through the room, so silk, satin and the marble catch the glow. */
function CursorLight({ mouse }: { mouse: React.RefObject<number> }) {
  const light = useRef<THREE.PointLight>(null);
  const level = useRef(0);
  useFrame((state, delta) => {
    const l = light.current;
    if (!l) return;
    level.current = THREE.MathUtils.damp(level.current, mouse.current ?? 0, 3, delta);
    easing.damp3(l.position, [state.pointer.x * 2.4, 1.15 + state.pointer.y * 0.9, 2.0], 0.18, delta);
    l.intensity = 7 * level.current;
  });
  return <pointLight ref={light} color="#ffd8a3" distance={5} decay={2} position={[0, 1.2, 2]} intensity={0} />;
}

/** The home "atelier": the pieces of a collection on a turning ring of plinths. */
export default function AtelierScene({
  products,
  active,
  hovered,
  onSelect,
  onOpen,
  onHover,
  isMobile,
  leaving = false,
}: Props) {
  const ring = useRef<THREE.Group>(null);
  const cam = useRef<THREE.PerspectiveCamera>(null);
  const look = useRef(new THREE.Vector3(0, 0.86, 0));
  const mouse = useMouseActivity();
  const count = products.length;
  const shiftX = isMobile ? 0 : 0.45;

  const floor = useMemo(() => {
    const map = marbleTexture().clone();
    map.needsUpdate = true;
    map.repeat.set(12, 12);
    return new THREE.MeshStandardMaterial({ map, roughness: 0.2, metalness: 0, envMapIntensity: 1.1 });
  }, []);

  useFrame((_, delta) => {
    if (ring.current) easing.dampAngle(ring.current.rotation, "y", -(active / count) * Math.PI * 2, 0.45, delta);
    if (!cam.current) return;
    if (leaving) {
      // Glide up to the front piece; the page fades out over the last part of the move.
      easing.damp3(cam.current.position, [shiftX, PIECE_Y + 0.06, RADIUS + (isMobile ? 2.3 : 1.5)], 0.32, delta);
      easing.damp3(look.current, [shiftX, PIECE_Y, RADIUS], 0.25, delta);
    } else {
      const z = isMobile ? 7.4 : 5.1;
      easing.damp3(cam.current.position, [0, 1.02, z], 0.6, delta);
      easing.damp3(look.current, [0, isMobile ? 1.05 : 0.86, 0], 0.3, delta);
    }
    cam.current.lookAt(look.current);
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={30} position={[0, 1.02, isMobile ? 7.4 : 5.1]} />
      <color attach="background" args={["#efe9e1"]} />
      <fog attach="fog" args={["#efe9e1", 6.5, 13]} />
      <StudioLights />
      {/* desktop: shift the whole set right so the collection title has its own space */}
      <group position-x={shiftX}>
        <Wall />
        <Arch />
        {/* polished marble floor */}
        <mesh material={floor} rotation-x={-Math.PI / 2} position-y={-0.001}>
          <circleGeometry args={[14, 96]} />
        </mesh>
        <group ref={ring}>
          {products.map((p, i) => (
            <Piece
              key={p.slug}
              product={p}
              index={i}
              count={count}
              isActive={i === active}
              isHovered={hovered === i}
              onClick={() => (i === active ? onOpen(p.slug) : onSelect(i))}
              onHover={(on) => onHover(on ? i : null)}
            />
          ))}
        </group>
        <CursorLight mouse={mouse} />
        <ContactShadows
          position-y={0.002}
          opacity={0.38}
          scale={9}
          blur={2.4}
          far={2.5}
          resolution={512}
          color="#5a4a3a"
        />
      </group>
    </>
  );
}
