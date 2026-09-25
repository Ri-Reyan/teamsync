"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import ReactLenis from "lenis/react";
import { Star } from "lucide-react";
import Image from "next/image";

interface ReviewData {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  bgColor: string;
}

const reviews: ReviewData[] = [
  {
    quote:
      "I used to spend my weekends tracking tasks across spreadsheet tabs. Now TeamSync organizes our multi-tenant workspace and generates AI summaries automatically. Absolute game changer!",
    author: "Jessica K.",
    role: "Product Manager",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bgColor: "bg-white",
  },
  {
    quote:
      "The real-time Kanban board and AI workspace summaries are super responsive. It doesn't feel like rigid enterprise software—it's actually fun to use with the team.",
    author: "Marcus R.",
    role: "Engineering Lead",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bgColor: "bg-[#FFFDF5]",
  },
  {
    quote:
      "Migrated our team from 3 different fragmented tools into TeamSync in under an hour. Managing multi-tenant client projects has never been this seamless.",
    author: "Sarah L.",
    role: "Agile Coach",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bgColor: "bg-white",
  },
];

interface StickyNoteCardProps {
  review: ReviewData;
  index: number;
  centerIndex: number;
  scrollYProgress: MotionValue<number>;
}

const StickyNoteCard = ({
  review,
  index,
  centerIndex,
  scrollYProgress,
}: StickyNoteCardProps) => {
  const distanceFromCenter = index - centerIndex;

  // X Axis Expansion Animation
  const x = useTransform(
    scrollYProgress,
    [0, 0.6],
    [distanceFromCenter * 320, 0],
  );

  // Scale Animation: Small (0.35) to Normal Big Size (1)
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.35, 1]);

  // Y Depth Curve Animation
  const y = useTransform(
    scrollYProgress,
    [0, 0.6],
    [Math.abs(distanceFromCenter) * 60, 0],
  );

  // Slight Tilt Rotation Effect
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.6],
    [distanceFromCenter * 15, 0],
  );

  // Opacity Fade-in
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        rotate,
        opacity,
        transformOrigin: "center",
      }}
      className={`w-full max-w-[320px] p-6 neo-border neo-shadow-lg flex flex-col justify-between shrink-0 ${review.bgColor}`}
    >
      <div>
        {/* Rating Stars */}
        <div className="flex gap-1 mb-4 text-[#FFB800]">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-current stroke-black stroke-[1.5]"
            />
          ))}
        </div>

        {/* User Quote */}
        <p className="text-black font-bold text-sm sm:text-base leading-snug tracking-tight mb-6">
          {`"${review.quote}"`}
        </p>
      </div>

      {/* User Info Footnote */}
      <div className="flex items-center gap-3 pt-4 border-t-2 border-black/10">
        <Image
          src={review.avatar}
          alt={review.author}
          className="size-11 rounded-full neo-border object-cover"
          width={100}
          height={100}
        />
        <div>
          <h4 className="font-black text-sm uppercase text-black leading-tight">
            {review.author}
          </h4>
          <p className="text-xs font-bold text-black/60">{review.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function StickyReviewSection() {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const centerIndex = Math.floor(reviews.length / 2);

  return (
    <ReactLenis root>
      <section
        ref={targetRef}
        className="relative box-border flex h-[180vh] flex-col items-center justify-start overflow-hidden bg-[#95D5B2] border-b-4 border-black py-20 px-4"
      >
        {/* Sticky Container for Pinning animation view */}
        <div className="sticky top-28 flex flex-col items-center justify-center w-full max-w-7xl mx-auto gap-12">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black">
              LOVED BY 10,000+ CREATORS
            </h2>
          </div>

          {/* Sticky Notes Animated Flex Wrapper */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full pt-4">
            {reviews.map((review, index) => (
              <StickyNoteCard
                key={index}
                review={review}
                index={index}
                centerIndex={centerIndex}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </section>
    </ReactLenis>
  );
}
