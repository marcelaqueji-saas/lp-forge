import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const COLS = 4;
const ROWS = 3;

type MouseNorm = { x: number; y: number } | null;

const InteractiveTilesBackground: React.FC = () => {
  const [mouse, setMouse] = useState<MouseNorm>(null);

  // tiles fixos
  const tiles = useMemo(
    () => Array.from({ length: ROWS * COLS }, (_, i) => i),
    []
  );

  // rastreia o cursor (normalizado 0–1)
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;

      setMouse({
        x: e.clientX / width,
        y: e.clientY / height,
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const baseShadow = "0 8px 26px rgba(15, 23, 42, 0.12)";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* fundo base bem suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(248,250,252,1),rgba(241,245,249,0.96)),radial-gradient(circle_at_100%_100%,rgba(226,232,240,0.97),rgba(226,232,240,0.9))]" />

      {/* parede 3D – blocos grandes ocupando a tela toda */}
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          gap: "4px",
        }}
      >
        {tiles.map((tileIndex) => {
          const col = tileIndex % COLS;
          const row = Math.floor(tileIndex / COLS);

          // atraso por linha/coluna → onda suave
          const delay = row * 0.2 + col * 0.1;

          // centro do tile normalizado
          const tileX = (col + 0.5) / COLS;
          const tileY = (row + 0.5) / ROWS;

          const nx = mouse?.x ?? 0.5;
          const ny = mouse?.y ?? 0.5;

          const dx = nx - tileX;
          const dy = ny - tileY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // raio de influência do cursor (quanto menor, mais local)
          const radius = 0.6;
          const intensity = Math.max(0, 1 - dist / radius); // 0–1

          // intensidade bem sutil de cor
          const tintOpacity = 0.22 * intensity; // máx ~0.22
          const tintColor = `rgba(129, 140, 248, ${tintOpacity})`; // indigo suave

          const backgroundImage = `
            linear-gradient(135deg,
              rgba(255,255,255,0.85),
              rgba(243,244,246,0.55)
            ),
            radial-gradient(circle at 20% 0%, ${tintColor}, transparent)
          `;

          return (
            <motion.div
              key={tileIndex}
              className="rounded-[26px] sm:rounded-[30px] bg-white/10"
              style={{
                boxShadow: baseShadow,
                backgroundImage,
                backgroundBlendMode: "soft-light",
                willChange: "transform, box-shadow, background-image",
              }}
              initial={{ y: 0, scale: 1 }}
              animate={{
                y: [-4, 2, -4],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 4.5,
                ease: "easeInOut",
                repeat: Infinity,
                delay,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveTilesBackground;
