"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

interface Profile3DProps {
  modelPath: string;
}

export default function Profile3D({ modelPath }: Profile3DProps) {
  const { scene } = useGLTF(modelPath);

  return (
    <Canvas
      camera={{ position: [0, 0.6, 1.5], fov: 35 }}
      className="rounded-full"
    >
      {/* stronger ambient + a hemisphere for nicer fill */}
      <ambientLight intensity={1.6} />
  <hemisphereLight args={[0xffffff, 0x444444, 0.4]} />
      <directionalLight position={[4, 6, 2]} intensity={1.6} castShadow />
      <Suspense fallback={null}>
        <primitive object={scene} scale={1.12} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.25} />
    </Canvas>
  );
}
