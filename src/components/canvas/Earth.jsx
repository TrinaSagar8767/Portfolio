import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";

const NetworkWeb = () => {
  // Random points in space
  const nodes = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      arr.push(new THREE.Vector3(x, y, z));
    }
    return arr;
  }, []);

  return (
    <group>
      {/* Nodes */}
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#4fc3f7" />
        </mesh>
      ))}

      {/* Connections */}
      {nodes.slice(0, 20).map((start, i) => {
        const end = nodes[(i * 3) % nodes.length];
        const points = [start, end];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={`line-${i}`} geometry={geometry}>
            <lineBasicMaterial color="#81d4fa" linewidth={2} />
          </line>
        );
      })}
    </group>
  );
};

const EarthCanvas = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}
      camera={{
        fov: 50,
        near: 0.1,
        far: 200,
        position: [5, 5, 8],
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls autoRotate enableZoom={false} />
        <NetworkWeb />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
