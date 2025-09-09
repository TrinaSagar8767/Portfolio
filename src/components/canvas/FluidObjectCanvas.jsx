import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";

function CrystalLaptop({ rows = 5, cols = 12 }) {
  const screenRef = useRef();
  const { mouse } = useThree();

  // Create rectangular keys for the screen
  const screenKeys = useMemo(() => {
    const arr = [];
    const spacing = 0.3;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (j - cols / 2) * spacing;
        const y = -(i - rows / 2) * spacing;
        arr.push({ pos: [x, y, 0] });
      }
    }
    return arr;
  }, [rows, cols]);

  useFrame(() => {
    if (screenRef.current) {
      screenRef.current.rotation.y = mouse.x * 0.1;
      screenRef.current.rotation.x = -mouse.y * 0.1;
    }
  });

  return (
    <group>
      {/* Keyboard/Base */}
      <group position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
        {/* Flat base */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[cols * 0.35, 1.5, 0.3]} />
          <meshStandardMaterial
            color="#88cfff"
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.7}
          />
        </mesh>

        {/* Keys */}
        {Array.from({ length: 5 }).map((_, rowIndex) =>
          Array.from({ length: 12 }).map((_, colIndex) => {
            const x = (colIndex - 12 / 2) * 0.3;
            const y = -(rowIndex * 0.3);
            return (
              <mesh key={`${rowIndex}-${colIndex}`} position={[x, y, 0.15]}>
                <boxGeometry args={[0.28, 0.25, 0.15]} />
                <meshStandardMaterial
                  color="#a0d8ff"
                  transparent
                  opacity={0.5}
                  roughness={0.05}
                  metalness={0.8}
                  emissive={"#3fa9ff"}
                  emissiveIntensity={0.3}
                />
              </mesh>
            );
          })
        )}
      </group>

      {/* Screen with keys instead of cones */}
      <group
        ref={screenRef}
        position={[0, 0.5, -0.75]} // hinge at back edge of keyboard
      >
        <group rotation={[-Math.PI / 2 + Math.PI / 10, 0, 0]}>
          {/* Screen frame */}
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[cols * 0.35, rows * 0.35, 0.4]} />
            <meshStandardMaterial
              color="#88cfff"
              transparent
              opacity={0.3}
              roughness={0.1}
              metalness={0.7}
            />
          </mesh>

          {/* Screen back panel */}
          <mesh position={[0, 0.5, -0.05]}>
            <boxGeometry args={[cols * 0.3, rows * 0.3, 0.1]} />
            <meshStandardMaterial
              color="#a0d8ff"
              transparent
              opacity={0.3}
              roughness={0.05}
              metalness={0.8}
              emissive={"#3fa9ff"}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Rectangular keys replacing crystal pixels */}
          {screenKeys.map(({ pos }, i) => (
            <mesh key={i} position={[pos[0], pos[1], 0.11]}>
              <boxGeometry args={[0.28, 0.25, 0.15]} />
              <meshStandardMaterial
                color="#a0d8ff"
                transparent
                opacity={0.5}
                roughness={0.05}
                metalness={0.8}
                emissive={"#3fa9ff"}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

export default function HeroVisual() {
  return (
    <Canvas camera={{ position: [0, 1, 8], fov: 50 }}>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -2, -5]} intensity={1.2} color={"#4ac9ff"} />
      <pointLight position={[3, -2, 5]} intensity={0.8} color={"#ff8cff"} />

      {/* Crystal Laptop */}
      <group position={[0, -1, 0]}>
        <CrystalLaptop />
      </group>
    </Canvas>
  );
}
