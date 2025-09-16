// app/client-layout.tsx
"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { MessagingProvider } from "@/context/MessagingContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { RealTimeChatProvider } from "@/context/RealTimeChatContext";
import { ConversationTimeProvider } from "@/context/ConversationTimeContext";
import { ToastProvider } from "@/context/ToastContext";
import { OfflineProvider } from "@/context/OfflineProvider";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import OfflineIndicator from "@/components/OfflineIndicator";
import ThreePanelLayout from "@/components/layout/ThreePanelLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { offlineManager } from "@/lib/offline";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  // Define auth pages that don't require authentication
  const isAuthPage = pathname === '/login' || pathname === '/register';
  // Home page doesn't require auth but shows different content
  const isHomePage = pathname === '/';
  // Protected pages that require authentication
  const isProtectedPage = !isAuthPage && !isHomePage;

  if (isAuthPage) {
    // Auth pages - redirect authenticated users away
    return (
      <ProtectedRoute requireAuth={false}>
        <main className="w-full">{children}</main>
        <OfflineIndicator />
      </ProtectedRoute>
    );
  }

  if (isHomePage) {
    // Home page - no authentication required, shows landing or dashboard based on auth
    return (
      <main className={isAuthenticated ? "h-screen w-full relative" : "w-full"}>
        {isAuthenticated && (
          <ThreePanelLayout
            sidebar={<Sidebar />}
            mainContent={children}
            sidebarWidth="w-20"
            mainContentWidth="w-[600px]"
          />
        )}
        {!isAuthenticated && children}
        <OfflineIndicator />
      </main>
    );
  }

  // Protected pages - require authentication
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="h-screen w-full relative">
        <ThreePanelLayout
          sidebar={<Sidebar />}
          mainContent={children}
          sidebarWidth="w-20"
          mainContentWidth="w-[600px]"
        />
        <OfflineIndicator />
      </div>
    </ProtectedRoute>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isOfflineInitialized, setIsOfflineInitialized] = useState(false);

  // Initialize offline manager on app start
  useEffect(() => {
    const initializeOffline = async () => {
      try {
        await offlineManager.init();
        setIsOfflineInitialized(true);
        console.log('Offline manager initialized successfully');
      } catch (error) {
        console.error('Failed to initialize offline manager:', error);
        setIsOfflineInitialized(true); // Still set to true to prevent infinite loading
      }
    };

    initializeOffline();
  }, []);

  // Show loading state until offline manager is initialized
  if (!isOfflineInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p>Initializing app...</p>
        </div>
      </div>
    );
  }

  return (
    <OfflineProvider>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <UserProvider>
              <MessagingProvider>
                <RealTimeChatProvider>
                  <ConversationTimeProvider>
                    <LayoutContent>{children}</LayoutContent>
                  </ConversationTimeProvider>
                </RealTimeChatProvider>
              </MessagingProvider>
            </UserProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </OfflineProvider>
  );
}