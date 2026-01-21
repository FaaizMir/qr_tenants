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
            <div className="max-w-[400px] text-sm text-foreground/80 leading-relaxed" title={row.getValue("message")}>
                {row.getValue("message")}
            </div>
        ),
    },
    // {
    //     id: "details",
    //     header: "Details",
    //     cell: ({ row }) => {
    //         const metadata = row.original.metadata;
    //         if (!metadata) return <span className="text-muted-foreground">-</span>;

    //         const category = row.original.category;

    //         if (category === "coupon") {
    //             return (
    //                 <div className="flex flex-col gap-1 text-[11px]">
    //                     {metadata.coupons_generated && (
    //                         <span className="text-emerald-600 font-medium">Generated: {metadata.coupons_generated}</span>
    //                     )}
    //                     {metadata.total_quantity && (
    //                         <span className="text-muted-foreground">Total: {metadata.total_quantity}</span>
    //                     )}
    //                     {metadata.batch_type && (
    //                         <span className="text-muted-foreground uppercase">Type: {metadata.batch_type}</span>
    //                     )}
    //                 </div>
    //             );
    //         }

    //         if (category === "whatsapp") {
    //             return (
    //                 <div className="flex flex-col gap-1 text-[11px]">
    //                     {metadata.phone && (
    //                         <span className="font-medium text-blue-600">{metadata.phone}</span>
    //                     )}
    //                     {metadata.coupon_code && (
    //                         <code className="bg-muted px-1 rounded text-primary">{metadata.coupon_code}</code>
    //                     )}
    //                     {metadata.context && (
    //                         <span className="text-muted-foreground text-[10px]">{metadata.context.replace(/_/g, " ")}</span>
    //                     )}
    //                 </div>
    //             );
    //         }

    //         if (category === "wallet") {
    //             return (
    //                 <div className="flex flex-col gap-1 text-[11px]">
    //                     {metadata.credits && (
    //                         <span className="font-bold text-orange-600">
    //                             {metadata.credits > 0 ? "+" : ""}{metadata.credits} Credits
    //                         </span>
    //                     )}
    //                     {metadata.credit_type && (
    //                         <span className="text-muted-foreground capitalize">{metadata.credit_type}</span>
    //                     )}
    //                     {metadata.amount && (
    //                         <span className="text-muted-foreground font-mono">RM {metadata.amount}</span>
    //                     )}
    //                 </div>
    //             );
    //         }

    //         if (category === "auth") {
    //             return (
    //                 <div className="flex flex-col gap-1 text-[11px]">
    //                     {metadata.ip && <span className="text-muted-foreground font-mono">IP: {metadata.ip}</span>}
    //                     {metadata.method && <span className="text-muted-foreground uppercase">{metadata.method}</span>}
    //                     {row.original.user_type && (
    //                         <Badge variant="outline" className="text-[9px] w-fit h-4 px-1 capitalize">
    //                             {row.original.user_type}
    //                         </Badge>
    //                     )}
    //                 </div>
    //             );
    //         }

    //         if (category === "merchant" || category === "agent") {
    //             return (
    //                 <div className="flex flex-col gap-1 text-[11px]">
    //                     {metadata.merchant_id && <span className="text-muted-foreground">ID: {metadata.merchant_id}</span>}
    //                     {metadata.agent_id && <span className="text-muted-foreground">AG: {metadata.agent_id}</span>}
    //                     {metadata.business_name && <span className="font-medium truncate max-w-[120px]">{metadata.business_name}</span>}
    //                 </div>
    //             );
    //         }

    //         return (
    //             <div className="max-w-[150px] truncate text-[10px] text-muted-foreground" title={JSON.stringify(metadata)}>
    //                 {JSON.stringify(metadata)}
    //             </div>
    //         );
    //     },
    // },
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

