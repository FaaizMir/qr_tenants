import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";

export const getMerchantStatementsColumns = (onDownload) => [
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => {
      const month = row.original.month;
      const year = row.original.year;

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
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
              Month {month}, {year}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "generated";
      const statusConfig = {
        generated: { label: "Generated", variant: "default" },
        pending: { label: "Pending", variant: "secondary" },
        failed: { label: "Failed", variant: "destructive" },
      };

      const config = statusConfig[status] || statusConfig.generated;

      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "total_spend",
    header: "Total Spend",
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
    header: "Generated At",
    cell: ({ row }) => {
      const date = row.original.created_at || row.original.generated_at;
      if (!date) return "—";

      try {
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), "MMM dd, yyyy HH:mm")}
          </span>
        );
      } catch (error) {
        return "—";
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
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
          Download PDF
        </Button>
      );
    },
  },
];
