import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";

export const merchantsColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        accessorKey: "subscription",
        header: "Subscription",
        cell: ({ row }) => <StatusBadge status={row.original.subscription} />,
    },
    { accessorKey: "joinDate", header: "Join Date" },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Link href={`/en/agent/merchants/${row.original.id}`}>
                <Button variant="outline" size="sm">
                    View Details
                </Button>
            </Link>
        ),
    },
];
