import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hedge Fund AI Terminal",
  description: "AI-powered investment analysis terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        <div className="min-h-screen bg-[var(--terminal-bg)]">
          <nav className="bg-[var(--terminal-header)] p-4 border-b border-[var(--terminal-border)]">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-[var(--terminal-text)] font-mono text-xl">$ STOCK_TERMINAL</h1>
              <Navigation />
            </div>
          </nav>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
