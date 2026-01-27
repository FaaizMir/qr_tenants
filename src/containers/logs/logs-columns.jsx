import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  MessageSquare,
  Ticket,
  Wallet,
  User,
  Shield,
  Store,
  Megaphone,
  CreditCard,
  Hash,
  Activity,
  Globe,
  Tag,
  CheckCircle2,
} from "lucide-react";
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
      const iconMap = {
        coupon: Ticket,
        whatsapp: MessageSquare,
        whatsapp_ui: MessageSquare,
        wallet: Wallet,
        auth: Shield,
        merchant: Store,
        agent: User,
        customer: User,
        campaign: Megaphone,
        system: Activity,
      };
      const Icon = iconMap[category] || iconMap.system;

      return (
        <Badge
          variant="secondary"
          className="capitalize gap-1.5 px-2 py-0.5 font-semibold text-[10px]"
        >
          <Icon className="w-3 h-3" />
          {category.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action");
      return (
        <span className="font-semibold capitalize text-[13px] text-foreground/90 tracking-tight">
          {action?.replace(/_/g, " ") || "system activity"}
        </span>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Description",
    cell: ({ row }) => (
      <div
        className="max-w-[300px] text-[13px] text-muted-foreground line-clamp-2 leading-tight py-1"
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
      if (!metadata) return <span className="text-muted-foreground text-xs italic">No details</span>;

      const category = row.original.category;

      if (category === "coupon" || category === "lucky_draw") {
        return (
          <div className="flex flex-col gap-1.5 py-1">
            {metadata.coupons_generated && (
              <div className="flex items-center gap-1.5 leading-none">
                <Ticket className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-600">
                  {metadata.coupons_generated} Generated
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              {metadata.total_quantity && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="font-bold">Qty:</span> {metadata.total_quantity}
                </div>
              )}
              {metadata.batch_type && (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 py-0 font-black uppercase">
                  {metadata.batch_type}
                </Badge>
              )}
            </div>
          </div>
        );
      }

      if (category === "whatsapp" || category === "whatsapp_ui") {
        return (
          <div className="flex flex-col gap-1.5 py-1 min-w-[140px]">
            {metadata.phone_number && (
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3 h-3 text-blue-500" />
                <span className="font-bold text-xs text-blue-600 tracking-tighter">
                  {metadata.phone_number}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 items-center">
              {metadata.message_type && (
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 text-[9px] h-4 px-1 py-0 font-bold border-slate-200">
                  {metadata.message_type?.toUpperCase()}
                </Badge>
              )}
              {metadata.campaign_type && (
                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5">
                  <Megaphone className="w-2.5 h-2.5" />
                  {metadata.campaign_type}
                </span>
              )}
            </div>
            {metadata.whatsapp_message_id && (
              <div className="flex items-center gap-1 leading-none group">
                <Hash className="w-2.5 h-2.5 text-muted-foreground/50" />
                <code className="text-[9px] text-muted-foreground font-mono bg-muted/50 px-1 rounded truncate max-w-[140px] group-hover:bg-primary/5 transition-colors">
                  {metadata.whatsapp_message_id}
                </code>
              </div>
            )}
          </div>
        );
      }

      if (category === "wallet") {
        const creditType = metadata.credit_type || metadata.creditType || "";
        const amount = metadata.amount || metadata.credits || 0;
        const currency = metadata.currency || "Credits";

        const friendlyType =
          creditType.toLowerCase().includes("whatsapp ui")
            ? "WhatsApp UI"
            : creditType.toLowerCase().includes("whatsapp bi")
              ? "WhatsApp BI"
              : creditType.toLowerCase().includes("coupon")
                ? "Coupon"
                : creditType.toLowerCase().includes("paid ad")
                  ? "Paid Ad"
                  : creditType.replace(/_/g, " ");

        return (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-black tracking-tight",
                amount > 0 ? "text-emerald-600" : "text-orange-600"
              )}>
                {amount > 0 ? "+" : ""}{amount} {currency}
              </span>
              <Badge variant="outline" className="text-[9px] h-3.5 px-1 py-0 capitalize">
                {friendlyType}
              </Badge>
            </div>
            {metadata.commission_rate && (
              <span className="text-muted-foreground text-[10px] font-medium italic">
                {metadata.commission_rate}% Platform Commission
              </span>
            )}
            {metadata.cost_per_unit && (
              <span className="text-muted-foreground text-[9px]">
                Unit Price: {metadata.cost_per_unit}
              </span>
            )}
          </div>
        );
      }

      if (category === "auth") {
        return (
          <div className="flex flex-col gap-1.5 py-1">
            {metadata.ip && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                <Globe className="w-2.5 h-2.5" />
                {metadata.ip}
              </div>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              {metadata.method && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50 text-[9px] h-4 py-0 font-bold uppercase">
                  {metadata.method}
                </Badge>
              )}
              {row.original.user_type && (
                <span className="text-[10px] text-muted-foreground font-semibold capitalize flex items-center gap-1">
                  <User className="w-2.5 h-2.5" />
                  {row.original.user_type}
                </span>
              )}
            </div>
          </div>
        );
      }

      if (category === "merchant" || category === "agent") {
        return (
          <div className="flex flex-col gap-1 py-1 max-w-[150px]">
            {metadata.business_name && (
              <span className="font-bold text-xs truncate text-foreground/90 block">
                {metadata.business_name}
              </span>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {metadata.merchant_id && (
                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded">
                  #{metadata.merchant_id}
                </span>
              )}
              {metadata.merchant_type && (
                <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-primary/20 text-primary">
                  {metadata.merchant_type}
                </Badge>
              )}
            </div>
          </div>
        );
      }

      if (category === "customer") {
        return (
          <div className="flex flex-col gap-1.5 py-1">
            {metadata.coupon_code && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-purple-500" />
                <span className="font-black text-xs text-purple-600 tracking-widest">
                  {metadata.coupon_code}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-center">
              {metadata.selected_platform && (
                <span className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  {metadata.selected_platform}
                </span>
              )}
              {metadata.review_type && (
                <Badge className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-50 text-[9px] h-3.5 px-1 capitalize">
                  {metadata.review_type}
                </Badge>
              )}
            </div>
          </div>
        );
      }

      if (category === "campaign") {
        return (
          <div className="flex flex-col gap-1 py-1 min-w-[130px]">
            {metadata.campaign_name && (
              <span className="font-bold text-xs truncate block text-indigo-700">
                {metadata.campaign_name}
              </span>
            )}
            <div className="flex items-center gap-1.5 mt-0.5">
              {metadata.status && (
                <Badge className={cn(
                  "text-[9px] h-3.5 px-1 font-bold",
                  metadata.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                )}>
                  {metadata.status}
                </Badge>
              )}
              {metadata.campaign_id && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  ID: {metadata.campaign_id}
                </span>
              )}
            </div>
          </div>
        );
      }

      // Default enhanced metadata display
      const displayKeys = Object.keys(metadata)
        .filter((k) => !k.startsWith("_") && metadata[k] !== null && metadata[k] !== undefined)
        .slice(0, 4);

      if (displayKeys.length === 0) return <span className="text-muted-foreground text-xs font-medium">-</span>;

      return (
        <div className="flex flex-col gap-1 py-1 max-w-[200px]">
          {displayKeys.map((key) => (
            <div key={key} className="flex items-start gap-1 text-[10px]">
              <span className="font-bold text-muted-foreground capitalize whitespace-nowrap">{key.replace(/_/g, " ")}:</span>
              <span className="text-foreground/80 truncate">{String(metadata[key])}</span>
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
      const level = row.getValue("level")?.toLowerCase();
      let variant = "secondary";
      if (level === "critical" || level === "error") variant = "destructive";
      if (level === "warning") variant = "warning";
      if (level === "info" || level === "success") variant = "success";

      return (
        <Badge
          variant={variant}
          className={cn(
            "capitalize text-[9px] h-4.5 px-1.5 font-bold tracking-wider",
            level === "info" && "bg-blue-50 text-blue-700 border-blue-100",
            level === "success" && "bg-emerald-50 text-emerald-700 border-emerald-100",
            level === "warning" && "bg-amber-50 text-amber-700 border-amber-100",
            level === "error" && "bg-red-50 text-red-700 border-red-100",
          )}
        >
          {level || "info"}
        </Badge>
      );
    },
  },
];
