"use client";

import { Inter } from "next/font/google";
import "../globals.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  return <div className={inter.className}>{children}</div>;
}


