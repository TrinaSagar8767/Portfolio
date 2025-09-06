// ParticleOrb.jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function ParticleCore({ count = 300 }) {
  const meshRef = useRef();

  // Generate random positions inside a sphere
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const costheta = Math.random() * 2 - 1;
      const u = Math.random();

      const theta = Math.acos(costheta);
      const r = Math.cbrt(u) * 1.4; // radius inside sphere

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      arr.push(x, y, z);
    }
    return new Float32Array(arr);
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Rotate the whole particle system slowly
    meshRef.current.rotation.y = t * 0.3;
    meshRef.current.rotation.x = t * 0.15;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#47b5ff"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.8}
      />
    </points>
  );
}

export default function ParticleOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <ParticleCore />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
