import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit2,
  Trash2,
  FileText,
  CalendarClock,
  Users,
  Ticket,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { Link } from "@/i18n/routing";
import { useState } from "react";

// Format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get status badge
const getStatusBadge = (status, t) => {
  const statusConfig = {
    scheduled: {
      variant: "default",
      label: t("scheduled"),
      class: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    processing: {
      variant: "secondary",
      label: t("processing"),
      class: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    },
    completed: {
      variant: "secondary",
      label: t("completed"),
      class: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    failed: {
      variant: "destructive",
      label: t("failed"),
      class: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    cancelled: {
      variant: "outline",
      label: t("cancelled"),
      class: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    },
  };
  const config = statusConfig[status] || statusConfig.scheduled;
  return (
    <Badge variant={config.variant} className={config.class}>
      {config.label}
    </Badge>
  );
};

// Actions Cell Component
const ActionsCell = ({ campaign, onEdit, onDelete, onCancel, t }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const canEdit =
    campaign.status === "scheduled" || campaign.status === "cancelled";
  const canCancel = campaign.status === "scheduled";
  const canDelete =
    campaign.status === "scheduled" || campaign.status === "cancelled";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase">
            {t("actions.campaignOptions")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/merchant/campaigns/${campaign.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>{t("actions.details")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => canEdit && onEdit(campaign)}
            className="flex items-center gap-2 cursor-pointer"
            disabled={!canEdit}
          >
            <Edit2 className="h-4 w-4" />
            <span>{t("actions.edit")}</span>
          </DropdownMenuItem>

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>{t("actions.delete")}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-orange-500" />
              {t("cancelDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelDialog.description", { campaignName: campaign.campaign_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t("cancelDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCancel(campaign.id);
                setCancelDialogOpen(false);
              }}
              className="bg-orange-600 hover:bg-orange-700 rounded-xl"
            >
              {t("cancelDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {t("deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { campaignName: campaign.campaign_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(campaign.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {t("deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getCampaignColumns = (onEdit, onDelete, onCancel, t) => [
  {
    accessorKey: "campaign_name",
    header: t("columns.campaign"),
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-50 to-blue-100 text-blue-600 ">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {row.getValue("campaign_name")}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
            {row.original.campaign_message}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "scheduled_date",
    header: t("columns.scheduledDate"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {formatDate(row.getValue("scheduled_date"))}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "target_audience",
    header: t("columns.audience"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="capitalize text-sm">
          {row.getValue("target_audience") || t("columns.all")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "send_coupons",
    header: t("columns.coupon"),
    cell: ({ row }) => {
      const sendCoupons = row.getValue("send_coupons");
      return sendCoupons ? (
        <div className="flex items-center gap-1.5 text-green-600">
          <Ticket className="h-4 w-4" />
          <span className="text-sm font-medium">{t("columns.included")}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">{t("columns.no")}</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: t("columns.status"),
    cell: ({ row }) => getStatusBadge(row.getValue("status"), t),
  },
  {
    id: "actions",
    header: () => <div className="text-center">{t("columns.actions")}</div>,
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="flex items-center justify-center">
          <ActionsCell
            campaign={campaign}
            onEdit={onEdit}
            onDelete={onDelete}
            onCancel={onCancel}
            t={t}
          />
        </div>
      );
    },
  },
];
