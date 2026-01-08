import { Play, TrendingUp, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";

export const syncColumns = [
    { accessorKey: "merchant", header: "Merchant" },
    {
        accessorKey: "region",
        header: "Request Region",
        cell: ({ row }) => row.original.region || "Global",
    },
    {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.duration} days</span>,
    },
    {
        accessorKey: "status",
        header: "Approval Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "date", header: "Request Date" },
];

export const adColumns = [
    {
        accessorKey: "campaignName",
        header: "Campaign"
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>
    },
    {
        accessorKey: "cost",
        header: "Price",
        cell: ({ row }) => <span className="font-medium">${row.original.cost}</span>
    },
    {
        accessorKey: "impressions",
        header: "Performance",
        cell: ({ row }) => (
            <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><Monitor className="h-3 w-3" /> {row.original.impressions}</span>
                <span className="flex items-center gap-1 text-green-600"><TrendingUp className="h-3 w-3" /> {row.original.clicks}</span>
            </div>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
    }
];
