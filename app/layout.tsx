import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/components/providers/session-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dr. Bruno Quintela - Osteopatia",
  description: "Sistema de gestão para clínica de osteopatia",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <Provider>
          <AppLayout>{children}</AppLayout>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}

