"use client";

import { useEffect, use, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AppSidebar } from "@/components/layouts/app-sidebar";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { LogoutButton } from "@/components/providers/logout-button";
import { CreditDisplay } from "@/components/common/credit-display";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SubscriptionExpiryPopup } from "@/components/common/subscription-expiry-popup";

export default function ProtectedLayout({ children, params }) {
  const locale = use(params);
  const router = useRouter();
  const { data: session, status } = useSession(); // Use NextAuth session
  const user = session?.user;
  const role = (user?.role || "").toLowerCase();
  const [mounted, setMounted] = useState(true);
  const pathnameHook = usePathname();

  const [showExpiryPopup, setShowExpiryPopup] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const isAgent = role === "agent" || role === "admin";

    if (isAgent && user?.is_subscription_expired && !pathnameHook?.includes("/wallet")) {
      setShowExpiryPopup(true);
    } else {
      setShowExpiryPopup(false);
    }
  }, [user, status, pathnameHook, role]);

  useEffect(() => {
    if (status === "loading") return; // wait for session to resolve

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    // Check if account is active for merchants
    if (role === "merchant" && user.merchantActive === false) {
      console.warn("Inactive merchant attempted access:", user.email);
      toast.error("Your account is inactive. Please contact your agent.");
      router.push(`/${locale}/login`);
    }
  }, [status, user, router, locale, role]);

  useEffect(() => {
    if (!user) return;

    try {
      // debug role enforcement checks
      console.debug("ProtectedLayout: role check", {
        user,
        pathname: pathnameHook,
      });
    } catch (e) { }

    const pathname =
      pathnameHook ||
      (typeof window !== "undefined" ? window.location.pathname : "");
    if (!pathname) return;

    const parts = pathname.split("/").filter(Boolean);
    const LOCALES = [
      "zh",
      "ms",
      "th",
      "vi",
      "id",
      "ko",
      "ja",
      "hi",
      "ar",
      "en",
    ];
    const routeSegment = LOCALES.includes(parts[0])
      ? parts[1] || ""
      : parts[0] || "";

    // Client-side role enforcement on route segment
    // Normalize role to lower-case to avoid casing issues from API
    if (routeSegment.startsWith("merchant") && role !== "merchant") {
      router.push(`/${locale}/login`);
      return;
    }

    if (
      (routeSegment.startsWith("agent") || routeSegment.startsWith("admin")) &&
      !(role === "agent" || role === "admin")
    ) {
      router.push(`/${locale}/login`);
      return;
    }
  }, [user, role, status, router, locale, pathnameHook]);

  if (!mounted || !user) {
    return null; // Or a loading spinner
  }

  // Dummy credit balance for merchants
  const merchantCredits = 2500;

  return (
    <SidebarProvider>
      <AppSidebar
        role={user.role}
        subscriptionType={user.subscriptionType || "temporary"}
      />
      <SidebarInset>
        <div>
          <header className="flex items-center justify-between px-6 py-3 border-b border-sidebar-border bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 rounded-lg p-2 transition-all duration-200" />
              <Separator orientation="vertical" className="h-6 bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">QR Scanner</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* {user.role === "merchant" && (
                <CreditDisplay credits={merchantCredits} />
              )} */}
              <LanguageSwitcher />
              <LogoutButton />
            </div>
          </header>
        </div>
        <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
      </SidebarInset>
      <SubscriptionExpiryPopup
        isOpen={showExpiryPopup}
        onClose={() => setShowExpiryPopup(false)}
      />
    </SidebarProvider>
  );
}
