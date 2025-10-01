import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Preload, Stars } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";

const PulseLine = ({ start, end }) => {
  const pulseRef = useRef();
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  dir.normalize();

  const geometry = useMemo(() => {
    const points = [start, end];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [start, end]);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.5) % 1; // speed of pulse
    pulseRef.current.position.copy(
      start.clone().add(dir.clone().multiplyScalar(length * t))
    );
  });

  return (
    <group>
      {/* Static connection line */}
      <line geometry={geometry}>
        <lineBasicMaterial color="#2196f3" transparent opacity={0.35} linewidth={0.5} />
      </line>

      {/* Moving pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial emissive="#00e5ff" color="#00e5ff" />
      </mesh>
    </group>
  );
};

const InternetWeb = () => {
  const hub = new THREE.Vector3(0, 0, 0);

  const rings = useMemo(() => {
    const layers = [];
    const ringCounts = [8, 12, 16];
    const radii = [7, 3.5, 6]; // ring radius for each

    ringCounts.forEach((count, i) => {
      const ring = [];
      for (let j = 0; j < count; j++) {
        const angle = (j / count) * Math.PI * 2; // spread around full circle
        const x = Math.cos(angle) * radii[i];
        const y = (Math.random() - 0.5) * 5.5; // vertical variation
        const z = Math.sin(angle) * radii[i];
        ring.push(new THREE.Vector3(x, y, z));
      }
      layers.push(ring);
    });

    return layers;
  }, []);

  return (
    <group>
      {/* Central hub */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial emissive="#00e5ff" color="#00e5ff" />
      </mesh>

      {/* Nodes + connections with pulses */}
      {rings.map((ring, ri) =>
        ring.map((pos, i) => {
          const key = `${ri}-${i}`;
          return (
            <group key={key}>
              {/* Node */}
              <mesh position={pos}>
                <sphereGeometry args={[0.12, 16, 16]} />
                <meshStandardMaterial emissive="#4fc3f7" color="#4fc3f7" />
              </mesh>

              {/* Connection to hub */}
              <PulseLine start={hub} end={pos} />

              {/* Side connection to neighbor in ring */}
              <PulseLine
                start={pos}
                end={ring[(i + 1) % ring.length]} // wraps around to form a loop
              />
            </group>
          );
        })
      )}
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
        position: [8, 6, 8],
      }}
    >
      <Suspense fallback={<CanvasLoader />}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} />
        <OrbitControls autoRotate enableZoom={false} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <InternetWeb />
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
