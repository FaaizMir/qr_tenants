import Link from "next/link";
import { Eye, Copy, MoreHorizontal, FileText, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const couponsColumns = (onDelete) => [
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
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            isActive
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
    cell: ({ row }) => {
      const batch = row.original;

      return (
        <div className="flex items-center justify-start pr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1.5">
                Coupon Options
              </DropdownMenuLabel>

              {/* View */}
              <DropdownMenuItem asChild>
                <Link href={`/en/merchant/coupons/${batch.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="font-medium">Details</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Delete with AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="font-medium">Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete coupon batch?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete{" "}
                      <b>{batch.batch_name}</b>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onDelete(batch)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
