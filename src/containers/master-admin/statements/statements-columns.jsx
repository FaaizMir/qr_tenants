import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Calendar,
  Store,
  Users,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export const getStatementsColumns = (onDownload, t) => [
  {
    id: "owner",
    header: t("columns.owner.header"),
    meta: {
      label: t("columns.owner.header"),
    },
    cell: ({ row }) => {
      const ownerType = row.original.owner_type;
      const ownerName = row.original.owner_name;

      const typeConfig = {
        merchant: {
          icon: Store,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-500/10",
          label: t("columns.owner.merchant"),
        },
        agent: {
          icon: Users,
          color: "text-purple-600",
          bg: "bg-purple-50 dark:bg-purple-500/10",
          label: t("columns.owner.agent"),
        },
        super_admin: {
          icon: Shield,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          label: t("columns.owner.superAdmin"),
        },
      };

      const config = typeConfig[ownerType] || typeConfig.merchant;
      const Icon = config.icon;

      return (
        <div className="flex items-start gap-3 py-1">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {ownerName}
            </span>
            <span className="text-xs text-muted-foreground">
              {config.label}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "period",
    header: t("columns.period.header"),
    meta: {
      label: t("columns.period.header"),
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

      const monthName = months[month - 1] || t("columns.period.unknown");

      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {monthName} {year}
            </span>
            <span className="text-xs text-muted-foreground">
              {month}/{year}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: t("columns.status.header"),
    meta: {
      label: t("columns.status.header"),
    },
    cell: ({ row }) => {
      const status = row.original.status || "generated";
      const statusConfig = {
        generated: {
          label: t("columns.status.generated"),
          variant: "default",
          className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10",
        },
        pending: {
          label: t("columns.status.pending"),
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10",
        },
        failed: {
          label: t("columns.status.failed"),
          variant: "destructive",
          className: "bg-red-100 text-red-700 dark:bg-red-500/10",
        },
      };

      const config = statusConfig[status] || statusConfig.generated;

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "generated_at",
    header: t("columns.generatedAt.header"),
    meta: {
      label: t("columns.generatedAt.header"),
    },
    cell: ({ row }) => {
      const date = row.original.generated_at;
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
    header: t("columns.actions.header"),
    meta: {
      label: t("columns.actions.header"),
    },
    cell: ({ row }) => {
      const statementId = row.original.id;
      const ownerName = row.original.owner_name;
      const ownerType = row.original.owner_type;

      return (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => onDownload(statementId, ownerName, ownerType)}
        >
          <Download className="h-4 w-4" />
          {t("columns.actions.downloadPdf")}
        </Button>
      );
    },
  },
];
