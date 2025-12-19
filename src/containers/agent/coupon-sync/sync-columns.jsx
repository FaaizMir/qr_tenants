import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";

export const syncColumns = [
    { accessorKey: "merchant", header: "Merchant" },
    {
        accessorKey: "items",
        header: "Items Synced",
        cell: ({ row }) => `${row.original.items} codes`,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "date", header: "Date & Time" },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
            row.original.status === "failed" && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                >
                    <Play className="h-4 w-4 mr-1" /> Retry
                </Button>
            ),
    },
];
