export const earningsColumns = (t) => [
  {
    accessorKey: "date",
    header: t("columns.date"),
    meta: {
      label: t("columns.date"),
    },
    cell: ({ row }) => {
      const date = row.original.date;
      return date ? new Date(date).toLocaleDateString() : t("noData");
    },
  },
  {
    accessorKey: "merchant",
    header: t("columns.merchant"),
    meta: {
      label: t("columns.merchant"),
    },
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.merchant}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{row.original.source || t("columns.source")}</span>
      </div>
    ),
  },
  {
    accessorKey: "totalSales",
    header: () => <div className="text-right">{t("columns.totalSales")}</div>,
    meta: {
      label: t("columns.totalSales"),
    },
    cell: ({ row }) => (
      <div className="text-right font-mono text-sm">
        ${(Number(row.original.totalSales) || 0).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "rate",
    header: () => <div className="text-right">{t("columns.commissionRate")}</div>,
    meta: {
      label: t("columns.commissionRate"),
    },
    cell: ({ row }) => <div className="text-right text-muted-foreground">{row.original.rate}</div>
  },
  {
    accessorKey: "commission",
    header: () => <div className="text-right">{t("columns.commissionEarned")}</div>,
    meta: {
      label: t("columns.commissionEarned"),
    },
    cell: ({ row }) => (
      <div className="text-right">
        <span className="text-emerald-600 font-bold">
          +${(Number(row.original.commission) || 0).toLocaleString()}
        </span>
      </div>
    ),
  },
];
