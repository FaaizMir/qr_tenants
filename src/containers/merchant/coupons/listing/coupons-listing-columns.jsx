import Link from "next/link";
import { Eye, Copy } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const couponsColumns = [
  {
    accessorKey: "batch_name",
    header: "Batch Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-primary">
          {row.original.batch_name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "batch_type",
    header: "Type",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.batch_type}</div>
    ),
  },
  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => {
      const issued = row.original.issued_quantity ?? 0;
      const total = row.original.total_quantity ?? 0;
      const pct = total > 0 ? Math.round((issued / total) * 100) : 0;
      return (
        <div className="flex flex-col gap-1 w-[90px]">
          <div className="flex justify-between items-center text-xs">
            <span>{issued} issued</span>
            <span className="text-muted-foreground">/ {total}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "validity",
    header: "Validity",
    cell: ({ row }) => {
      const start = row.original.start_date;
      const end = row.original.end_date;
      if (!start && !end) return "-";
      return (
        <div className="flex flex-col text-xs space-y-0.5">
          {start && <span>From: {new Date(start).toLocaleDateString()}</span>}
          {end && (
            <span>
              To: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {new Date(end).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Link href={`/en/merchant/coupons/${row.original.id}`}>
          <Button variant="ghost" size="icon" title="View Batch Details">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];
