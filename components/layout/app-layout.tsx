"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const publicRoutes = ["/login"];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen md:h-screen min-h-[100dvh] overflow-hidden">
      {/* Sidebar Desktop - sempre visível em md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Sidebar Mobile - overlay */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar Mobile */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-white to-purple-50 border-r border-border md:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-foreground p-4 md:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px)+20px)] md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
