import { StatusBadge } from "@/components/common/status-badge";

export const serialCodesColumns = [
    {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "customer", header: "Redeemed By" },
    { accessorKey: "usedDate", header: "Redemption Date" },
];
