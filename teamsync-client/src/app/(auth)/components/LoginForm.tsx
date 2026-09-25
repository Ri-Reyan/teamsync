"use client";

import { useAuthModal } from "@/context/auth.context";
import { Divider } from "./AuthModal";
import { AuthSubmitButton } from "./RegisterForm";
import { useState, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { loginSchema } from "@/schemas/auth.schemas";

export default function LoginForm() {
  const router = useRouter();
  const { setAuthMode, closeAuthModal, setUser, setIsAuthenticated } =
    useAuthModal();
  const [formData, setFormData] = useState({
    email: "user@example.com",
    password: "user1234",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/login", formData);

      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        closeAuthModal();
        router.refresh(); // Global auth state sync করার জন্য
        router.push("/dashboard");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Invalid credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div>
      <form onSubmit={submitHandler} className="w-full space-y-4">
        {error && (
          <div className="border-2 border-black bg-[#FF6B6B] p-2.5 text-center text-sm font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label
            className="block text-sm font-bold text-black"
            htmlFor="login-email"
          >
            Email Address
          </label>
          <input
            id="login-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="name@example.com"
            className="w-full border-2 border-black bg-white p-3 font-medium text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none"
          />
        </div>

        <div className="space-y-1">
          <div className="flex flex-row justify-between items-center">
            <label
              className="block text-sm font-bold text-black"
              htmlFor="login-password"
            >
              Password
            </label>
            <Link
              className="text-xs font-bold text-red-500 underline hover:text-red-600"
              href="/forgot-password"
              onClick={closeAuthModal}
            >
              Forgot?
            </Link>
          </div>
          <div className="relative flex items-center">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
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

        <AuthSubmitButton isSubmitting={isSubmitting} label="SIGN IN" />

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-2 border-2 border-black bg-white p-3 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>
      </form>

      <Divider />

      <div className="text-center">
        <button
          type="button"
          className="text-sm font-bold text-black"
          onClick={() => setAuthMode("register")}
        >
          Don&apos;t have an account?{" "}
          <span className="text-red-500 underline cursor-pointer">
            Register
          </span>
        </button>
      </div>
    </div>
  );
}
