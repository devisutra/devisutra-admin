"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-brand-ivory">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown mx-auto"></div>
        <p className="mt-4 text-brand-brown">Redirecting...</p>
      </div>
    </div>
  );
}