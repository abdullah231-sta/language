// app/client-layout.tsx
"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { MessagingProvider } from "@/context/MessagingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { RealTimeChatProvider } from "@/context/RealTimeChatContext";
import { ConversationTimeProvider } from "@/context/ConversationTimeContext";
import { ToastProvider } from "@/context/ToastContext";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { usePathname } from "next/navigation";

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
      </ProtectedRoute>
    );
  }

  if (isHomePage) {
    // Home page - no authentication required, shows landing or dashboard based on auth
    return (
      <main className={isAuthenticated ? "flex-1 lg:ml-64 transition-all duration-300" : "w-full"}>
        {isAuthenticated && (
          <div className="min-h-screen flex">
            <Sidebar />
            {children}
          </div>
        )}
        {!isAuthenticated && children}
      </main>
    );
  }

  // Protected pages - require authentication
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 transition-all duration-300">{children}</main>
      </div>
    </ProtectedRoute>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}