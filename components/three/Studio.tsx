"use client";
import * as THREE from "three";
import { useLayoutEffect, useMemo } from "react";
import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { easing } from "maath";
import { useModel } from "@/lib/gltf";
import { modelPath } from "@/lib/products";

/* One soft studio environment map per renderer, shared by every <View>. Built locally, no HDR download. */
const envCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();
export function getStudioEnv(gl: THREE.WebGLRenderer) {
  let tex = envCache.get(gl);
  if (!tex) {
    const pmrem = new THREE.PMREMGenerator(gl);
    tex = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
    pmrem.dispose();
    envCache.set(gl, tex);
  }
  return tex;
}

/** Lights the current view like a photo studio: shared env map plus a warm key light for shape. */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.environment = getStudioEnv(gl);
    scene.environmentIntensity = 0.85 * intensity;
    return () => {
      scene.environment = null;
    };
  }, [gl, scene, intensity]);
  return (
    <>
      <directionalLight position={[2.5, 4, 3]} intensity={1.1 * intensity} color="#fff4e6" />
      <directionalLight position={[-3, 2, -2]} intensity={0.45 * intensity} color="#e6eeff" />
    </>
  );
}

/* ---------- Recolouring ----------
 * The piece keeps its real fabric texture: each pixel's brightness is kept and only its hue is swapped
 * for the chosen colour. Brightness is normalised by the cloth's average, so the new colour reads true.
 * With protectNeutrals, grey/silver pixels (buckles, eyelets, lace) keep their original colour.
 */
type RecolorUniforms = {
  uTint: { value: THREE.Color };
  uAmount: { value: number };
  uBase: { value: number };
  uProtect: { value: number };
};

const LUMA = new THREE.Vector3(0.2126, 0.7152, 0.0722);
const lumaCache = new WeakMap<object, number>();
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Average linear brightness of a texture, measured from a tiny downsample. Weighted to coloured pixels when protecting neutrals. */
function textureLuma(tex: THREE.Texture, protect: boolean) {
  const key = tex.image as object | undefined;
  if (!key) return 0.5;
  const cacheKey = protect ? (tex as object) : key;
  const hit = lumaCache.get(cacheKey);
  if (hit !== undefined) return hit;
  let result = 0.5;
  try {
    const n = 24;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = n;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      ctx.drawImage(tex.image as CanvasImageSource, 0, 0, n, n);
      const px = ctx.getImageData(0, 0, n, n).data;
      let sum = 0;
      let weight = 0;
      for (let i = 0; i < px.length; i += 4) {
        const r = Math.pow(px[i] / 255, 2.2);
        const g = Math.pow(px[i + 1] / 255, 2.2);
        const b = Math.pow(px[i + 2] / 255, 2.2);
        const hi = Math.max(r, g, b);
        const sat = (hi - Math.min(r, g, b)) / Math.max(hi, 1e-4);
        const w = (protect ? smoothstep(0.12, 0.3, sat) : 1) * (px[i + 3] / 255);
        sum += (r * LUMA.x + g * LUMA.y + b * LUMA.z) * w;
        weight += w;
      }
      if (weight > 0.5) result = sum / weight;
    }
  } catch {
    /* cross-origin or unreadable image: fall back to mid grey */
  }
  lumaCache.set(cacheKey, Math.max(result, 0.004));
  return lumaCache.get(cacheKey)!;
}

function makeRecolorable(mat: THREE.MeshStandardMaterial, protect: boolean): RecolorUniforms {
  const colorLuma = mat.color.r * LUMA.x + mat.color.g * LUMA.y + mat.color.b * LUMA.z;
  const base = Math.max(colorLuma * (mat.map ? textureLuma(mat.map, protect) : 1), 0.004);
  const uniforms: RecolorUniforms = {
    uTint: { value: new THREE.Color("#ffffff") },
    uAmount: { value: 0 },
    uBase: { value: base },
    uProtect: { value: protect ? 1 : 0 },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec3 uTint;\nuniform float uAmount;\nuniform float uBase;\nuniform float uProtect;",
      )
      .replace(
        "#include <map_fragment>",
        `#include <map_fragment>
        {
          vec3 src = diffuseColor.rgb;
          float l = dot(src, vec3(0.2126, 0.7152, 0.0722));
          float hi = max(src.r, max(src.g, src.b));
          float sat = (hi - min(src.r, min(src.g, src.b))) / max(hi, 1e-4);
          // relative (HSV) saturation: dark navy cloth still counts as coloured, silver hardware does not
          float mask = mix(1.0, smoothstep(0.12, 0.3, sat), uProtect);
          vec3 dyed = uTint * clamp(l / uBase, 0.0, 2.2);
          diffuseColor.rgb = mix(src, dyed, uAmount * mask);
        }`,
      );
  };
  mat.customProgramCacheKey = () => "orvelle-recolor";
  return uniforms;
}

