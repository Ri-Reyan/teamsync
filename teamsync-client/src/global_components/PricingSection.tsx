"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Sparkles } from "lucide-react";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import { useAuthModal } from "@/context/auth.context";

gsap.registerPlugin(ScrollTrigger);

export interface PricingTier {
  name: string;
  package: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  tagline: string;
  price: string;
  originalPrice?: string;
  period: string;
  badge?: string;
  popular: boolean;
  bgColor: string;
  btnBg: string;
  btnText: string;
  features: string[];
}

export const pricingPlans: PricingTier[] = [
  {
    name: "STARTER",
    package: "STARTER",
    tagline: "Perfect for freelancers & small personal projects",
    price: "$0",
    period: "pay once, free forever",
    popular: false,
    bgColor: "bg-white",
    btnBg: "bg-[#FF6B6B]",
    btnText: "text-white",
    features: [
      "Up to 5 team members",
      "Shared Cloud Database",
      "Real-time Kanban Sync (Pusher)",
      "Basic AI Task Summaries (10/mo)",
      "Community Forum Support",
      "Mobile & Web access",
    ],
  },
  {
    name: "PROFESSIONAL",
    package: "PROFESSIONAL",
    tagline: "Pay once and get lifetime access for your growing team",
    price: "$149",
    originalPrice: "$299",
    period: "one-time payment, lifetime access",
    badge: "Most Realistic",
    popular: true,
    bgColor: "bg-black text-white",
    btnBg: "bg-[#FFD93D]",
    btnText: "text-black",
    features: [
      "Up to 25 team members",
      "Multi-workspace Isolation",
      "Sub-second Pusher Sync",
      "Unlimited AI Summaries & Weekly Digests",
      "Role-Based Access Control (RBAC)",
      "Email & Discord Priority Support",
      "Custom Webhooks & REST API Access",
      "All Future Core Updates Included",
    ],
  },
  {
    name: "TEAM / AGENCY",
    package: "ENTERPRISE",
    tagline: "For agencies & studios managing multiple clients",
    price: "$399",
    originalPrice: "$699",
    period: "one-time license fee",
    badge: "Lifetime Deal",
    popular: false,
    bgColor: "bg-white",
    btnBg: "bg-[#FF6B6B]",
    btnText: "text-white",
    features: [
      "Unlimited team members",
      "Unlimited Isolated Workspaces",
      "High-Priority API & Pusher Quotas",
      "Advanced Audit Logs & Activity History",
      "Direct Developer-to-Client Support",
      "Custom Brand Logo on Dashboard",
    ],
  },
];
export default function PricingSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, openAuthModal } = useAuthModal();

  const handlePlanSelection = async (plan: PricingTier) => {
    if (plan.package === "STARTER") {
      openAuthModal("register");
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    try {
      const response = await api.post("/user/payment/checkout", {
        package: plan.package,
      });

      const checkoutUrl = response.data?.data?.url;
      if (!checkoutUrl) {
        throw new Error("Checkout URL was not returned");
      }

      window.location.assign(checkoutUrl);
    } catch (error: unknown) {
      showToast.error(
        error instanceof Error ? error.message : "Unable to start payment.",
      );
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Reveal
      gsap.from(".pricing-header", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      // 2. Pricing Cards Reveal
      gsap.from(".pricing-card", {
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });

      // 3. Sequential Staggered Features Animation
      pricingPlans.forEach((_, cardIndex) => {
        const featureItems = `.feature-item-${cardIndex}`;

        gsap.from(featureItems, {
          x: -20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: `.pricing-card-${cardIndex}`,
            start: "top 70%",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full border-b-4 border-black bg-[#FFFDF5] py-20 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Title Header */}
        <div className="pricing-header text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black">
            LIFETIME ACCESS, <br />
            NO SUBSCRIPTIONS
          </h2>

          <div className="inline-block border-2 border-black bg-[#FFD93D] px-4 py-1.5 neo-shadow-sm font-black text-xs sm:text-sm uppercase">
            Pay once and own your workspace forever
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`pricing-card pricing-card-${idx} relative flex flex-col justify-between neo-border neo-shadow-lg p-6 sm:p-8 ${plan.bgColor}`}
            >
              {/* Most Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 border-2 border-black bg-[#FFD93D] px-4 py-1 font-black text-xs uppercase tracking-wider text-black neo-shadow-sm flex items-center gap-1 z-10">
                  <Sparkles className="size-3.5 fill-black" />
                  <span>MOST POPULAR</span>
                </div>
              )}

              <div>
                {/* Plan Title & Tagline */}
                <div className="text-center pb-6 border-b-2 border-current relative">
                  {/* Discount / Custom Badge */}
                  {plan.badge && (
                    <span className="absolute right-0 top-0 border-2 border-current bg-[#FF6B6B] text-white text-[10px] font-black uppercase px-2 py-0.5 neo-shadow-sm">
                      {plan.badge}
                    </span>
                  )}

                  <h3 className="text-2xl font-black uppercase tracking-wider mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-xs font-bold opacity-80 min-h-8 flex items-center justify-center">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="text-center py-6 border-b-2 border-current space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    {plan.originalPrice && (
                      <span className="text-xl font-bold line-through opacity-60">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-5xl font-black tracking-tight">
                      {plan.price}
                    </span>
                  </div>
                  <div className="text-xs font-black uppercase tracking-wide opacity-80">
                    {plan.period}
                  </div>
                </div>

                {/* Features List */}
                <ul className="py-6 space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className={`feature-item-${idx} flex items-start gap-3 text-sm font-bold`}
                    >
                      <div className="mt-0.5 p-0.5 border-2 border-current bg-[#FFD93D] text-black shrink-0">
                        <Check className="size-3.5 stroke-4" />
                      </div>
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t-2 border-current">
                <button
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full neo-btn py-3.5 px-4 font-black uppercase text-sm tracking-wider cursor-pointer ${plan.btnBg} ${plan.btnText}`}
                >
                  {plan.package === "STARTER"
                    ? "GET STARTED FREE"
                    : "GET LIFETIME ACCESS"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
