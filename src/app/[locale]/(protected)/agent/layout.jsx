"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useSubscription } from "@/context/SubscriptionContext";
import { SubscriptionExpiryPopup } from "@/components/common/subscription-expiry-popup";

function AgentRestrictionWrapper({ children }) {
  const { isSubscriptionExpired, isInitializing } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale || "en";

  const [showExpiryPopup, setShowExpiryPopup] = useState(false);

  useEffect(() => {
    if (isInitializing) return;

    const isWalletPage = pathname?.includes("/agent/wallet");

    if (isSubscriptionExpired) {
      if (!isWalletPage) {
        // Force navigate to wallet if expired and not already there
        router.push(`/${locale}/agent/wallet`);
        // Defer setting state to avoid synchronous setState inside effect
        setTimeout(() => setShowExpiryPopup(true), 0);
      } else {
        // On wallet page, still show popup if it was just triggered
        // or if we want to ensure they see it
        setTimeout(() => setShowExpiryPopup(true), 0);
      }
    } else {
      setShowExpiryPopup(false);
    }
  }, [isSubscriptionExpired, isInitializing, pathname, router, locale]);

  if (isInitializing) {
    return null; // or a loading spinner
  }

  return (
    <>
      {children}
      <SubscriptionExpiryPopup
        isOpen={showExpiryPopup}
        onClose={() => setShowExpiryPopup(false)}
      />
    </>
  );
}

export default function AgentLayout({ children }) {
  return <AgentRestrictionWrapper>{children}</AgentRestrictionWrapper>;
}
