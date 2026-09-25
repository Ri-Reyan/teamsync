"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/axios";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      if (response.data.success) {
        router.push("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Link may be expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 border-2 border-black bg-[#4E2A84] p-3 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck className="size-6" />
        </div>
        <h2 className="text-2xl font-black uppercase text-black">
          Set New Password
        </h2>
        <p className="mt-1 text-xs font-bold text-gray-600">
          Enter your new password below to recover your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 border-2 border-black bg-[#FF6B6B] p-3 text-center text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label
            className="block text-sm font-bold text-black"
            htmlFor="new-password"
          >
            New Password
          </label>
          <div className="relative flex items-center">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-2 border-black bg-white p-3 pr-10 font-medium text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-black hover:opacity-70"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label
            className="block text-sm font-bold text-black"
            htmlFor="confirm-password"
          >
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
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
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFDF5] p-4">
      <Suspense
        fallback={
          <div className="border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <HypotrochoidLoader size={48} color="#000000" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
