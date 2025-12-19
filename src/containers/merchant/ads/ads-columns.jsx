import { StatusBadge } from "@/components/common/status-badge";

export const adsColumns = [
    {
        accessorKey: "campaign",
        header: "Campaign",
        cell: ({ row }) => (
            <div className="font-medium">
                {row.original.campaign}
                <span className="block text-xs text-muted-foreground">
                    {row.original.type}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "clicks", header: "Clicks" },
    // Adding Impressions column if it's not present but useful, based on data
    { accessorKey: "impressions", header: "Impressions" },
];
