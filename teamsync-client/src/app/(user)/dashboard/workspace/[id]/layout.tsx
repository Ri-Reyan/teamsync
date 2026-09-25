"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Users, UserPlus, ArrowLeft, Menu, X } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params.id as string;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      name: "Projects",
      href: `/dashboard/workspace/${workspaceId}/projects`,
      icon: LayoutGrid,
    },
    {
      name: "Members",
      href: `/dashboard/workspace/${workspaceId}/members`,
      icon: Users,
    },
    {
      name: "Invite",
      href: `/dashboard/workspace/${workspaceId}/invite`,
      icon: UserPlus,
    },
  ];

  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#FFFDF5] text-black">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close workspace menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      <aside
        id="workspace-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(18rem,calc(100vw-2rem))] flex-col justify-between border-r-4 border-black bg-white p-5 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500">
              Workspace Menu
            </span>
            <button
              type="button"
              aria-label="Close workspace menu"
              onClick={() => setIsSidebarOpen(false)}
              className="flex min-h-11 min-w-11 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Back to Workspaces */}
          <Link
            href="/dashboard"
            onClick={() => setIsSidebarOpen(false)}
            className="mb-8 flex items-center gap-2 border-2 border-black bg-[#FFD93D] p-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe056]"
          >
            <ArrowLeft className="h-4 w-4 stroke-3" /> All Workspaces
          </Link>

          <h2 className="mb-6 text-sm font-black uppercase tracking-wider text-gray-500">
            Workspace Menu
          </h2>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 border-2 border-black p-3 font-extrabold uppercase transition-all ${
                    isActive
                      ? "bg-[#FF6B6B] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-0.5"
                      : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <Icon className="h-5 w-5 stroke-[2.5]" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t-2 border-black pt-4 text-xs font-bold uppercase text-gray-500">
          ID: {workspaceId.slice(0, 8)}...
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <main className="min-w-0 flex-1 px-4 pb-6 pt-20 sm:px-6 lg:p-8">
        <button
          type="button"
          aria-label="Open workspace menu"
          aria-controls="workspace-sidebar"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed left-4 top-4 z-20 flex min-h-11 min-w-11 items-center justify-center border-2 border-black bg-[#FFD93D] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ffe056] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {children}
      </main>
    </div>
  );
}
