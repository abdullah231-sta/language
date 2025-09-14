// app/layout.tsx
import "./globals.css";
import ClientLayout from "./client-layout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="bg-gray-900 min-h-screen transition-colors duration-300">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}