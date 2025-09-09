import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";

function CrystalLaptop({ rows = 5, cols = 12 }) {
  const keyboardRef = useRef();

  // Keyboard keys (previously “screen keys”)
  const keyboardKeys = useMemo(() => {
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

  useFrame(({ mouse }) => {
    if (keyboardRef.current) {
      // Slight rotation of the keyboard for a crystal effect
      keyboardRef.current.rotation.y = mouse.x * 0.05;
      keyboardRef.current.rotation.x = -mouse.y * 0.05;
    }
  });

  return (
    <group>
      {/* Base plate */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[cols * 0.35, 0.2, 2]} />
        <meshStandardMaterial
          color="#88cfff"
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.7}
        />
      </mesh>

      {/* Keyboard (was screen keys) */}
      <group ref={keyboardRef} position={[0, 0.05, 0]}>
        {keyboardKeys.map(({ pos }, i) => (
          <mesh key={i} position={[pos[0], 0, pos[1]]}>
            <boxGeometry args={[0.28, 0.15, 0.25]} />
            <meshStandardMaterial
              color="#a0d8ff"
              transparent
              opacity={0.6}
              roughness={0.05}
              metalness={0.8}
              emissive="#3fa9ff"
              emissiveIntensity={0.3}
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
