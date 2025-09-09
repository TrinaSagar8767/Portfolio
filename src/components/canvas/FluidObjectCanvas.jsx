import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";

function CrystalLaptop({ rows = 10, cols = 16 }) {
  const screenRef = useRef();
  const { mouse } = useThree();

  const crystals = useMemo(() => {
    const arr = [];
    const spacing = 0.35;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = (j - cols / 2) * spacing;
        const y = (i - rows / 2) * spacing;
        const height = 0.15 + Math.random() * 0.1;
        const rot = Math.random() * 0.3;
        arr.push({ pos: [x, y, 0], height, rot });
      }
    }
    return arr;
  }, [rows, cols]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (screenRef.current) {
      screenRef.current.rotation.y = mouse.x * 0.1;
      screenRef.current.rotation.x = -mouse.y * 0.1;
    }
    screenRef.current.children.forEach((child, idx) => {
      if (child.isMesh && child.geometry.type === "ConeGeometry") {
        child.position.z = Math.sin(t * 2 + idx * 0.2) * 0.08;
        child.material.emissiveIntensity =
          0.4 + Math.sin(t * 3 + idx * 0.25) * 0.2;
      }
    });
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

      {/* Screen */}
      <group
        ref={screenRef}
        position={[0, 0.5, -0.75]} // hinge at back edge of keyboard
      >
        <group rotation={[-Math.PI / 2 + Math.PI / 10, 0, 0]}> 
          {/* Tilt ~100° from keyboard plane */}

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

          {/* Crystal pixels */}
          {crystals.map(({ pos, height, rot }, i) => (
            <mesh key={i} position={pos} rotation={[0, 0, rot]}>
              <coneGeometry args={[0.15, height, 4]} />
              <meshStandardMaterial
                color={new THREE.Color(
                  `hsl(${200 + Math.random() * 40},70%,60%)`
                )}
                transparent
                opacity={0.6}
                roughness={0.05}
                metalness={0.8}
                emissive={"#3fa9ff"}
                emissiveIntensity={0.5}
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
