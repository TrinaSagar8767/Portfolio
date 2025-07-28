import { useRef, useEffect, useState } from "react";

function Fractal() {
  const canvasRef = useRef(null);
  const [level, setLevel] = useState(0);
  const maxLevels = 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawTree = (ctx, x, y, size, angle, currentLevel) => {
      if (currentLevel > level) return;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Draw square (the current trunk or branch)
      ctx.fillStyle = `hsl(${currentLevel * 25}, 70%, 60%)`;
      ctx.fillRect(0, 0, size, -size);

      const newSize = size * Math.sqrt(0.5);
      const leftX = 0;
      const leftY = -size;
      const rightX = size;
      const rightY = -size;

      // Left branch
      ctx.save();
      ctx.translate(leftX, leftY);
      ctx.rotate(-Math.PI / 4);
      drawTree(ctx, 0, 0, newSize, 0, currentLevel + 1);
      ctx.restore();

      // Right branch
      ctx.save();
      ctx.translate(rightX, rightY);
      ctx.rotate(Math.PI / 4);
      drawTree(ctx, 0, 0, newSize, 0, currentLevel + 1);
      ctx.restore();

      ctx.restore();
    };

    // Draw first tree normally
    drawTree(
      ctx,
      canvas.width / 2 - 50,
      canvas.height - 80,
      100,
      0,
      0
    );

    // Draw mirrored tree horizontally
    ctx.save();
    ctx.translate(canvas.width / 2 + 50, canvas.height - 80);
    ctx.scale(-1, 1);  // flip horizontally
    drawTree(ctx, 0, 0, 100, 0, 0);
    ctx.restore();

    const interval = setInterval(() => {
      setLevel((prev) => {
        if (prev >= maxLevels) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [level]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute top-0 left-0 z-0" />
      <div className="relative z-10 p-8 text-white">
        <h2 className="text-4xl font-bold">My Creative Code</h2>
        <p className="mt-2 text-lg">
          An animated fractal tree powered by math, art, and code.
        </p>
      </div>
    </section>
  );
}

export default Fractal;
