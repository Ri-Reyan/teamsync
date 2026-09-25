"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { KineticFabric } from "./KineticFabric";
import { useAuthModal } from "@/context/auth.context";

export default function HeroSection() {
  const router = useRouter();
  const { openAuthModal, user, isAuthenticated } = useAuthModal();

  // বাটনের ক্লিক হ্যান্ডলার
  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      router.push("/dashboard");
    } else if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      openAuthModal("login");
    }
  };

  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden border-b-4 border-black bg-[#FFFDF5] pt-12 pb-20">
      {/* Background Physics Fabric */}
      <div className="absolute inset-0 z-0 opacity-80">
        <KineticFabric />
      </div>

      {/* Foreground Hero Content Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="absolute right-4 top-0 z-20 inline-flex min-h-11 items-center gap-2 border-2 border-black bg-white px-3 py-2 font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-0.5 hover:bg-[#B9F227] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-4 focus:ring-[#62D7FF] sm:right-6 sm:px-4"
          aria-label="Login as admin"
        >
          <ShieldCheck className="size-4" />
          <span>Admin login</span>
        </button>

        {/* Top Floating Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex -rotate-2 items-center gap-2 border-4 border-black bg-[#FFD93D] px-4 py-1.5 neo-shadow font-black uppercase text-xs sm:text-sm tracking-wider">
            <Zap className="size-4 fill-black" />
            <span>Real-time Multi-tenant SaaS Platform</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
            Manage Tasks At The <br />
            <span className="bg-[#FF6B6B] text-white px-3 py-1 border-4 border-black inline-block rotate-1 neo-shadow-sm mt-2">
              Speed Of Light.
            </span>
          </h1>

          <p className="pt-4 text-lg sm:text-xl md:text-2xl font-bold max-w-2xl mx-auto text-black/90">
            Isolated workspaces, real-time Kanban sync, automated AI summaries,
            and multi-tenant security built for high-velocity teams.
          </p>
        </div>

        {/* CTA Button Group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 z-20">
          {/* Start Free Trial Button */}
          <button
            type="button"
            onClick={handleAction}
            className="w-full sm:w-auto neo-btn bg-[#FF6B6B] text-white px-8 py-4 text-lg sm:text-xl font-black uppercase flex items-center justify-center gap-3 tracking-wide"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="size-6 stroke-3" />
          </button>

          {/* Explore Demo Button */}
          <button
            type="button"
            onClick={handleAction}
            className="w-full sm:w-auto neo-btn bg-white text-black px-8 py-4 text-lg sm:text-xl font-black uppercase flex items-center justify-center gap-2 tracking-wide"
          >
            <span>Explore Demo</span>
          </button>
        </div>

        {/* Floating Interactive Neo-Brutalism Cards (Product Teasers) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Multi-Tenancy */}
          <div className="neo-border bg-[#C4B5FD] p-5 neo-shadow -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-xs uppercase bg-black text-white px-2 py-0.5">
                Multi-Tenant
              </span>
              <ShieldCheck className="size-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-xl uppercase mb-1">
              Isolated Workspaces
            </h3>
            <p className="font-bold text-sm text-black/80">
              Role-based access control (RBAC) keeping tenant data completely
              isolated.
            </p>
          </div>

          {/* Card 2: Real-time Pusher */}
          <div className="neo-border bg-white p-5 neo-shadow rotate-2 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-xs uppercase bg-[#FF6B6B] text-white px-2 py-0.5">
                Pusher Live
              </span>
              <Users className="size-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-xl uppercase mb-1">
              Real-time Kanban
            </h3>
            <p className="font-bold text-sm text-black/80">
              Drag-and-drop task synchronization across all connected members
              instantly.
            </p>
          </div>

          {/* Card 3: AI Weekly Summary */}
          <div className="neo-border bg-[#FFD93D] p-5 neo-shadow -rotate-2 hover:rotate-0 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="font-black text-xs uppercase bg-black text-white px-2 py-0.5">
                AI Powered
              </span>
              <Bot className="size-6 stroke-[2.5]" />
            </div>
            <h3 className="font-black text-xl uppercase mb-1">
              Weekly Summaries
            </h3>
            <p className="font-bold text-sm text-black/80">
              Auto-generate project digests from task comments and statuses in
              seconds.
            </p>
          </div>
        </div>

        {/* Feature Pill Highlights */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm font-black uppercase">
          <div className="flex items-center gap-2 bg-white px-3 py-1 border-2 border-black">
            <CheckCircle2 className="size-4 text-[#FF6B6B] stroke-3" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1 border-2 border-black">
            <CheckCircle2 className="size-4 text-[#FF6B6B] stroke-3" />
            <span>Instant Pusher Sync</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1 border-2 border-black">
            <CheckCircle2 className="size-4 text-[#FF6B6B] stroke-3" />
            <span>Stripe Billing Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
}
