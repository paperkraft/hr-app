import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "HR Workspace | Premium Workforce Management",
  description: "Advanced human resources and attendance tracking for modern distributed teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased selection:bg-primary/20", 
        inter.variable
      )}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}