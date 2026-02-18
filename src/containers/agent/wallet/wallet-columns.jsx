export const transactionColumns = () => [
  {
    accessorKey: "completed_at",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.completed_at;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "-",
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = Number(row.original.amount || 0);

      return (
        <span
          className={
            amount >= 0
              ? "text-green-600 font-medium"
              : "text-red-600 font-medium"
          }
        >
          {amount >= 0 ? "+" : "-"}${Math.abs(amount).toFixed(2)}
        </span>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`capitalize px-2 py-1 rounded text-xs font-medium ${
          row.original.status === "completed"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
];

export const deductionColumns = () => [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="text-red-600">-${row.original.amount}</span>
    ),
  },
  { accessorKey: "frequency", header: "Frequency" },
];
