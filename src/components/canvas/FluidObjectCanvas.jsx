import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";

function CrystalLaptop() {
  const keyboardRef = useRef();
  const keyHeight = 0.15;
  const keyDepth = 0.25;

  // spacing between keys horizontally and vertically
  const xSpacing = 0.04;
  const zSpacing = 0.32;

  // Each row: array of key widths (in units)
  const layout = [
    // Row 1
    [0.6, ...Array(12).fill(0.28)],
    // Row 2
    [0.6, ...Array(12).fill(0.28), 0.6],
    // Row 3
    [0.7, ...Array(11).fill(0.28), 0.7],
    // Row 4
    [0.9, ...Array(10).fill(0.28), 0.9],
    // Bottom row
    [0.5, 0.5, 0.5, 0.5, 1.8, 0.5, 0.5, 0.5, 0.5],
  ];

  // Generate key positions
  const keyboardKeys = useMemo(() => {
    const keys = [];
    const rowCount = layout.length;
    const zOffset = ((rowCount - 1) * zSpacing) / 2;

    layout.forEach((row, rowIndex) => {
      const rowWidth = row.reduce((sum, w) => sum + w, 0) + xSpacing * (row.length - 1);
      let currentX = -rowWidth / 2;

      row.forEach((width) => {
        keys.push({
          pos: [currentX + width / 2, 0, rowIndex * zSpacing - zOffset],
          width,
        });
        currentX += width + xSpacing;
      });
    });

    return keys;
  }, [layout, xSpacing, zSpacing]);

  useFrame(({ mouse }) => {
    if (keyboardRef.current) {
      keyboardRef.current.rotation.y = mouse.x * 0.05;
      keyboardRef.current.rotation.x = -mouse.y * 0.05;
    }
  });

  // Base plate size
  const baseWidth = 8;
  const baseDepth = layout.length * zSpacing + 0.5;

  return (
    <group>
      {/* Base plate */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[baseWidth, 0.2, baseDepth]} />
        <meshStandardMaterial color="#88cfff" transparent opacity={0.25} roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Keys */}
      <group ref={keyboardRef} position={[0, 0.05, 0]}>
        {keyboardKeys.map(({ pos, width }, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[width, keyHeight, keyDepth]} />
            <meshStandardMaterial
              color="#a0d8ff"
              transparent
              opacity={0.7 + Math.random() * 0.05}
              roughness={0.05}
              metalness={0.8}
              emissive="#3fa9ff"
              emissiveIntensity={0.35}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function HeroVisual() {
  return (
    <Canvas camera={{ position: [0, 3, 6], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -2, -5]} intensity={1.2} color={"#4ac9ff"} />
      <pointLight position={[3, -2, 5]} intensity={0.8} color={"#ff8cff"} />

      <group position={[0, -1, 0]}>
        <CrystalLaptop />
      </group>
    </Canvas>
  );
}
