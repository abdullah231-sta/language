// app/layout.tsx

import "./globals.css";
import { UserProvider } from "@/context/UserContext"; // Import our new provider
import { MessagingProvider } from "@/context/MessagingContext"; // Import messaging provider
import Sidebar from "@/components/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* The UserProvider now wraps everything */}
        <UserProvider>
          <MessagingProvider>
            <div className="flex">
              <Sidebar /> {/* Sidebar no longer needs props */}
              <main className="flex-1">{children}</main>
            </div>
          </MessagingProvider>
        </UserProvider>
      </body>
    </html>
  );
}