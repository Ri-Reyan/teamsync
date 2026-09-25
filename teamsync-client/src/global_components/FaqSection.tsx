"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Plus, Minus, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: string;
}

const faqsData: FAQItem[] = [
  {
    question: "HOW DOES THE FREE TRIAL WORK?",
    answer:
      "You get 14 days of full access to all Professional features. No credit card required. At the end of the trial, you can downgrade to our $0 Free Forever plan or choose a paid tier.",
  },
  {
    question: "CAN I CHANGE PLANS LATER?",
    answer:
      "Yes! You can upgrade, downgrade, or cancel your subscription at any time directly from your workspace settings with instant pro-rated billing.",
  },
  {
    question: "WHAT PAYMENT METHODS DO YOU ACCEPT?",
    answer:
      "We support all major credit cards (Visa, Mastercard, American Express), PayPal, and invoice-based payments for Enterprise customers via Stripe.",
  },
  {
    question: "IS MY DATA SECURE?",
    answer:
      "Absolutely. Each multi-tenant workspace operates under isolated database schemas with strict Role-Based Access Control (RBAC) and end-to-end encryption.",
  },
  {
    question: "DO YOU OFFER DISCOUNTS FOR ANNUAL PLANS?",
    answer:
      "Yes, opting for annual billing gives you a 20% discount across all paid tiers compared to monthly billing.",
  },
  {
    question: "WHAT KIND OF SUPPORT DO YOU PROVIDE?",
    answer:
      "Free users receive community and email support. Professional and Enterprise plans get 24/7 priority support and dedicated success managers.",
  },
];

export default function FaqSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useGSAP(
    () => {
      // Header Animation
      gsap.from(".faq-header", {
        y: -16,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      // FAQ Items Staggered Animation with ClearProps to prevent opacity glitches
      gsap.from(".faq-item", {
        y: 30,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "opacity,transform", // অ্যানিমেশন শেষে inline opacity ও transform ক্লিয়ার করে দিবে
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    },
    { scope: containerRef },
  );

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full border-b-4 border-black bg-[#FFD93D] py-20 px-4 sm:px-6 overflow-hidden"
    >
      <div className="max-w-4xl mx-auto">
        {/* Title Header with Stars */}
        <div className="faq-header flex items-center justify-center gap-4 sm:gap-6 mb-12 text-center">
          <Star className="size-8 sm:size-10 fill-black text-black shrink-0" />
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black leading-tight">
            FREQUENTLY ASKED <br className="hidden sm:inline" /> QUESTIONS
          </h2>
          <Star className="size-8 sm:size-10 fill-black text-black shrink-0" />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqsData.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="faq-item neo-border bg-white neo-shadow transition-all duration-200"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-yellow-50/50 transition-colors"
                >
                  <span className="font-black text-base sm:text-lg uppercase tracking-wide text-black">
                    {faq.question}
                  </span>

                  <div className="neo-border bg-[#FFD93D] p-1.5 shrink-0 text-black">
                    {isOpen ? (
                      <Minus className="size-5 stroke-3" />
                    ) : (
                      <Plus className="size-5 stroke-3" />
                    )}
                  </div>
                </button>

                {/* Collapsible Answer */}
                {isOpen && (
                  <div className="p-4 sm:p-5 border-t-4 border-black bg-[#FFFDF5] font-bold text-sm sm:text-base text-black/90 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
