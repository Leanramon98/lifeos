"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CommandPalette } from "@/components/command-palette/CommandPalette";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // If not loading workspaces and we have 0 active workspaces, force onboarding
    // unless they explicitly skipped it
    const skipped = typeof window !== 'undefined' ? localStorage.getItem('leso_onboarding_skipped') === 'true' : false;
    
    if (!loading && user && !isLoadingWorkspaces && workspaces.length === 0 && pathname !== '/onboarding' && !skipped) {
      router.push("/onboarding");
    }
  }, [loading, user, isLoadingWorkspaces, workspaces.length, pathname, router]);

  if (loading || (user && isLoadingWorkspaces)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden md:block flex-shrink-0 z-10 relative">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar Mobile */}
        <Topbar />

        {/* Main Content Area */}
        <ErrorBoundary>
          <main className="flex-1 overflow-y-auto w-full">
            {children}
          </main>
          <CommandPalette />
        </ErrorBoundary>
      </div>
    </div>
  );
}
