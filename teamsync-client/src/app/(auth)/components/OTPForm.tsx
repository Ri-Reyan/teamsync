"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { AuthSubmitButton } from "./RegisterForm";
import { useAuthModal } from "@/context/auth.context";
import { otpSchema } from "@/schemas/auth.schemas";

interface OTPFormProps {
  email: string;
}

const OTPForm = ({ email }: OTPFormProps) => {
  const router = useRouter();
  const { closeAuthModal, setIsAuthenticated, setUser } = useAuthModal();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validation = otpSchema.safeParse({ otp });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/verify-email", { email, otp });

      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        closeAuthModal();
        router.refresh();
        router.push("/dashboard");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Verification failed. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-black uppercase text-black">
          Enter Verification Code
        </h3>
        <p className="mt-1 text-xs font-bold text-gray-600">
          We sent a code to{" "}
          <span className="text-black underline">{email}</span>
        </p>
      </div>

      {error && (
        <div className="border-2 border-black bg-[#FF6B6B] p-2.5 text-center text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          className="w-full border-2 border-black bg-white p-3 text-center text-2xl font-black tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none"
        />
      </div>

      <AuthSubmitButton isSubmitting={isSubmitting} label="VERIFY EMAIL" />
    </form>
  );
};

export default OTPForm;
