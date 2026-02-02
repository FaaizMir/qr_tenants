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
const getStatusBadge = (status) => {
  const statusConfig = {
    scheduled: {
      variant: "default",
      label: "Scheduled",
      class: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    sent: {
      variant: "secondary",
      label: "Sent",
      class: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    failed: {
      variant: "destructive",
      label: "Failed",
      class: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    cancelled: {
      variant: "outline",
      label: "Cancelled",
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
const ActionsCell = ({ campaign, onEdit, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
            Campaign Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/merchant/campaigns/${campaign.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Details</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onEdit(campaign)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Campaign
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{campaign.campaign_name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(campaign.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getCampaignColumns = (onEdit, onDelete) => [
  {
    accessorKey: "campaign_name",
    header: "Campaign",
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
    header: "Scheduled Date",
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
    header: "Audience",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="capitalize text-sm">
          {row.getValue("target_audience") || "All"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "send_coupons",
    header: "Coupon",
    cell: ({ row }) => {
      const sendCoupons = row.getValue("send_coupons");
      return sendCoupons ? (
        <div className="flex items-center gap-1.5 text-green-600">
          <Ticket className="h-4 w-4" />
          <span className="text-sm font-medium">Included</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">No</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="flex items-center justify-center">
          <ActionsCell
            campaign={campaign}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      );
    },
  },
];
