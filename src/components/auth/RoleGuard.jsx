"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth-utils";

export default function RoleGuard({ allowedRoles = [], children }) {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    const role = (user?.role || "").toLowerCase();

    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.map(r => r.toLowerCase()).includes(role)) {
      // not allowed
      router.push("/login");
    }
  }, [router]);

  return children;
}
