"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function OrbMesh() {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = clock.elapsedTime * 0.15;
    mesh.current.rotation.y = clock.elapsedTime * 0.2;
  });

  return (
    <Float speed={2.2} rotationIntensity={0.45} floatIntensity={1.3}>
      <mesh ref={mesh} scale={1.7}>
        <sphereGeometry args={[1, 96, 96]} />
        <MeshDistortMaterial
          color="#6C63FF"
          emissive="#00D1FF"
          emissiveIntensity={0.18}
          roughness={0.18}
          metalness={0.48}
          distort={0.32}
          speed={2.4}
        />
      </mesh>
    </Float>
  );
}

export function AiOrb() {
  return (
    <div className="absolute inset-0 -z-10 opacity-95">
      <Canvas camera={{ position: [0, 0, 5], fov: 46 }} dpr={[1, 1.8]}>
        <ambientLight intensity={0.8} />
        <pointLight position={[3, 2, 4]} intensity={7} color="#00D1FF" />
        <pointLight position={[-3, -2, 2]} intensity={5} color="#A855F7" />
        <Stars radius={80} depth={35} count={900} factor={3} saturation={0} fade speed={0.45} />
        <OrbMesh />
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
    </div>
  );
}

