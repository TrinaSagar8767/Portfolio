import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

function Fractal() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [startAnimation, setStartAnimation] = useState(false);

  // Use refs for mutable animation state
  const levelRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const maxLevels = 10;
  const slideDuration = 500;

  //const for fruit state
  const fruitState = useRef({
    active: false,
    x: 0,
    y: 0,
    size: 30,
    vy: 0,
    exploding: false,
    particles: []
  });

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

    const drawTree = (ctx, x, y, size, angle, currentLevel, elapsed) => { //draw tree, called recursively by animation function
      if (currentLevel > levelRef.current) {

        return;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const layerDelay = currentLevel * slideDuration;
      let slideProgress = Math.min(Math.max((elapsed - layerDelay) / slideDuration, 0), 1);
      const slideOffset = size * (1 - slideProgress);

      {/* Determine color based on level */ }
      const baseHue = 180; // soft cyan
      const hueShiftPerLevel = 5; // shift toward deeper blue
      const baseLightness = 75;
      const lightnessDecreasePerLevel = 3;

      const hue = baseHue + currentLevel * hueShiftPerLevel;     // becomes more blue
      const lightness = Math.max(10, baseLightness - currentLevel * lightnessDecreasePerLevel);
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
      //called each frame recursively
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a square underneath the first one (the trunk)
      const trunkX = canvas.width / 2 - 100;
      const trunkY = canvas.height - 220;
      const trunkSize = 130;
      const underSquareHeight = 140; // Height of the square underneath

      ctx.save();
      ctx.fillStyle = "hsla(194, 80%, 84%, 1.00)"; // A dark color for the base
      ctx.fillRect(trunkX, trunkY + trunkSize, trunkSize, -underSquareHeight);
      ctx.restore();

      // Draw only the animated (left) tree
      drawTree(ctx, trunkX, trunkY, trunkSize, 0, 0, elapsed);

      const currentLevelFloat = elapsed / slideDuration;
      const newLevel = Math.min(Math.floor(currentLevelFloat), maxLevels);

      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
      }

      if (newLevel < maxLevels) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }
      else if (newLevel === maxLevels) {
        // Start fruit drop once
        if (!fruitState.current.active) {
          fruitState.current.active = true;
          fruitState.current.x = trunkX + trunkSize / 2 + 200;
          fruitState.current.y = trunkY + trunkSize - 300;
          fruitState.current.size = 70;
          fruitState.current.vy = 0;
          fruitState.current.exploding = false;
          fruitState.current.particles = [];
        }

        const fruit = fruitState.current;

        if (!fruit.exploding) {
          // gravity drop
          fruit.vy += 0.5;  // gravity acceleration
          fruit.y += fruit.vy;

          // ground collision at coordinates
          if (fruit.y + fruit.size >= canvas.height - 10) { //at ground
            fruit.exploding = true;
            // create upward explosion particles
            fruit.particles = Array.from({ length: 25 }, () => ({
              x: fruit.x,
              y: fruit.y,
              vx: (Math.random() - 0.5) * 10, // slight horizontal spread
              vy: -Math.random() * 15 - 2,    // only upward
              size: 45,
              life: 200 // frames
            }));
          } else {
            // draw falling fruit
            ctx.save();
            ctx.fillStyle = "hsla(0, 80%, 84%, 1.0)";
            ctx.fillRect(fruit.x, fruit.y, fruit.size, -fruit.size);
            ctx.restore();
          }
        } else {
          // Explosion phase: particles only move upward and fade
          fruit.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy * 2;
            p.life--;

            const alpha = Math.max(p.life / 60, 0); // fade out smoothly
            ctx.save();
            ctx.fillStyle = `hsla(0, 80%, 84%, ${alpha})`;
            ctx.fillRect(p.x, p.y, p.size, -p.size);
            ctx.restore();
          });

          // Remove dead particles
          fruit.particles = fruit.particles.filter(p => p.life > 0);
        }

        // Keep animation going until all particles vanish
        if (fruit.particles.length > 0 || !fruit.exploding) {
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
        <p className="mt-2 text-lg">Like a tree, coding skills start small but grow with time and care.</p>
      </div>
    </motion.section>
  );
}

export default Fractal;
