import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

export function CreditDisplay({ credits, className = "" }) {
  const tMerchants = useTranslations("dashboard.merchantSidebar");
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold">
        {credits.toLocaleString()} {tMerchants("credits")}
      </span>
    </div>
  );
}
