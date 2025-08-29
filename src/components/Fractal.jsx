import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

function Fractal() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [startAnimation, setStartAnimation] = useState(false);

  const levelRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  const maxLevels = 10;
  const slideDuration = 500;

  const fruitState = useRef({
    active: false,
    x: 0,
    y: 0,
    size: 70,
    vy: 0,
    exploding: false,
    particles: [],
    jellyPhase: Math.random() * Math.PI * 2,
  });

  const secondaryFruits = useRef([]);
  const languages = ["Python", "JavaScript", "C++", "Java", "Go", "Rust", "Ruby"];

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

    const trunkX = canvas.width / 2 - 100;
    const trunkY = canvas.height - 220;
    const trunkSize = 130;

    const drawTree = (ctx, x, y, size, angle, currentLevel, elapsed) => {
      if (currentLevel > levelRef.current) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      const layerDelay = currentLevel * slideDuration;
      const slideProgress = Math.min(Math.max((elapsed - layerDelay) / slideDuration, 0), 1);
      const slideOffset = size * (1 - slideProgress);

      const baseHue = 180;
      const hueShiftPerLevel = 5;
      const baseLightness = 75;
      const lightnessDecreasePerLevel = 3;

      const hue = baseHue + currentLevel * hueShiftPerLevel;
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
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw trunk base
      ctx.save();
      ctx.fillStyle = "hsla(194, 80%, 84%, 1.00)";
      ctx.fillRect(trunkX, trunkY + trunkSize, trunkSize, -140);
      ctx.restore();

      const currentLevelFloat = elapsed / slideDuration;
      const newLevel = Math.min(Math.floor(currentLevelFloat), maxLevels);
      if (newLevel > levelRef.current) levelRef.current = newLevel;

      drawTree(ctx, trunkX, trunkY, trunkSize, 0, 0, elapsed);

      const fruit = fruitState.current;

      // Initialize main fruit after tree finishes
      if (levelRef.current >= maxLevels && !fruit.active) {
        fruit.active = true;
        fruit.x = trunkX + trunkSize / 2 + 200;
        fruit.y = trunkY + trunkSize - 300;
        fruit.vy = 0;
        fruit.exploding = false;
        fruit.particles = [];
      }

      // Animate main fruit
      if (fruit.active && !fruit.exploding) {
        fruit.vy += 0.5;
        fruit.y += fruit.vy;

        const wobble = Math.sin(performance.now() / 200 + fruit.jellyPhase) * 0.2;
        ctx.save();
        ctx.translate(fruit.x + fruit.size / 2, fruit.y + fruit.size / 2);
        ctx.scale(1 + wobble, 1 - wobble);
        ctx.translate(-(fruit.x + fruit.size / 2), -(fruit.y + fruit.size / 2));
        ctx.fillStyle = "hsla(340, 80%, 84%, 1.0)";
        ctx.fillRect(fruit.x, fruit.y, fruit.size, -fruit.size);
        ctx.restore();

        if (fruit.y + fruit.size >= canvas.height - 10) {
          fruit.exploding = true;

          // Explosion particles
          fruit.particles = Array.from({ length: 25 }, () => ({
            x: fruit.x + fruit.size / 2,
            y: fruit.y,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 15 - 2,
            size: 45,
            life: 200,
            jellyPhase: Math.random() * Math.PI * 2,
            language: languages[Math.floor(Math.random() * languages.length)],
            secondarySpawned: false
          }));
        }
      }

      // Animate explosion particles
      if (fruit.exploding) {
        fruit.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5;
          p.life--;

          const alpha = Math.max(p.life / 200, 0);
          const wobble = Math.sin(performance.now() / 200 + p.jellyPhase) * 0.2;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(1 + wobble, 1 - wobble);
          ctx.translate(-p.x, -p.y);
          ctx.fillStyle = `hsla(340, 80%, 84%, ${alpha})`;
          ctx.fillRect(p.x, p.y, p.size, -p.size);
          ctx.restore();

          // Spawn secondary fruits with horizontal spacing
          if (!p.secondarySpawned && p.vy > 0) {
            p.secondarySpawned = true;
            secondaryFruits.current.push({
              x: p.x - p.size / 2 + (Math.random() - 0.5) * 60, // horizontal offset ±30px
              y: p.y - p.size / 2 - Math.random() * 40, // small vertical offset
              size: p.size / 1.5,
              vy: 0,
              jellyPhase: Math.random() * Math.PI * 2,
              label: p.language
            });
          }
        });

        fruit.particles = fruit.particles.filter((p) => p.life > 0);
      }

      // Animate secondary falling fruits
      secondaryFruits.current.forEach((f) => {
        f.vy += 0.5;
        f.y += f.vy;

        if (f.y + f.size >= canvas.height - 10) {
          f.y = canvas.height - 10 - f.size;
          f.vy = 0;
        }

        const wobble = Math.sin(performance.now() / 200 + f.jellyPhase) * 0.2;
        ctx.save();
        ctx.translate(f.x + f.size / 2, f.y + f.size / 2);
        ctx.scale(1 + wobble, 1 - wobble);
        ctx.translate(-(f.x + f.size / 2), -(f.y + f.size / 2));

        ctx.fillStyle = "hsla(200, 80%, 70%, 1.0)";
        ctx.fillRect(f.x, f.y, f.size, f.size);

        ctx.fillStyle = "white";
        ctx.font = `${f.size / 3}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(f.label, f.x + f.size / 2, f.y + f.size / 2);

        ctx.restore();
      });

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
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
