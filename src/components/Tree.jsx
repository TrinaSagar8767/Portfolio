// App.jsx or Scene.jsx (Main 3D Canvas Component)

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Icosahedron, Line } from '@react-three/drei';
import * as THREE from 'three';

// ----- IcosahedronColumn Component -----
const IcosahedronColumn = () => {
  const positions = [
    [0, 0, 0],
    [0, 2, 0],
    [0, 4, 0],
    [0, 6, 0],
  ];

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <Icosahedron
          key={i}
          args={[0.5, 0]}
          position={[x, y, z]}
          scale={[1, 1, 1]}
        >
          <meshStandardMaterial color={'#c0f3ff'} emissive="#b6f0ff" emissiveIntensity={0.5} />
        </Icosahedron>
      ))}
    </>
  );
};

// ----- Recursive Fractal Branch Generator -----
function createFractal(start, dir, depth, maxDepth, length, branches) {
  if (depth > maxDepth) return [];

  const end = start.clone().add(dir.clone().multiplyScalar(length));
  const segment = { start, end };

  let children = [];

  if (depth < maxDepth) {
    for (let i = 0; i < branches; i++) {
      const angle = (i / branches) * Math.PI * 2;
      const rotation = new THREE.Vector3(
        Math.sin(angle) * 0.5,
        Math.random() * 0.7 + 0.3,
        Math.cos(angle) * 0.5
      ).normalize();

      children.push(
        ...createFractal(end.clone(), rotation, depth + 1, maxDepth, length * 0.7, branches)
      );
    }
  }

  return [segment, ...children];
}

// ----- FractalTree Component -----
const FractalTree = ({ maxDepth = 4, branches = 3 }) => {
  const [visibleSegments, setVisibleSegments] = useState(0);
  const allSegments = useRef([]);

  // Build tree once on mount
  useEffect(() => {
    const initial = new THREE.Vector3(0, 8, 0); // Start above last icosahedron
    const direction = new THREE.Vector3(0, 1, 0);
    allSegments.current = createFractal(initial, direction, 0, maxDepth, 1, branches);
  }, [maxDepth, branches]);

  // Incrementally reveal segments to animate growth
  useFrame(() => {
    setVisibleSegments((v) => Math.min(v + 1, allSegments.current.length));
  });

  return (
    <>
      {allSegments.current.slice(0, visibleSegments).map((seg, i) => (
        <Line
          key={i}
          points={[seg.start.toArray(), seg.end.toArray()]}
          color="#b6f0ff"
          lineWidth={1.5}
        />
      ))}
    </>
  );
};

// ----- Main Scene -----
export default function Tree() {
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />
      <IcosahedronColumn />
      <FractalTree />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
