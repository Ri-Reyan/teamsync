"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { Zap, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  return (
    <footer
      ref={containerRef}
      className="relative min-h-[160vh] w-full overflow-hidden border-t-4 border-black bg-[#FFD93D] text-black px-6 pt-24 pb-12 flex flex-col justify-between font-mono"
    >
      {/* Background Animated SVG Stroke Path - Shifted to Left with Blood Red Color */}
      <LinePath
        className="absolute left-[-25%] sm:left-[-15%] top-[-5%] z-0 pointer-events-none opacity-30 md:opacity-50"
        scrollYProgress={scrollYProgress}
      />

      {/* Hero / Final CTA Section */}
      <div className="relative z-10 max-w-5xl mx-auto text-center mt-12 space-y-8">
        <div className="inline-flex items-center gap-2 border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Zap className="size-4 fill-black stroke-black" />
          <span>Real-time Workspace SaaS</span>
        </div>

        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-none text-black">
          Ready to sync <br />
          <span className="bg-[#C4B5FD] px-3 border-4 border-black inline-block mt-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            your workflow?
          </span>
        </h2>

        <p className="max-w-xl mx-auto text-sm md:text-base font-bold text-black/80 leading-relaxed bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Empower your team with AI summaries, real-time Kanban boards, and
          multi-tenant workspaces. Built for modern product teams.
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <a
            href="#signup"
            className="inline-flex items-center gap-3 border-4 border-black bg-[#C4B5FD] px-8 py-4 text-base font-black uppercase text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <span>Create Workspace</span>
            <ArrowUpRight className="size-5 stroke-3" />
          </a>
        </div>
      </div>

      {/* Footer Navigation & Details */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mt-32 pt-12 border-t-4 border-black space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-2xl font-black uppercase tracking-widest text-black flex items-center gap-2">
              <div className="bg-black text-white p-1">
                <Zap className="size-5 fill-yellow-400 stroke-yellow-400" />
              </div>
              TeamSync
            </h3>
            <p className="text-xs md:text-sm font-bold text-black/80 leading-relaxed">
              Real-time multi-tenant SaaS collaboration platform featuring
              role-based access, AI summaries, and seamless team interactions
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-widest underline underline-offset-4 decoration-2">
              Navigation
            </span>
            <ul className="space-y-2 text-sm font-bold uppercase">
              <li>
                <a href="#features" className="hover:underline">
                  Features
                </a>
              </li>
              <li>
                <a href="#kanban" className="hover:underline">
                  Kanban Board
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="hover:underline">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Stack Info */}
          <div className="md:col-span-4 space-y-3 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-widest underline underline-offset-4 decoration-2">
              Architecture
            </span>
            <p className="text-xs font-bold text-black/80 leading-relaxed">
              Powered by Next.js, Node.js, Pusher, PostgreSQL (Prisma), Redis,
              and Stripe Integration
            </p>
          </div>
        </div>

        {/* Bottom Credits & Socials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t-4 border-black font-black text-xs uppercase">
          <p>
            © {new Date().getFullYear()} TeamSync SaaS. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/Ri-Reyan"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors"
            >
              <span>Github</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/i-reyannn"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors"
            >
              <span>LinkedIn</span>
            </Link>
            <Link
              href="https://www.instagram.com/i.reyannn/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black bg-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white transition-colors"
            >
              <span>Instagram</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Custom Animated Stroke Path Component (Blood Red & Left Aligned)
const LinePath = ({
  className,
  scrollYProgress,
}: {
  className: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scrollYProgress: any;
}) => {
  const pathLength = useTransform(scrollYProgress, [0, 1], [0.1, 1]);

  return (
    <svg
      width="1278"
      height="2319"
      viewBox="0 0 1278 2319"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <motion.path
        d="
          M876.605 394.131
          C788.982 335.917 696.198 358.139 691.836 416.303
          C685.453 501.424 853.722 498.43 941.95 409.714
          C1016.1 335.156 1008.64 186.907 906.167 142.846
          C807.014 100.212 712.699 198.494 789.049 245.127
          C889.053 306.207 986.062 116.979 840.548 43.3233
          C743.932 -5.58141 678.027 57.1682 672.279 112.188
          C666.53 167.208 712.538 172.943 736.353 163.088
          C760.167 153.234 764.14 120.924 746.651 93.3868
          C717.461 47.4252 638.894 77.8642 601.018 116.979
          C568.164 150.908 557 201.079 576.467 246.924
          C593.342 286.664 630.24 310.55 671.68 302.614
          C756.114 286.446 729.747 206.546 681.86 186.442
          C630.54 164.898 492 209.318 495.026 287.644
          C496.837 334.494 518.402 366.466 582.455 367.287
          C680.013 368.538 771.538 299.456 898.634 292.434
          C1007.02 286.446 1192.67 309.384 1242.36 382.258
          C1266.99 418.39 1273.65 443.108 1247.75 474.477
          C1217.32 511.33 1149.4 511.259 1096.84 466.093
          C1044.29 420.928 1029.14 380.576 1033.97 324.172
          C1038.31 273.428 1069.55 228.986 1117.2 216.384
          C1152.2 207.128 1188.29 213.629 1194.45 245.127
          C1201.49 281.062 1132.22 280.104 1100.44 272.673
          C1065.32 264.464 1044.22 234.837 1032.77 201.413
          C1019.29 162.061 1029.71 131.126 1056.44 100.965
          C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513
          C1207.02 117.17 1186.81 143.379 1156.22 166.691
          C1112.57 199.959 1052.57 186.238 999.784 155.164
          C957.312 130.164 899.171 63.7054 931.284 26.3214
          C952.068 2.12513 996.288 3.87363 1007.22 43.58
          C1018.15 83.2749 1003.56 122.644 975.969 163.376
          C948.377 204.107 907.272 255.122 913.558 321.045
          C919.727 385.734 990.968 497.068 1063.84 503.35
          C1111.46 507.456 1166.79 511.984 1175.68 464.527
          C1191.52 379.956 1101.26 334.985 1030.29 377.017
          C971.109 412.064 956.297 483.647 953.797 561.655
          C947.587 755.413 1197.56 941.828 936.039 1140.66
          C745.771 1285.32 321.926 950.737 134.536 1202.19
          C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5
          C478.381 1956.91 1124.19 1515 1201.28 1997.83
          C1273.66 2451.23 100.805 1864.7 303.794 2668.89
        "
        stroke="#8B0000"
        strokeWidth="18"
        strokeLinecap="square"
        style={{
          pathLength,
          strokeDashoffset: useTransform(pathLength, (value) => 1 - value),
        }}
      />
    </svg>
  );
};
