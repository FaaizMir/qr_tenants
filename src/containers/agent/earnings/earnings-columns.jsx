export const earningsColumns = [
    {
        accessorKey: "merchant",
        header: "Merchant",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.merchant}</span>
        ),
    },
    {
        accessorKey: "totalSales",
        header: "Total Sales",
        cell: ({ row }) => `$${row.original.totalSales.toLocaleString()}`,
    },
    { accessorKey: "rate", header: "Commission Rate" },
    {
        accessorKey: "commission",
        header: "Commission Earned",
        cell: ({ row }) => (
            <span className="text-green-600 font-semibold">
                ${row.original.commission.toLocaleString()}
            </span>
        ),
    },
];
