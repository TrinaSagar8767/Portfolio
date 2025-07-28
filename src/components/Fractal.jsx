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
      let slideProgress = Math.min(Math.max((elapsed - layerDelay) / slideDuration, 0), 1);
      const slideOffset = size * (1 - slideProgress);

      ctx.fillStyle = `hsl(${currentLevel * 25}, 70%, 60%)`;
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

      drawTree(ctx, canvas.width / 2 - 50, canvas.height - 80, 100, 0, 0, elapsed);

      ctx.save();
      ctx.translate(canvas.width / 2 + 50, canvas.height - 80);
      ctx.scale(-1, 1);
      drawTree(ctx, 0, 0, 100, 0, 0, elapsed);
      ctx.restore();

      const currentLevelFloat = elapsed / slideDuration;
      const newLevel = Math.min(Math.floor(currentLevelFloat), maxLevels);

      if (newLevel > levelRef.current) {
        levelRef.current = newLevel;
      }

      if (newLevel < maxLevels) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
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
        <h2 className="text-4xl font-bold">My Creative Code</h2>
        <p className="mt-2 text-lg">An animated fractal tree powered by math, art, and code.</p>
      </div>
    </motion.section>
  );
}

export default Fractal;
