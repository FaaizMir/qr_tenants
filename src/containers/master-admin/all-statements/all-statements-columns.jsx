import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Calendar,
  FileText,
  User,
  Store,
  Users,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export const getAllStatementsColumns = (onDownload) => [
  {
    id: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const ownerType = row.original.owner_type;
      const ownerName = row.original.owner_name;

      const typeConfig = {
        merchant: {
          icon: Store,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-500/10",
          label: "Merchant",
        },
        agent: {
          icon: Users,
          color: "text-purple-600",
          bg: "bg-purple-50 dark:bg-purple-500/10",
          label: "Agent",
        },
        super_admin: {
          icon: Shield,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          label: "Super Admin",
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
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "generated";
      const statusConfig = {
        generated: {
          label: "Generated",
          variant: "default",
          className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10",
        },
        pending: {
          label: "Pending",
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10",
        },
        failed: {
          label: "Failed",
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
    header: "Generated At",
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
    header: "Actions",
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
          Download PDF
        </Button>
      );
    },
  },
];
