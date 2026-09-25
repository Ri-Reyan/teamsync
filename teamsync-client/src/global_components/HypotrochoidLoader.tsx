"use client";

import React, { useEffect, useRef } from "react";

interface HypotrochoidLoaderProps {
  size?: number; // Loader height/width in px
  color?: string; // Color of the animation
  showMeta?: boolean; // Show title, tag, and formula
  className?: string;
}

const config = {
  strokeWidth: 4.6,
  particleCount: 82,
  trailSpan: 0.46,
  durationMs: 7600,
  pulseDurationMs: 6200,
  rotationDurationMs: 42000,
  rotate: false,
  spiroR: 8.2,
  spiror: 2.7,
  spirorBoost: 0.45,
  spirod: 4.8,
  spirodBoost: 1.2,
  spiroScale: 3.05,
  point(progress: number, detailScale: number) {
    const t = progress * Math.PI * 2;
    const r = this.spiror + detailScale * this.spirorBoost;
    const d = this.spirod + detailScale * this.spirodBoost;
    const x =
      (this.spiroR - r) * Math.cos(t) +
      d * Math.cos(((this.spiroR - r) / r) * t);
    const y =
      (this.spiroR - r) * Math.sin(t) -
      d * Math.sin(((this.spiroR - r) / r) * t);
    return {
      x: 50 + x * this.spiroScale,
      y: 50 + y * this.spiroScale,
    };
  },
};

export default function HypotrochoidLoader({
  size = 28,
  color = "currentColor",
  showMeta = false,
  className = "",
}: HypotrochoidLoaderProps) {
  const groupRef = useRef<SVGGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const particlesRef = useRef<SVGCircleElement[]>([]);

  useEffect(() => {
    let animationFrameId: number;
    const startedAt = performance.now();

    const normalizeProgress = (progress: number) => ((progress % 1) + 1) % 1;

    const getDetailScale = (time: number) => {
      const pulseProgress =
        (time % config.pulseDurationMs) / config.pulseDurationMs;
      const pulseAngle = pulseProgress * Math.PI * 2;
      return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
    };

    const buildPath = (detailScale: number, steps = 480) => {
      return Array.from({ length: steps + 1 }, (_, index) => {
        const point = config.point(index / steps, detailScale);
        return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      }).join(" ");
    };

    const getParticle = (
      index: number,
      progress: number,
      detailScale: number,
    ) => {
      const tailOffset = index / (config.particleCount - 1);
      const point = config.point(
        normalizeProgress(progress - tailOffset * config.trailSpan),
        detailScale,
      );
      const fade = Math.pow(1 - tailOffset, 0.56);
      return {
        x: point.x,
        y: point.y,
        radius: 0.9 + fade * 2.7,
        opacity: 0.04 + fade * 0.96,
      };
    };

    const render = (now: number) => {
      const time = now - startedAt;
      const progress = (time % config.durationMs) / config.durationMs;
      const detailScale = getDetailScale(time);

      if (pathRef.current) {
        pathRef.current.setAttribute("d", buildPath(detailScale));
      }

      particlesRef.current.forEach((node, index) => {
        if (node) {
          const particle = getParticle(index, progress, detailScale);
          node.setAttribute("cx", particle.x.toFixed(2));
          node.setAttribute("cy", particle.y.toFixed(2));
          node.setAttribute("r", particle.radius.toFixed(2));
          node.setAttribute("opacity", particle.opacity.toFixed(3));
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className={`inline-flex items-center justify-center leading-none ${className}`}
    >
      <div
        style={{ width: size, height: size }}
        className="aspect-square shrink-0"
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          style={{ color }}
        >
          <g ref={groupRef}>
            <path
              ref={pathRef}
              stroke="currentColor"
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.1"
              fill="none"
            />
            {Array.from({ length: config.particleCount }).map((_, i) => (
              <circle
                key={i}
                ref={(el) => {
                  if (el) particlesRef.current[i] = el;
                }}
                fill="currentColor"
              />
            ))}
          </g>
        </svg>
      </div>

      {showMeta && (
        <div className="text-center font-sans text-white/80">
          <h3 className="text-lg font-bold">Hypotrochoid Loop</h3>
          <p className="text-xs uppercase tracking-widest text-white/50">
            Inner Spirograph
          </p>
        </div>
      )}
    </div>
  );
}
