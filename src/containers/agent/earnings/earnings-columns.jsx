export const earningsColumns = () => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.date;
      return date ? new Date(date).toLocaleDateString() : "—";
    },
  },
  {
    accessorKey: "merchant",
    header: "Merchant",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.merchant}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{row.original.source || "Commission"}</span>
      </div>
    ),
  },
  {
    accessorKey: "totalSales",
    header: () => <div className="text-right">Total Sales</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono text-sm">
        ${(Number(row.original.totalSales) || 0).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: () => <div className="text-right">Commission Rate</div>,
    cell: ({ row }) => <div className="text-right text-muted-foreground">{row.original.rate}</div>
  },
  {
    accessorKey: "commission",
    header: () => <div className="text-right">Commission Earned</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <span className="text-emerald-600 font-bold">
          +${(Number(row.original.commission) || 0).toLocaleString()}
        </span>
      </div>
    ),
  },
];
