import { useMemo } from "react";
import petalSrc from "./assets/petals.svg";

function seededUnit(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildPetals(count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const r = seededUnit(i + 1);
    const r2 = seededUnit(i + 17);
    const r3 = seededUnit(i + 31);
    return {
      id: `petal-${i}`,
      x: `${Math.round(r * 100)}%`,
      delay: `${(r2 * 14).toFixed(2)}s`,
      dur: `${(12 + r3 * 10).toFixed(2)}s`,
      size: `${9 + Math.round(r2 * 8)}px`,
      drift: `${Math.round((r3 - 0.5) * 70)}px`,
    };
  });
}

/** Soft falling petals — CSS animation only, max 15. */
export default function FloatingPetals() {
  const petals = useMemo(() => buildPetals(12), []);

  return (
    <div className="rakhi-petals" aria-hidden="true">
      {petals.map((p) => (
        <img
          key={p.id}
          src={petalSrc}
          alt=""
          className="rakhi-petals__petal"
          style={{
            "--x": p.x,
            "--delay": p.delay,
            "--dur": p.dur,
            "--size": p.size,
            "--drift": p.drift,
          }}
        />
      ))}
    </div>
  );
}
