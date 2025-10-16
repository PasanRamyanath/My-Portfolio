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
      camera={{ position: [0, 1, 3], fov: 35 }}
      className="rounded-full"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <primitive object={scene} scale={1} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}
