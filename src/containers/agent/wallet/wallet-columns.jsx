export const transactionColumns = (t) => [
  {
    accessorKey: "completed_at",
    header: t("transactions.columns.date"),
    meta: {
      label: t("transactions.columns.date"),
    },
    cell: ({ row }) => {
      const date = row.original.completed_at;
      return date ? new Date(date).toLocaleDateString() : t("transactions.noData");
    },
  },

  {
    accessorKey: "description",
    header: t("transactions.columns.description"),
    meta: {
      label: t("transactions.columns.description"),
    },
    cell: ({ row }) => row.original.description || t("transactions.noData"),
  },

  {
    accessorKey: "type",
    header: t("transactions.columns.type"),
    meta: {
      label: t("transactions.columns.type"),
    },
    cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
  },

  {
    accessorKey: "amount",
    header: t("transactions.columns.amount"),
    meta: {
      label: t("transactions.columns.amount"),
    },
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
    header: t("transactions.columns.status"),
    meta: {
      label: t("transactions.columns.status"),
    },
    cell: ({ row }) => (
      <span
        className={`capitalize px-2 py-1 rounded text-xs font-medium ${
          row.original.status === "completed"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {row.original.status === "completed" ? t("transactions.status.completed") : t("transactions.status.pending")}
      </span>
    ),
  },
];

export const deductionColumns = (t) => [
  { 
    accessorKey: "date", 
    header: t("deductions.columns.date"),
    meta: {
      label: t("deductions.columns.date"),
    },
  },
  { 
    accessorKey: "description", 
    header: t("deductions.columns.description"),
    meta: {
      label: t("deductions.columns.description"),
    },
  },
  {
    accessorKey: "amount",
    header: t("deductions.columns.amount"),
    meta: {
      label: t("deductions.columns.amount"),
    },
    cell: ({ row }) => (
      <span className="text-red-600">-${row.original.amount}</span>
    ),
  },
  { 
    accessorKey: "frequency", 
    header: t("deductions.columns.frequency"),
    meta: {
      label: t("deductions.columns.frequency"),
    },
  },
];
