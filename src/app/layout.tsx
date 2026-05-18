import type { Metadata } from "next";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-away.css";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LESO Life OS",
  description: "Tu sistema operativo personal",
  manifest: "/manifest.json",
  themeColor: "#C97B5D",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LESO Life OS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="antialiased">
      <body className="font-sans bg-background text-foreground selection:bg-primary/20">
        <Providers>
          {children}
        </Providers>
        <Toaster 
          position="bottom-right" 
          duration={4000} 
          richColors 
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
      </body>
    </html>
  );
}
