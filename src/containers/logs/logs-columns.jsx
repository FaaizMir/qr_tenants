import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const getLogColumns = () => [
  {
    accessorKey: "created_at",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      return date ? format(new Date(date), "MMM dd, yyyy HH:mm:ss") : "N/A";
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.getValue("category") || "system"}
      </Badge>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action");
      return (
        <span className="font-medium capitalize text-sm">
          {action?.replace(/_/g, " ") || "system"}
        </span>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Description",
    cell: ({ row }) => (
      <div
        className="max-w-[400px] text-sm text-foreground/80 leading-relaxed"
        title={row.getValue("message")}
      >
        {row.getValue("message")}
      </div>
    ),
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const metadata = row.original.metadata;
      if (!metadata) return <span className="text-muted-foreground">-</span>;

      const category = row.original.category;

      if (category === "coupon") {
        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {metadata.coupons_generated && (
              <span className="text-emerald-600 font-medium">
                Generated: {metadata.coupons_generated}
              </span>
            )}
            {metadata.total_quantity && (
              <span className="text-muted-foreground">
                Total: {metadata.total_quantity}
              </span>
            )}
            {metadata.batch_type && (
              <span className="text-muted-foreground uppercase">
                Type: {metadata.batch_type}
              </span>
            )}
          </div>
        );
      }

      if (category === "whatsapp" || category === "whatsapp_ui") {
        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {metadata.phone_number && (
              <span className="font-medium text-blue-600">
                {metadata.phone_number}
              </span>
            )}
            {metadata.message_type && (
              <span className="text-muted-foreground uppercase">
                {metadata.message_type}
              </span>
            )}
            {metadata.campaign_type && (
              <span className="text-muted-foreground text-[10px]">
                {metadata.campaign_type}
              </span>
            )}
            {metadata.whatsapp_message_id && (
              <code className="bg-muted px-1 rounded text-primary truncate max-w-[180px]">
                {metadata.whatsapp_message_id}
              </code>
            )}
          </div>
        );
      }

      if (category === "wallet") {
        const creditType = metadata.credit_type || metadata.creditType || "";
        const amount = metadata.amount || metadata.credits || 0;
        const friendlyType =
          creditType.includes("whatsapp ui") ||
          creditType.includes("whatsapp_ui")
            ? "WhatsApp UI"
            : creditType.includes("whatsapp bi") ||
                creditType.includes("whatsapp_bi")
              ? "WhatsApp BI"
              : creditType.includes("coupon")
                ? "Coupon"
                : creditType.includes("paid ad")
                  ? "Paid Ad"
                  : creditType.replace(/_/g, " ");

        return (
          <div className="flex flex-col gap-1 text-[11px]">
            <span className="font-bold text-orange-600">
              {amount > 0 ? "+" : ""}
              {amount} Credits
            </span>
            <span className="text-muted-foreground capitalize">
              {friendlyType}
            </span>
            {metadata.amount && (
              <span className="text-muted-foreground font-mono">
                RM {metadata.amount}
              </span>
            )}
            {metadata.commission_rate && (
              <span className="text-muted-foreground text-[10px]">
                Commission: {metadata.commission_rate}%
              </span>
            )}
          </div>
        );
      }

      if (category === "auth") {
        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {metadata.ip && (
              <span className="text-muted-foreground font-mono">
                IP: {metadata.ip}
              </span>
            )}
            {metadata.method && (
              <span className="text-muted-foreground uppercase">
                {metadata.method}
              </span>
            )}
            {row.original.user_type && (
              <Badge
                variant="outline"
                className="text-[9px] w-fit h-4 px-1 capitalize"
              >
                {row.original.user_type}
              </Badge>
            )}
          </div>
        );
      }

      if (category === "merchant" || category === "agent") {
        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {metadata.merchant_id && (
              <span className="text-muted-foreground">
                ID: {metadata.merchant_id}
              </span>
            )}
            {metadata.agent_id && (
              <span className="text-muted-foreground">
                AG: {metadata.agent_id}
              </span>
            )}
            {metadata.business_name && (
              <span className="font-medium truncate max-w-[120px]">
                {metadata.business_name}
              </span>
            )}
            {metadata.merchant_type && (
              <Badge
                variant="outline"
                className="text-[9px] w-fit h-4 px-1 capitalize"
              >
                {metadata.merchant_type}
              </Badge>
            )}
          </div>
        );
      }

      if (category === "customer") {
        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {metadata.customer_id && (
              <span className="text-muted-foreground">
                CID: {metadata.customer_id}
              </span>
            )}
            {metadata.coupon_code && (
              <span className="font-medium text-purple-600">
                {metadata.coupon_code}
              </span>
            )}
            {metadata.selected_platform && (
              <span className="text-muted-foreground uppercase text-[10px]">
                {metadata.selected_platform}
              </span>
            )}
            {metadata.review_type && (
              <Badge
                variant="outline"
                className="text-[9px] w-fit h-4 px-1 capitalize"
              >
                {metadata.review_type}
              </Badge>
            )}
          </div>
        );
      }

      if (category === "campaign") {
        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {metadata.campaign_id && (
              <span className="text-muted-foreground">
                CID: {metadata.campaign_id}
              </span>
            )}
            {metadata.campaign_name && (
              <span className="font-medium truncate max-w-[120px]">
                {metadata.campaign_name}
              </span>
            )}
            {metadata.status && (
              <Badge
                variant="outline"
                className="text-[9px] w-fit h-4 px-1 capitalize"
              >
                {metadata.status}
              </Badge>
            )}
          </div>
        );
      }

      // Fallback for any other category - display key metadata fields
      if (Object.keys(metadata).length > 0) {
        const displayKeys = Object.keys(metadata)
          .filter(
            (k) =>
              !k.startsWith("_") &&
              metadata[k] !== null &&
              metadata[k] !== undefined,
          )
          .slice(0, 3);

        return (
          <div className="flex flex-col gap-1 text-[11px]">
            {displayKeys.map((key) => (
              <span key={key} className="text-muted-foreground">
                {key}:{" "}
                <span className="font-medium">
                  {String(metadata[key]).substring(0, 40)}
                </span>
              </span>
            ))}
            {Object.keys(metadata).length > 3 && (
              <span className="text-muted-foreground text-[9px]">
                +{Object.keys(metadata).length - 3} more fields
              </span>
            )}
          </div>
        );
      }

      return <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "level",
    header: "Severity",
    cell: ({ row }) => {
      const level = row.getValue("level")?.toLowerCase();
      let variant = "secondary";
      if (level === "critical" || level === "error") variant = "destructive";
      if (level === "warning") variant = "warning";
      if (level === "info" || level === "success") variant = "success";

      return (
        <Badge variant={variant} className="capitalize text-[10px] h-5">
          {level || "info"}
        </Badge>
      );
    },
  },
];
