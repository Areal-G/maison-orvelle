"use client";
import { Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import * as THREE from "three";
import { patchThreeLoadingManager } from "@/lib/patchThreeLoadingManager";
import AssetsPreload from "./AssetsPreload";
import { SuspenseSignal } from "@/lib/loading";
patchThreeLoadingManager();

/**
 * <View>s turn off autoClear and only paint inside their own rectangles, so anything they
 * drew last frame stays on screen where no view covers it any more (e.g. after scrolling).
 * Wipe the whole canvas before the views render each frame.
 */
function ClearEachFrame() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear(true, true, true);
  }, -1);
  return null;
}

/** One fixed WebGL canvas for the whole site; pages mount <View>s that render into it. */
const ViewCanvas = () => {
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setEventSource(document.body);
  }, []);
  return (
    <Canvas
      style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}
      eventSource={eventSource ?? undefined}
      eventPrefix="client"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      aria-hidden="true"
    >
      <ClearEachFrame />
      <AssetsPreload />
      <Suspense fallback={<SuspenseSignal />}>
        <View.Port />
      </Suspense>
    </Canvas>
  );
};

export default ViewCanvas;
