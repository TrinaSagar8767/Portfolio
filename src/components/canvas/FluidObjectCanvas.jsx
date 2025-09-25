import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useRef, useMemo } from "react";

function CrystalLaptop() {
  const keyboardRef = useRef();
  const keyHeight = 0.15;
  const keyDepth = 0.25;

  // Fixed keyboard width
  const totalWidth = 7.5;
  const rowCount = 5;

  // Tiny gap between keys
  const keyGap = 0.05;

  // Layout weights
  const layout = [
    [1, ...Array(12).fill(1)],                  
    [1.2, ...Array(11).fill(1), 1.2],          
    [1.4, ...Array(10).fill(1), 1.4],          
    [1.6, ...Array(9).fill(1), 1.6],           
    [1, 1, 1.5, 4, 1.5, 1, 1],                 
  ];

  // Generate keys
  const keyboardKeys = useMemo(() => {
    const keys = [];
    const zSpacing = 0.35;
    const zOffset = ((rowCount - 1) * zSpacing) / 2;

    layout.forEach((row, rowIndex) => {
      const weightSum = row.reduce((a, b) => a + b, 0);
      const unitWidth = totalWidth / weightSum;
      let currentX = -totalWidth / 2;

      row.forEach((w) => {
        const width = w * unitWidth - keyGap; // shrink for visible spacing
        keys.push({
          pos: [currentX + width / 2, 0, rowIndex * zSpacing - zOffset],
          width,
        });
        currentX += w * unitWidth;
      });
    });

    return keys;
  }, [layout, totalWidth, rowCount, keyGap]);

  // Base size
  const baseDepth = rowCount * 0.35 + 0.4;

  return (
    <group>
      {/* Darker base plate */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[totalWidth + 0.5, 0.2, baseDepth]} />
        <meshStandardMaterial
          color="#223344"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Keys */}
      <group ref={keyboardRef} position={[0, 0.05, 0]}>
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
    </group>
  );
}

export default function HeroVisual() {
  return (
    <Canvas camera={{ position: [0, 3, 7], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -2, -5]} intensity={1.2} color={"#4ac9ff"} />
      <pointLight position={[3, -2, 5]} intensity={0.8} color={"#ff8cff"} />

      {/* Rim light to highlight edges */}
      <directionalLight position={[0, 5, -5]} intensity={0.6} color={"#ffffff"} />

      <group position={[0, -1, 0]}>
        <CrystalLaptop />
      </group>
    </Canvas>
  );
}
