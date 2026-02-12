"use client";

import { AlertTriangle, Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";

const daysUntil = (date) => {
  if (!date) return null;
  const target = new Date(date).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function WalletWarnings({
  isLowBalance,
  expiresAt,
  merchantType,
}) {
  const t = useTranslations("merchantWallet.warnings");
  const days = daysUntil(expiresAt);
  const isExpiringSoon = typeof days === "number" && days <= 7 && days >= 0;

  if (!isLowBalance && !isExpiringSoon) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="h-4 w-4" />
        <span>{t("title")}</span>
      </div>
      <ul className="mt-2 space-y-1 list-disc list-inside">
        {isLowBalance && (
          <li>
            {t("lowBalance")}
          </li>
        )}
        {isExpiringSoon && merchantType === "TEMPORARY" && (
          <li className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {t("expiringSoon", { days, plural: days === 1 ? "" : "s" })}
          </li>
        )}
      </ul>
    </div>
  );
}
