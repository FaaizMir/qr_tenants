import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";

export const customersColumns = [
    { accessorKey: "name", header: "Name" },
    {
        id: "contact",
        header: "Phone / Email",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm">{row.original.phone}</span>
                <span className="text-xs text-muted-foreground">
                    {row.original.email}
                </span>
            </div>
        ),
    },
    { accessorKey: "visits", header: "Total Visits" },
    { accessorKey: "lastVisit", header: "Last Visit" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Button variant="ghost" size="sm">
                View History
            </Button>
        ),
    },
];
