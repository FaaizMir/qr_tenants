import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";

export const getAgentsColumns = (onDownload, t) => [
  {
    id: "period",
    header: t("columns.period"),
    meta: {
      label: t("columns.period"),
    },
    cell: ({ row }) => {
      const month = row.original.month;
      const year = row.original.year;

      const months = [
        t("months.january"),
        t("months.february"),
        t("months.march"),
        t("months.april"),
        t("months.may"),
        t("months.june"),
        t("months.july"),
        t("months.august"),
        t("months.september"),
        t("months.october"),
        t("months.november"),
        t("months.december"),
      ];

      const monthName = months[month - 1] || "Unknown";

      return (
        <div className="flex items-start gap-3 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-500/10">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {monthName} {year}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("columns.monthLabel", { month, year })}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: t("columns.status"),
    meta: {
      label: t("columns.status"),
    },
    cell: ({ row }) => {
      const status = row.original.status || "generated";
      const statusConfig = {
        generated: { label: t("status.generated"), variant: "default" },
        pending: { label: t("status.pending"), variant: "secondary" },
        failed: { label: t("status.failed"), variant: "destructive" },
      };

      const config = statusConfig[status] || statusConfig.generated;

      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "total_spend",
    header: t("columns.totalSpend"),
    meta: {
      label: t("columns.totalSpend"),
    },
    cell: ({ row }) => {
      const statementData = row.original.statement_data;
      const totalSpend =
        statementData?.revenue?.total_spent || statementData?.total_spent || 0;
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">
            ${parseFloat(totalSpend).toFixed(2)}
          </span>
        </div>
      );
    },
  },
  {
    id: "generated_at",
    header: t("columns.generatedAt"),
    meta: {
      label: t("columns.generatedAt"),
    },
    cell: ({ row }) => {
      const date = row.original.created_at || row.original.generated_at;
      if (!date) return t("columns.noDate");

      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM dd, yyyy HH:mm")}
          </span>
        );
      } catch (error) {
        return t("columns.noDate");
      }
    },
  },
  {
    id: "actions",
    header: t("columns.actions"),
    cell: ({ row }) => {
      const statementId = row.original.id;

      return (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onDownload(statementId)}
        >
          <Download className="h-4 w-4" />
          {t("columns.downloadPdf")}
        </Button>
      );
    },
  },
];
