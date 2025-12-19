export const earningsColumns = (tAgentEarnings) => [
  {
    accessorKey: "merchant",
    header: tAgentEarnings("merchant"),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.merchant}</span>
    ),
  },
  {
    accessorKey: "totalSales",
    header: tAgentEarnings("totalsales"),
    cell: ({ row }) => `$${row.original.totalSales.toLocaleString()}`,
  },
  { accessorKey: "rate", header: tAgentEarnings("commissionrate") },
  {
    accessorKey: "commission",
    header: tAgentEarnings("commissionearned"),
    cell: ({ row }) => (
      <span className="text-green-600 font-semibold">
        ${row.original.commission.toLocaleString()}
      </span>
    ),
  },
];
