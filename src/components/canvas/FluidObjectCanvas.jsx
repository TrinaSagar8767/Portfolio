import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

function CrystalLaptop() {
  const keyHeight = 0.15;
  const keyDepth = 0.25;
  const totalWidth = 7.5;
  const rowCount = 5;
  const keyGap = 0.05;

  const layout = [
    [1, ...Array(12).fill(1)],
    [1.2, ...Array(11).fill(1), 1.2],
    [1.4, ...Array(10).fill(1), 1.4],
    [1.6, ...Array(9).fill(1), 1.6],
    [1, 1, 1.5, 4, 1.5, 1, 1],
  ];

  const keyboardKeys = useMemo(() => {
    const keys = [];
    const zSpacing = 0.35;
    const zOffset = ((rowCount - 1) * zSpacing) / 2;

    layout.forEach((row, rowIndex) => {
      const weightSum = row.reduce((a, b) => a + b, 0);
      const unitWidth = totalWidth / weightSum;
      let currentX = -totalWidth / 2;

      row.forEach((w) => {
        const width = w * unitWidth - keyGap;
        keys.push({
          pos: [currentX + width / 2, 0, rowIndex * zSpacing - zOffset],
          width,
        });
        currentX += w * unitWidth;
      });
    });

    return keys;
  }, [layout, totalWidth, rowCount, keyGap]);

  const baseDepth = rowCount * 0.35 + 1.6;

  return (
    <group scale={[0.7, 0.7, 0.7]}>
      {/* Base */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[totalWidth + 0.5, 0.2, baseDepth]} />
        <meshStandardMaterial color="#223344" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Keys */}
      <group position={[0, 0.05, 0]}>
        {keyboardKeys.map(({ pos, width }, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[width, keyHeight, keyDepth]} />
            <meshStandardMaterial
              color="#a0d8ff"
              roughness={0.25}
              metalness={0.5}
              emissive="#3fa9ff"
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Screen Frame */}
      <group position={[0, 0, -baseDepth / 2 - 0.15]}>
        {/* Frame */}
        <mesh position={[0, 1.6, -0.25 - 1]} rotation={[-0.45, 0, 0]}>
          <boxGeometry args={[totalWidth - 0.5, 3.5, 0.25]} />
          <meshStandardMaterial color="#475869ff" roughness={0.6} metalness={0.2} />
        </mesh>

        {/* 🔹 Screen Plane (double-sided) */}
        <mesh position={[0, 1.6, -0.30 - 1]} rotation={[-0.45, 0, 0]}>
          <planeGeometry args={[totalWidth + 0.5, 5 - 0.5]} />
          <meshStandardMaterial color="grey" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

export default function HeroVisual() {
  return (
    <Canvas camera={{ position: [0, 3, 9], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -2, -5]} intensity={1.2} color={"#4ac9ff"} />
      <pointLight position={[3, -2, 5]} intensity={0.8} color={"#ff8cff"} />
      <directionalLight position={[0, 5, -5]} intensity={0.6} color={"#ffffff"} />

      <group position={[0, -3, 0]}>
        <CrystalLaptop />
      </group>
    </Canvas>
  );
}
