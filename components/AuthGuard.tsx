"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { LoadingSpinner } from "./ui/loading/LoadingSpinner";

const publicRoutes = ["/", "/login", "/register", "/unauthorized"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // jika di public route, langsung tampilkan children tanpa cek
    if (publicRoutes.includes(pathname)) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        if (!res.data.user) {
          router.replace("/");
        } else {
          setLoading(false);
        }
      } catch (err) {
        router.replace("/");
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (loading) return <LoadingSpinner />;

  return <>{children}</>;
}
