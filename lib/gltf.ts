import { useGLTF } from "@react-three/drei";

// Self-hosted Draco decoder (copied from three/examples) so models load without a third-party CDN.
const DRACO_PATH = "/draco/";

export const useModel = (path: string) => useGLTF(path, DRACO_PATH);
useModel.preload = (path: string) => useGLTF.preload(path, DRACO_PATH);
