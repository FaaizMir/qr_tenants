export const transactionColumns = (tAgentWallet) => [
  { accessorKey: "date", header: tAgentWallet("date") },
  { accessorKey: "description", header: tAgentWallet("descriptioncolumn") },
  {
    accessorKey: "amount",
    header: tAgentWallet("amount"),
    cell: ({ row }) => (
      <span
        className={row.original.amount >= 0 ? "text-green-600" : "text-red-600"}
      >
        {row.original.amount >= 0 ? "+" : "-"}${Math.abs(row.original.amount)}
      </span>
    ),
  },
  { accessorKey: "status", header: tAgentWallet("status") },
];

export const deductionColumns = (tAgentWallet) => [
  { accessorKey: "date", header: tAgentWallet("date") },
  { accessorKey: "description", header: tAgentWallet("descriptioncolumn") },
  {
    accessorKey: "amount",
    header: tAgentWallet("amount"),
    cell: ({ row }) => (
      <span className="text-red-600">-${row.original.amount}</span>
    ),
  },
  { accessorKey: "frequency", header: tAgentWallet("frequency") },
];