type TopModelProps = {
  slug: string;
  height?: number;
  /** Hex colour to dye the cloth, or null for the piece as photographed. */
  colour?: string | null;
  protectNeutrals?: boolean;
} & Omit<ThreeElements["group"], "children">;

/** A garment from /models/tops, centred on the origin and scaled to `height` world units. */
export function TopModel({ slug, height = 1, colour = null, protectNeutrals = false, ...props }: TopModelProps) {
  const { scene } = useModel(modelPath(slug));
  const { object, scale, offset, dyes } = useMemo(() => {
    const object = scene.clone(true);
    const dyes: RecolorUniforms[] = [];
    object.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const own = (m: THREE.Material) => {
        // Each instance gets its own materials so one view can be recoloured without touching the others.
        const c = m.clone() as THREE.MeshStandardMaterial;
        // Garments are single-layer cloth: render both faces so necklines and hems never look hollow.
        c.side = THREE.DoubleSide;
        if (c.isMeshStandardMaterial) {
          if (c.roughness < 0.2) c.roughness = 0.2;
          // Solid metal parts (studs, buckles) keep their finish. With a metalness map the factor is only
          // a multiplier (glTF defaults it to 1), so those materials are cloth and get dyed.
          const solidMetal = c.metalness >= 0.9 && !c.metalnessMap;
          if (!solidMetal) dyes.push(makeRecolorable(c, protectNeutrals));
        }
        return c;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(own) : own(mesh.material);
    });
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // Fit to `height`, but keep wide pieces (cropped jackets with arms out) within 1.4 × that width.
    return { object, scale: height / Math.max(size.y, size.x / 1.4), offset: center.negate(), dyes };
  }, [scene, height, protectNeutrals]);

  const target = useMemo(() => (colour ? new THREE.Color(colour) : null), [colour]);
  useLayoutEffect(() => {
    // First paint of a fresh instance shows the chosen colour straight away, no fade from the original.
    if (!target) return;
    dyes.forEach((d) => {
      if (d.uAmount.value === 0) {
        d.uTint.value.copy(target);
        d.uAmount.value = 1;
      }
    });
    // only on mount / model change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dyes]);

  useFrame((_, delta) => {
    for (const d of dyes) {
      if (target) easing.dampC(d.uTint.value, target, 0.18, delta);
      easing.damp(d.uAmount, "value", target ? 1 : 0, 0.18, delta);
    }
  });

  return (
    <group {...props}>
      <group scale={scale}>
        <primitive object={object} position={offset} />
      </group>
    </group>
  );
}

TopModel.preload = (slug: string) => useModel.preload(modelPath(slug));

/* ---------- Display stand ---------- */
export const BRASS = new THREE.MeshStandardMaterial({ color: "#b8955f", metalness: 1, roughness: 0.3 });
const MARBLE = new THREE.MeshStandardMaterial({ color: "#efe9e1", roughness: 0.22, metalness: 0 });

/**
 * A boutique display stand: weighted marble foot, brass collar and a slim brass rod that runs up
 * inside the garment. `from` is the floor height, `to` where the rod ends (inside the piece).
 */
export function DisplayStand({ from, to, foot = true }: { from: number; to: number; foot?: boolean }) {
  const length = Math.max(0.01, to - from);
  return (
    <group position-y={from}>
      {foot && (
        <>
          <mesh material={MARBLE} position-y={0.018} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.215, 0.036, 64]} />
          </mesh>
          <mesh material={BRASS} position-y={0.037} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.2, 0.004, 8, 96]} />
          </mesh>
        </>
      )}
      <mesh material={BRASS} position-y={(foot ? 0.036 : 0) + 0.02}>
        <cylinderGeometry args={[0.03, 0.04, 0.04, 32]} />
      </mesh>
      <mesh material={BRASS} position-y={length / 2}>
        <cylinderGeometry args={[0.009, 0.009, length, 16]} />
      </mesh>
    </group>
  );
}
