
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layouts/Navbar";
import Sidebar from "@/components/layouts/Sidebar";
import MobileNav from "@/components/layouts/MobileNav";
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
  manifest: "/manifest.json",
  themeColor: "#e95723",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e95723" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('ServiceWorker unregistered');
                  }
                });
              }
            `,
          }}
        />
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        /> */}
      </head>
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
