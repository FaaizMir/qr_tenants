import { format } from "date-fns";
import { cn } from "@/lib/utils";

export const getLogColumns = () => [
  {
    accessorKey: "created_at",
    header: "Date & Time",
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
    header: "Category",
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
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action");
      return (
        <span className="text-sm font-medium capitalize">
          {action?.replace(/_/g, " ") || "system activity"}
        </span>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Description",
    cell: ({ row }) => (
      <div className="text-sm text-foreground py-1">
        {row.getValue("message")}
      </div>
    ),
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const metadata = row.original.metadata;
      if (!metadata)
        return (
          <span className="text-muted-foreground text-xs italic">
            No details
          </span>
        );

      const category = row.original.category;

      if (category === "coupon" || category === "lucky_draw") {
        return (
          <div className="flex flex-col gap-1 py-1">
            {metadata.coupons_generated && (
              <div className="text-sm font-medium">
                {metadata.coupons_generated} coupons generated
              </div>
            )}
            {metadata.total_quantity && (
              <div className="text-sm text-muted-foreground">
                Quantity: {metadata.total_quantity}
              </div>
            )}
            {metadata.batch_type && (
              <div className="text-sm text-muted-foreground">
                Type: {metadata.batch_type}
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
            {metadata.message_type && (
              <div className="text-sm text-muted-foreground">
                Type: {metadata.message_type}
              </div>
            )}
            {metadata.campaign_type && (
              <div className="text-sm text-muted-foreground">
                Campaign: {metadata.campaign_type}
              </div>
            )}
            {metadata.whatsapp_message_id && (
              <div className="text-xs text-muted-foreground font-mono">
                ID: {metadata.whatsapp_message_id}
              </div>
            )}
          </div>
        );
      }

      if (category === "wallet") {
        const creditType = metadata.credit_type || metadata.creditType || "";
        const amount = metadata.amount || metadata.credits || 0;
        const currency = metadata.currency || "Credits";

        const friendlyType = creditType.toLowerCase().includes("whatsapp ui")
          ? "WhatsApp UI"
          : creditType.toLowerCase().includes("whatsapp bi")
            ? "WhatsApp BI"
            : creditType.toLowerCase().includes("coupon")
              ? "Coupon"
              : creditType.toLowerCase().includes("paid ad")
                ? "Paid Ad"
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
                {metadata.commission_rate}% Platform Commission
              </div>
            )}
            {metadata.cost_per_unit && (
              <div className="text-sm text-muted-foreground">
                Unit Price: {metadata.cost_per_unit}
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
                Method: {metadata.method}
              </div>
            )}
            {row.original.user_type && (
              <div className="text-sm text-muted-foreground">
                User: {row.original.user_type}
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
            {metadata.merchant_id && (
              <div className="text-sm text-muted-foreground">
                ID: {metadata.merchant_id}
              </div>
            )}
            {metadata.merchant_type && (
              <div className="text-sm text-muted-foreground">
                Type: {metadata.merchant_type}
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
                Platform: {metadata.selected_platform}
              </div>
            )}
            {metadata.review_type && (
              <div className="text-sm text-muted-foreground">
                Review: {metadata.review_type}
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
              <div className="text-sm text-muted-foreground">
                Status: {metadata.status}
              </div>
            )}
            {metadata.campaign_id && (
              <div className="text-sm text-muted-foreground">
                ID: {metadata.campaign_id}
              </div>
            )}
          </div>
        );
      }

      // Default metadata display
      const displayKeys = Object.keys(metadata).filter(
        (k) =>
          !k.startsWith("_") &&
          metadata[k] !== null &&
          metadata[k] !== undefined,
      );

      if (displayKeys.length === 0)
        return <span className="text-sm text-muted-foreground">-</span>;

      return (
        <div className="flex flex-col gap-1 py-1">
          {displayKeys.map((key) => (
            <div key={key} className="text-sm">
              <span className="font-medium text-muted-foreground">
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
    header: "Severity",
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
          {level}
        </span>
      );
    },
  },
];
