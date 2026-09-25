"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  BringToFront,
  MessageSquareX,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface ProblemCard {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgBg: string;
  rotation: string;
}

const problems: ProblemCard[] = [
  {
    id: "01",
    badge: "CHAOTIC SYNC",
    title: "Siloed Workspaces & Stale Data",
    description:
      "Team members waste hours hunting for updates across fragmented tools and outdated task boards.",
    icon: <BringToFront className="size-8 stroke-[2.5]" />,
    bgBg: "bg-[#FFD93D]", // Vivid Yellow
    rotation: "-rotate-2",
  },
  {
    id: "02",
    badge: "SECURITY RISK",
    title: "Leaky Multi-Tenancy Isolation",
    description:
      "Traditional SaaS setups risk cross-tenant data leaks due to weak role-based security boundaries.",
    icon: <ShieldAlert className="size-8 stroke-[2.5]" />,
    bgBg: "bg-[#FF6B6B]", // Hot Red
    rotation: "rotate-1",
  },
  {
    id: "03",
    badge: "NO VISIBILITY",
    title: "Drowning in Unstructured Chat",
    description:
      "Critical decisions get buried in endless chat threads with zero automated summaries or insights.",
    icon: <MessageSquareX className="size-8 stroke-[2.5]" />,
    bgBg: "bg-[#C4B5FD]", // Soft Purple
    rotation: "-rotate-1",
  },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".problem-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      // Staggered Cards Reveal & Scale
      gsap.from(cardsRef.current, {
        y: 80,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full border-b-4 border-black bg-[#FFFDF5] py-20 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="problem-header text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 neo-border bg-[#FF6B6B] text-white px-4 py-1 neo-shadow-sm font-black text-xs sm:text-sm uppercase tracking-wider">
            <Flame className="size-4 fill-white" />
            <span>THE OLD WAY IS BROKEN</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-tight">
            Stop Fighting Your <br />
            <span className="bg-[#FFD93D] px-2 border-2 border-black inline-block -rotate-1">
              Project Tools.
            </span>
          </h2>

          <p className="font-bold text-lg text-black/80">
            Most SaaS platforms force teams to choose between real-time speed
            and strict enterprise security. You get neither.
          </p>
        </div>

        {/* Animated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {problems.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                cardsRef.current[idx] = el;
              }}
              className={`neo-border ${item.bgBg} p-6 neo-shadow-lg ${item.rotation} hover:rotate-0 transition-transform duration-200 flex flex-col justify-between`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-black text-xs uppercase bg-black text-white px-2 py-1">
                    PROBLEM {item.id}
                  </span>
                  <div className="p-2 bg-white neo-border neo-shadow-sm">
                    {item.icon}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="font-black text-xs uppercase underline tracking-wider">
                    {item.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black uppercase mb-3 text-black leading-tight">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="font-bold text-sm text-black/90 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Decorative Warning Sticker */}
              <div className="mt-8 pt-4 border-t-2 border-black flex items-center gap-2 text-xs font-black uppercase">
                <AlertTriangle className="size-4 text-black" />
                <span>Impact: High Friction</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
