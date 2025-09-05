import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

function Fractal() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [startAnimation, setStartAnimation] = useState(false);

  // Animation state
  const levelRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const maxLevels = 10;
  const slideDuration = 500;

  // Fruit state
  const fruitState = useRef({
    active: false,
    x: 0,
    y: 0,
    size: 30,
    vy: 0,
    exploding: false,
    particles: [],
    spawnedSecondary: false,
  });

  // Secondary fruits that rain down with jelly wobble
  const secondaryFruits = useRef([]);

  const languages = ["JS", "Python", "C++", "Java", "Go", "Rust", "Ruby", "PHP"];

  useEffect(() => {
    if (isInView) setStartAnimation(true);
  }, [isInView]);

  useEffect(() => {
    if (!startAnimation) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    levelRef.current = 0;
    startTimeRef.current = null;

    const drawTree = (ctx, x, y, size, angle, currentLevel, elapsed) => {
      if (currentLevel > levelRef.current) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const layerDelay = currentLevel * slideDuration;
      let slideProgress = Math.min(
        Math.max((elapsed - layerDelay) / slideDuration, 0),
        1
      );
      const slideOffset = size * (1 - slideProgress);

      // tree colors
      const baseHue = 180;
      const hueShiftPerLevel = 5;
      const baseLightness = 75;
      const lightnessDecreasePerLevel = 3;

      const hue = baseHue + currentLevel * hueShiftPerLevel;
      const lightness = Math.max(
        10,
        baseLightness - currentLevel * lightnessDecreasePerLevel
      );
      const saturation = Math.min(80, 50 + currentLevel * 3);

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillRect(0, slideOffset, size, -size);

      const newSize = size * Math.sqrt(0.5);
      const leftX = 0;
      const leftY = slideOffset - size;
      const rightX = size;
      const rightY = slideOffset - size;

      ctx.save();
      ctx.translate(leftX, leftY);
      ctx.rotate(-Math.PI / 4);
      drawTree(ctx, 0, 0, newSize, 0, currentLevel + 1, elapsed);
      ctx.restore();

      ctx.save();
      ctx.translate(rightX, rightY);
      ctx.rotate(Math.PI / 4);
      drawTree(ctx, 0, 0, newSize, 0, currentLevel + 1, elapsed);
      ctx.restore();

      ctx.restore();
    };

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Trunk base
      const trunkX = canvas.width / 2 - 100;
      const trunkY = canvas.height - 220;
      const trunkSize = 130;
      const underSquareHeight = 140;

      ctx.save();
      ctx.fillStyle = "hsla(194, 80%, 84%, 1.0)";
      ctx.fillRect(trunkX, trunkY + trunkSize, trunkSize, -underSquareHeight);
      ctx.restore();

      // Draw tree
      drawTree(ctx, trunkX, trunkY, trunkSize, 0, 0, elapsed);

      const currentLevelFloat = elapsed / slideDuration;
      const newLevel = Math.min(Math.floor(currentLevelFloat), maxLevels);

      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
      }

      if (newLevel < maxLevels) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      } else if (newLevel === maxLevels) {
        const fruit = fruitState.current;

        // Initialize fruit
        if (!fruit.active) {
          fruit.active = true;
          fruit.x = trunkX + trunkSize / 2 + 200;
          fruit.y = trunkY + trunkSize - 300;
          fruit.size = 70;
          fruit.vy = 0;
          fruit.exploding = false;
          fruit.particles = [];
          fruit.spawnedSecondary = false;
        }

        if (!fruit.exploding) {
          // Drop fruit
          fruit.vy += 0.5;
          fruit.y += fruit.vy;

          if (fruit.y + fruit.size >= canvas.height - 10) {
            fruit.exploding = true;
            fruit.particles = Array.from({ length: 25 }, () => ({
              x: fruit.x,
              y: fruit.y,
              vx: (Math.random() - 0.5) * 10,
              vy: -Math.random() * 15 - 2,
              size: 45,
              life: 200,
            }));
          } else {
            ctx.save();
            ctx.fillStyle = "hsla(0, 80%, 84%, 1.0)";
            ctx.fillRect(fruit.x, fruit.y, fruit.size, -fruit.size);
            ctx.restore();
          }
        } else {
          // Explosion particles
          fruit.particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy * 2;
            p.life--;

            const alpha = Math.max(p.life / 60, 0);
            ctx.save();
            ctx.fillStyle = `hsla(0, 80%, 84%, ${alpha})`;
            ctx.fillRect(p.x, p.y, p.size, -p.size);
            ctx.restore();
          });

          fruit.particles = fruit.particles.filter((p) => p.life > 0);

          // Spawn secondary fruits ONCE, evenly spaced
          if (!fruit.spawnedSecondary) {
            fruit.spawnedSecondary = true;

            const spreadWidth = canvas.width * 0.6;
            const baseX = canvas.width * 0.2;
            const numFruits = 10;
            const spacing = spreadWidth / numFruits;

            for (let i = 0; i < numFruits; i++) {
              const x =
                baseX + i * spacing + (Math.random() - 0.5) * 30; // jitter
              const y = trunkY - Math.random() * 200; // high above tree
              const label = languages[i % languages.length];

              secondaryFruits.current.push({
                x,
                y,
                size: 40,
                vy: 0,
                jellyPhase: Math.random() * Math.PI * 2,
                label,
              });
            }
          }
        }

        // Animate secondary fruits
        secondaryFruits.current.forEach((fruit) => {
          fruit.vy += 0.3;
          fruit.y += fruit.vy;

          // ground collision (stop at bottom)
          if (fruit.y + fruit.size / 2 >= canvas.height - 20) {
            fruit.y = canvas.height - 20 - fruit.size / 2;
            fruit.vy = 0;
          }

          fruit.jellyPhase += 0.2;
          const scaleX = 1 + 0.1 * Math.sin(fruit.jellyPhase);
          const scaleY = 1 - 0.1 * Math.sin(fruit.jellyPhase);

          ctx.save();
          ctx.translate(fruit.x, fruit.y);
          ctx.scale(scaleX, scaleY);
          ctx.fillStyle = "hsla(0, 80%, 84%, 0.9)";
          ctx.fillRect(-fruit.size / 2, -fruit.size / 2, fruit.size, fruit.size);

          // Label text
          ctx.fillStyle = "black";
          ctx.font = "14px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(fruit.label, 0, 0);
          ctx.restore();
        });

        // Keep animating
        if (
          fruit.particles.length > 0 ||
          secondaryFruits.current.length > 0 ||
          !fruit.exploding
        ) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
        }
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [startAnimation]);

  return (
    <motion.section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={startAnimation ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0" />
      <div className="relative z-10 p-8 text-white">
        <h2 className="text-4xl font-bold">Programming Languages</h2>
        <p className="mt-2 text-lg">
          Like a tree, coding skills start small but grow with time and care.
        </p>
      </div>
    </motion.section>
  );
}

export default Fractal;
