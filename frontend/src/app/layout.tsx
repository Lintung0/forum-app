
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layouts/Navbar";
import Sidebar from "@/components/layouts/Sidebar";
import Providers from "./providers";
const geistSans = Geist({
  variable: "--font-sans", 
  subsets: ["latin"],
  display: "swap",
});
const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Voxra - Developer Community",
  description: "Ultra modern discussion forum built with Next.js and Laravel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        "dark", 
      )}
    >
      <body
        className={cn(
          "min-h-full flex flex-col bg-[#0f1115] text-[#f8fafc]",
          geistSans.variable,
          geistMono.variable,
          "font-sans",
        )}
      >
        <Providers>
          <Navbar />
          <div className="flex pt-16 max-w-[1400px] w-full mx-auto flex-1 items-start">
            <Sidebar />
            <main className="flex-1 w-full min-w-0 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}