import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const getLogColumns = (t) => [
  {
    accessorKey: "created_at",
    header: t("columns.dateTime"),
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
            {date ? format(new Date(date), "MMM dd, yyyy") : "N/A"}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {date ? format(new Date(date), "HH:mm:ss") : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: t("columns.category"),
    cell: ({ row }) => {
      const category = row.getValue("category") || "system";
      return (
        <span className="text-sm font-medium capitalize">
          {category.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "action",
    header: t("columns.action"),
    cell: ({ row }) => {
      const action = row.getValue("action");
      return (
        <span className="text-sm font-medium capitalize">
          {action?.replace(/_/g, " ") || t("columns.systemActivity")}
        </span>
      );
    },
  },
  {
    accessorKey: "message",
    header: t("columns.description"),
    cell: ({ row }) => (
      <div className="text-sm text-foreground py-1">
        {row.getValue("message")}
      </div>
    ),
  },
  {
    id: "details",
    header: t("columns.details"),
    cell: ({ row }) => {
      const metadata = row.original.metadata;
      if (!metadata)
        return (
          <span className="text-muted-foreground text-xs italic">
            {t("columns.noDetails")}
          </span>
        );

      const category = row.original.category;

      if (category === "coupon" || category === "lucky_draw") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.coupons_generated && (
              <div className="text-sm font-medium">
                {t("details.coupon.couponsGenerated", {
                  count: metadata.coupons_generated,
                })}
              </div>
            )}
            {metadata.total_quantity && (
              <div className="text-sm text-muted-foreground">
                {t("details.coupon.quantity", {
                  value: metadata.total_quantity,
                })}
              </div>
            )}
            {metadata.batch_type && (
              <div className="text-sm text-muted-foreground">
                {t("details.coupon.type", { value: metadata.batch_type })}
              </div>
            )}
          </div>
        );
      }

      if (category === "whatsapp" || category === "whatsapp_ui") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.phone_number && (
              <div className="text-sm font-medium">{metadata.phone_number}</div>
            )}
            {metadata.campaign_type && (
              <div className="text-sm text-muted-foreground capitalize">
                {metadata.campaign_type.replace(/_/g, " ")}
              </div>
            )}
          </div>
        );
      }

      if (category === "wallet") {
        const creditType = metadata.credit_type || metadata.creditType || "";
        const amount = metadata.amount || metadata.credits || 0;
        const currency = metadata.currency || t("details.wallet.credits");

        const friendlyType = creditType.toLowerCase().includes("whatsapp ui")
          ? t("details.wallet.whatsappUI")
          : creditType.toLowerCase().includes("whatsapp bi")
            ? t("details.wallet.whatsappBI")
            : creditType.toLowerCase().includes("coupon")
              ? t("details.wallet.coupon")
              : creditType.toLowerCase().includes("paid ad")
                ? t("details.wallet.paidAd")
                : creditType.replace(/_/g, " ");

        return (
          <div className="flex flex-col gap-1 py-1">
            <div
              className={cn(
                "text-sm font-semibold",
                amount > 0 ? "text-emerald-600" : "text-orange-600",
              )}
            >
              {amount > 0 ? "+" : ""}
              {amount} {currency}
            </div>
            <div className="text-sm text-muted-foreground">{friendlyType}</div>
            {metadata.commission_rate && (
              <div className="text-sm text-muted-foreground">
                {t("details.wallet.platformCommission", {
                  rate: metadata.commission_rate,
                })}
              </div>
            )}
            {metadata.cost_per_unit && (
              <div className="text-sm text-muted-foreground">
                {t("details.wallet.unitPrice", {
                  value: metadata.cost_per_unit,
                })}
              </div>
            )}
          </div>
        );
      }

      if (category === "auth") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.ip && (
              <div className="text-sm font-mono">{metadata.ip}</div>
            )}
            {metadata.method && (
              <div className="text-sm text-muted-foreground">
                {t("details.auth.method", { value: metadata.method })}
              </div>
            )}
            {row.original.user_type && (
              <div className="text-sm text-muted-foreground">
                {t("details.auth.user", { value: row.original.user_type })}
              </div>
            )}
          </div>
        );
      }

      if (category === "merchant" || category === "agent") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.business_name && (
              <div className="text-sm font-medium">
                {metadata.business_name}
              </div>
            )}
            {metadata.merchant_type && (
              <div className="text-sm text-muted-foreground capitalize">
                {metadata.merchant_type.replace(/_/g, " ")}
              </div>
            )}
          </div>
        );
      }

      if (category === "customer") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.coupon_code && (
              <div className="text-sm font-medium">{metadata.coupon_code}</div>
            )}
            {metadata.selected_platform && (
              <div className="text-sm text-muted-foreground">
                {t("details.customer.platform", {
                  value: metadata.selected_platform,
                })}
              </div>
            )}
            {metadata.review_type && (
              <div className="text-sm text-muted-foreground">
                {t("details.customer.review", { value: metadata.review_type })}
              </div>
            )}
          </div>
        );
      }

      if (category === "campaign") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.campaign_name && (
              <div className="text-sm font-medium">
                {metadata.campaign_name}
              </div>
            )}
            {metadata.status && (
              <div className="text-sm text-muted-foreground capitalize">
                {metadata.status.replace(/_/g, " ")}
              </div>
            )}
          </div>
        );
      }

      // Default metadata display - filter out IDs and technical fields
      const displayKeys = Object.keys(metadata).filter(
        (k) =>
          !k.startsWith("_") &&
          !k.endsWith("_id") &&
          !k.includes("id") &&
          !k.includes("wamid") &&
          metadata[k] !== null &&
          metadata[k] !== undefined &&
          String(metadata[k]).length < 100, // Exclude very long values
      );

      if (displayKeys.length === 0)
        return <span className="text-sm text-muted-foreground">-</span>;

      return (
        <div className="flex flex-col gap-1 py-1">
          {displayKeys.slice(0, 3).map((key) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, " ")}:{" "}
              </span>
              <span className="text-foreground">{String(metadata[key])}</span>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "level",
    header: t("columns.severity"),
    cell: ({ row }) => {
      const level = row.getValue("level")?.toLowerCase() || "info";
      return (
        <span
          className={cn(
            "text-sm font-medium capitalize",
            level === "critical" && "text-red-600",
            level === "error" && "text-red-600",
            level === "warning" && "text-amber-600",
            level === "success" && "text-emerald-600",
            level === "info" && "text-blue-600",
          )}
        >
          {t(`severity.${level}`)}
        </span>
      );
    },
  },
];
