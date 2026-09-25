"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface StatItem {
  label: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  highlight?: boolean;
}

const statsData: StatItem[] = [
  { label: "ACTIVE USERS", rawValue: 500, suffix: "k+" },
  {
    label: "UPTIME SLA",
    rawValue: 99.99,
    suffix: "%",
    decimals: 2,
    highlight: true,
  },
  { label: "SUPPORT ACCESS", rawValue: 24, suffix: "/7" },
  { label: "CUSTOMER SAVINGS", rawValue: 10, prefix: "$", suffix: "M+" },
];

export default function StatsSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Cards Entrance Animation
      gsap.from(".stat-card", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      // 2. Count-Up Animation for Numbers
      statsData.forEach((stat, index) => {
        const el = numberRefs.current[index];
        if (!el) return;

        const obj = { val: 0 };

        gsap.to(obj, {
          val: stat.rawValue,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
          },
          onUpdate: () => {
            if (stat.decimals) {
              el.textContent = obj.val.toFixed(stat.decimals);
            } else {
              el.textContent = Math.floor(obj.val).toString();
            }
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full bg-black text-white border-y-4 border-black py-12 px-4 sm:px-6 font-mono"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {statsData.map((stat, idx) => (
          <div
            key={idx}
            className={`stat-card relative flex flex-col justify-between p-6 neo-border neo-shadow-sm transition-transform hover:-translate-y-1 ${
              stat.highlight
                ? "bg-[#FF6B6B] text-black border-black"
                : "bg-black text-white border-white/20 hover:border-white"
            }`}
          >
            {/* Label Header */}
            <div className="mb-6">
              <span
                className={`text-xs sm:text-sm font-black uppercase tracking-widest ${
                  stat.highlight ? "text-black" : "text-gray-400"
                }`}
              >
                {stat.label}
              </span>
            </div>

            {/* Value Counter */}
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
              {stat.prefix && <span>{stat.prefix}</span>}
              <span
                ref={(el) => {
                  numberRefs.current[idx] = el;
                }}
              >
                0
              </span>
              {stat.suffix && <span>{stat.suffix}</span>}
            </div>

            {/* Bottom Accent Line */}
            <div
              className={`h-2.5 w-full ${
                stat.highlight ? "bg-black" : "bg-gray-800"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
