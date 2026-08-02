import { useMemo } from "react";

function seededUnit(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildSparkles(count = 8) {
  return Array.from({ length: count }, (_, i) => {
    const r = seededUnit(i + 3);
    const r2 = seededUnit(i + 19);
    const r3 = seededUnit(i + 41);
    return {
      id: `sp-${i}`,
      x: `${Math.round(4 + r * 92)}%`,
      y: `${Math.round(8 + r2 * 75)}%`,
      delay: `${(r3 * 4).toFixed(2)}s`,
      dur: `${(2.4 + r * 2.2).toFixed(2)}s`,
      size: `${3 + Math.round(r2 * 4)}px`,
    };
  });
}

/** Soft gold sparkles — CSS only, sparse. */
export default function Sparkles() {
  const items = useMemo(() => buildSparkles(8), []);

  return (
    <div className="rakhi-sparkles" aria-hidden="true">
      {items.map((s) => (
        <span
          key={s.id}
          className="rakhi-sparkles__dot"
          style={{
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </div>
  );
}
