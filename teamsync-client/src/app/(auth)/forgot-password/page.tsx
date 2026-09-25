"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";
import { api } from "@/lib/axios";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/forgot-password", { email });

      if (response.data.success) {
        setMessage(
          response.data.message ||
            "Password reset instructions have been sent to your email.",
        );
        setEmail("");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to process request. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF5] p-4">
      <div className="relative w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex items-center gap-2 border-2 border-black bg-[#FFD93D] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <KeyRound className="size-6 text-black" />
          </div>
          <h2 className="text-2xl font-black uppercase text-black">
            Forgot Password?
          </h2>
          <p className="mt-1 text-xs font-bold text-gray-600">
            Enter your registered email and we&apos;ll send you a reset link.
          </p>
        </div>

        {message && (
          <div className="mb-4 border-2 border-black bg-[#4E2A84] p-3 text-center text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 border-2 border-black bg-[#FF6B6B] p-3 text-center text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              className="block text-sm font-bold text-black"
              htmlFor="forgot-email"
            >
              Email Address
            </label>
            <input
              id="forgot-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full border-2 border-black bg-white p-3 font-medium text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full items-center justify-center border-2 border-black bg-[#FF6B6B] px-4 py-3 text-base font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#FF5252] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? (
              <HypotrochoidLoader size={24} color="#FFFFFF" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 border-t-2 border-black pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-black text-black hover:text-red-500 hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
