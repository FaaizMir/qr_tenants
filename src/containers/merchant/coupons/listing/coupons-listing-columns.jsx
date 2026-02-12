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

export const couponsColumns = (onDelete, t) => [
  {
    accessorKey: "batch_name",
    header: t("listing.columns.batchName"),
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
    header: t("listing.columns.type"),
    cell: ({ row }) => (
      <div className="capitalize">{row.original.batch_type}</div>
    ),
  },
  {
    id: "usage",
    header: t("listing.columns.usage"),
    cell: ({ row }) => {
      const issued = row.original.issued_quantity ?? 0;
      const total = row.original.total_quantity ?? 0;
      const pct = total > 0 ? Math.round((issued / total) * 100) : 0;
      return (
        <div className="flex flex-col gap-1 w-[90px]">
          <div className="flex justify-between items-center text-xs">
            <span>{t("listing.usage.issued", { count: issued })}</span>
            <span className="text-muted-foreground">{t("listing.usage.total", { count: total })}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "validity",
    header: t("listing.columns.validity"),
    cell: ({ row }) => {
      const start = row.original.start_date;
      const end = row.original.end_date;
      if (!start && !end) return "-";
      return (
        <div className="flex flex-col text-xs space-y-0.5">
          {start && <span>{t("listing.validity.from")} {new Date(start).toLocaleDateString()}</span>}
          {end && (
            <span>
              {t("listing.validity.to")} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {new Date(end).toLocaleDateString()}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: t("listing.columns.status"),
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
          {isActive ? t("listing.status.active") : t("listing.status.inactive")}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: t("listing.columns.actions"),
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
                {t("listing.actions.couponOptions")}
              </DropdownMenuLabel>

              {/* View */}
              <DropdownMenuItem asChild>
                <Link href={`/en/merchant/coupons/${batch.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="font-medium">{t("listing.actions.details")}</span>
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
                    <span className="font-medium">{t("listing.actions.delete")}</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("listing.deleteDialog.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("listing.deleteDialog.description")}{" "}
                      <b>{batch.batch_name}</b>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("listing.deleteDialog.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => onDelete(batch)}
                    >
                      {t("listing.deleteDialog.confirm")}
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
