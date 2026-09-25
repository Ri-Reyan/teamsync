"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HypotrochoidLoader from "@/global_components/HypotrochoidLoader";
import { useAuthModal } from "@/context/auth.context";

export default function SSOCallbackPage() {
  const router = useRouter();

  const { setIsAuthenticated } = useAuthModal();

  useEffect(() => {
    // Back-end httpOnly cookie সেট করে দেওয়ার পর ফ্রন্টএন্ড স্টেট রিফ্রেশ
    router.refresh();

    setIsAuthenticated(true);

    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, setIsAuthenticated]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FFFDF5]">
      <div className="flex flex-col items-center gap-4 border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <HypotrochoidLoader size={80} color="#000000" />
        <h2 className="text-xl font-black uppercase text-black">
          Authenticating with Google...
        </h2>
        <p className="text-xs font-bold text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  );
}
