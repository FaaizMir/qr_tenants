"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function StripeCancelPage() {
  const t = useTranslations("merchantPurchase.stripeCancel");
  const { data: session } = useSession();
  const params = useParams();
  const locale = params?.locale || "en";

  const isAgent = session?.user?.role === "agent" || session?.user?.role === "admin";
  const walletPath = isAgent ? `/${locale}/agent/wallet` : `/${locale}/merchant/wallet`;
  const backPath = isAgent ? `/${locale}/agent/dashboard` : `/${locale}/merchant/purchase`;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="text-muted-foreground max-w-md">
        {t("description")}
      </p>
      <div className="flex gap-3">
        <Link href={backPath}>
          <Button>{isAgent ? t("backToDashboard") : t("backToPurchase")}</Button>
        </Link>
        <Link href={walletPath}>
          <Button variant="outline">{t("goToWallet")}</Button>
        </Link>
      </div>
    </div>
  );
}


