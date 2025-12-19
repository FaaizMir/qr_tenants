import Link from "next/link";
import { Eye, BarChart2 } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";

export const batchesColumns = [
    { accessorKey: "name", header: "Batch Name" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "used", header: "Used" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "created", header: "Created Date" },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Link href={`/en/merchant/coupons/${row.original.id}`}>
                    <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
                <Link href={`/en/merchant/analytics?batch=${row.original.id}`}>
                    <Button variant="ghost" size="icon" title="Analytics">
                        <BarChart2 className="h-4 w-4" />
                    </Button>
                </Link>
            </div>
        ),
    },
];
