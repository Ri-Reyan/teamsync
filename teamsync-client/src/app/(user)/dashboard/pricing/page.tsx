"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { isAxiosError } from "axios";
import { api } from "@/lib/axios";
import { showToast } from "@/lib/toast";
import { useAuthModal } from "@/context/auth.context";
import {
  pricingPlans,
  type PricingTier,
} from "@/global_components/PricingSection";

const paidPlans = pricingPlans.filter((plan) => plan.package !== "STARTER");

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PricingTier>(
    pricingPlans.find((plan) => plan.package === "PROFESSIONAL") ??
      pricingPlans[0],
  );
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const { isAuthenticated, openAuthModal } = useAuthModal();

  const handleCheckout = async () => {
    if (selectedPlan.package === "STARTER") {
      router.push("/dashboard");
      return;
    }

    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    try {
      setIsStartingCheckout(true);
      const response = await api.post("/user/payment/checkout", {
        package: selectedPlan.package,
      });
      const checkoutUrl = response.data?.data?.url;

      if (!checkoutUrl) {
        throw new Error("Checkout URL was not returned");
      }

      window.location.assign(checkoutUrl);
    } catch (error: unknown) {
      showToast.error(
        isAxiosError(error)
          ? error.response?.data?.message || "Unable to start checkout."
          : "Unable to start checkout.",
      );
    } finally {
      setIsStartingCheckout(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFFDF5] px-4 py-6 text-black sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 border-b-4 border-black pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-black uppercase underline underline-offset-4 focus:outline-none focus:ring-4 focus:ring-[#4D96FF]"
            >
              <ArrowLeft className="h-4 w-4 stroke-3" />
              Back to dashboard
            </Link>
            <div>
              <p className="mb-2 inline-flex items-center gap-2 border-2 border-black bg-[#FFD93D] px-3 py-1 text-xs font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="h-4 w-4 fill-black" />
                Lifetime access
              </p>
              <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
                Pick your power level.
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-bold text-gray-700 sm:text-base">
                One payment. No subscriptions. Your workspace stays yours.
              </p>
            </div>
          </div>
          <div className="border-3 border-black bg-white px-4 py-3 text-right shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase text-gray-500">
              Secure checkout
            </p>
            <p className="flex items-center justify-end gap-2 text-sm font-black uppercase">
              <LockKeyhole className="h-4 w-4" /> Powered by Stripe
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <section aria-labelledby="plans-heading">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id="plans-heading" className="text-xl font-black uppercase">
                Choose a plan
              </h2>
              <span className="text-xs font-black uppercase text-gray-500">
                {selectedPlan.name} selected
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {paidPlans.map((plan) => {
                const isSelected = selectedPlan.package === plan.package;

                return (
                  <button
                    key={plan.package}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedPlan(plan)}
                    className={`group relative flex min-h-97.5 flex-col justify-between border-4 border-black p-6 text-left shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[#4D96FF] ${
                      isSelected ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-4 left-5 border-2 border-black bg-[#FFD93D] px-3 py-1 text-[10px] font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        Recommended
                      </span>
                    )}
                    <div>
                      <div className="flex items-start justify-between gap-4 border-b-2 border-current pb-5">
                        <div>
                          <p className="text-2xl font-black uppercase">
                            {plan.name}
                          </p>
                          <p className="mt-2 text-xs font-bold opacity-75">
                            {plan.tagline}
                          </p>
                        </div>
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-current ${
                            isSelected
                              ? "bg-[#FFD93D] text-black"
                              : "bg-[#4D96FF] text-white"
                          }`}
                        >
                          {isSelected && <Check className="h-5 w-5 stroke-3" />}
                        </div>
                      </div>
                      <div className="border-b-2 border-current py-5">
                        <p className="text-5xl font-black">{plan.price}</p>
                        <p className="mt-1 text-[11px] font-black uppercase opacity-75">
                          {plan.period}
                        </p>
                      </div>
                      <ul className="space-y-3 pt-5">
                        {plan.features.slice(0, 5).map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2 text-sm font-bold"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 stroke-3 text-[#6BCB77]" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <span className="mt-6 border-2 border-current px-4 py-3 text-center text-xs font-black uppercase">
                      {isSelected ? "Selected plan" : "Select plan"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <div className="border-4 border-black bg-[#4D96FF] p-5 text-white shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-5 flex items-center gap-3 border-b-2 border-black pb-4 text-black">
                <div className="border-2 border-black bg-[#FFD93D] p-2">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-black uppercase">Demo card</p>
                  <p className="text-xs font-bold">Stripe test mode only</p>
                </div>
              </div>
              <p className="mb-2 text-[11px] font-black uppercase text-white/80">
                Card number
              </p>
              <div className="border-2 border-black bg-white px-3 py-3 font-mono text-sm font-bold tracking-wider text-black">
                4242 4242 4242 4242
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase text-white/80">
                    Expiry
                  </p>
                  <div className="border-2 border-black bg-white px-3 py-3 font-mono text-sm font-bold text-black">
                    12/34
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-black uppercase text-white/80">
                    CVC
                  </p>
                  <div className="border-2 border-black bg-white px-3 py-3 font-mono text-sm font-bold text-black">
                    123
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs font-bold text-white/90">
                Use any future expiry date and ZIP code. No real charge is made.
              </p>
            </div>

            <div className="border-4 border-black bg-[#6BCB77] p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-end justify-between gap-4 border-b-2 border-black pb-4">
                <div>
                  <p className="text-xs font-black uppercase">Your selection</p>
                  <p className="mt-1 text-2xl font-black uppercase">
                    {selectedPlan.name}
                  </p>
                </div>
                <p className="text-3xl font-black">{selectedPlan.price}</p>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isStartingCheckout}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 border-3 border-black bg-black px-4 py-3 text-sm font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-white"
              >
                <LockKeyhole className="h-4 w-4" />
                {isStartingCheckout
                  ? "Opening Stripe..."
                  : "Continue to payment"}
              </button>
              <p className="mt-3 text-center text-[11px] font-bold text-black/70">
                You will complete payment on Stripe&apos;s secure page.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
