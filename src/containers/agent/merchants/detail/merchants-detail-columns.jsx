import { StatusBadge } from "@/components/common/status-badge";

export const transactionColumns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "description", header: "Description" },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <span className={row.original.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                {row.original.type === 'credit' ? '+' : '-'}${Math.abs(row.original.amount)}
            </span>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />
    }
];
