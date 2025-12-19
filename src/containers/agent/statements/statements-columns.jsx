import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const statementsColumns = [
    {
        accessorKey: "month",
        header: "Month",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.month}</span>
        ),
    },
    {
        accessorKey: "totalEarnings",
        header: "Total Earnings",
        cell: ({ row }) => `$${row.original.totalEarnings.toLocaleString()}`,
    },
    {
        accessorKey: "commission",
        header: "Commission",
        cell: ({ row }) => `$${row.original.commission.toLocaleString()}`,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
            </Button>
        ),
    },
];
