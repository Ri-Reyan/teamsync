import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/context/auth.context";
import AuthModal from "@/app/(auth)/components/AuthModal";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "TeamSync | Real-time Multi-tenant Collaboration SaaS",
  description:
    "Manage tasks, workspaces, and real-time collaboration with AI summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.className} antialiased bg-[#FFFDF5] text-black`}
      >
        <AuthProvider>
          {children}
          <AuthModal />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
