import { StatusBadge } from "@/components/common/status-badge";

export const serialCodesColumns = [
    {
        accessorKey: "code",
        header: "Serial Code",
        cell: ({ row }) => (
            <span className="font-mono font-medium">{row.original.code}</span>
        ),
    },
    { accessorKey: "batch", header: "Batch Name" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "date", header: "Used Date" },
];
