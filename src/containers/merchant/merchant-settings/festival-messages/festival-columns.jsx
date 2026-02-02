"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Gift,
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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

// Actions Cell Component
const ActionsCell = ({ festival, onEdit, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />{" "}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/merchant/festival-messages/${festival.id}`}
              className="flex items-center cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onEdit(festival)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Festival Message
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{festival.festival_name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(festival.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getFestivalColumns = (onEdit, onDelete, onView) => [
  {
    accessorKey: "festival_name",
    header: "Festival Name",
    cell: ({ row }) => {
      const festivalName = row.getValue("festival_name");
      return (
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-orange-500" />
          <span className="font-medium">{festivalName || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message");
      return (
        <div className="max-w-xs">
          <p className="truncate text-sm text-muted-foreground">
            {message || "No message"}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "festival_date",
    header: "Festival Date",
    cell: ({ row }) => {
      const date = row.getValue("festival_date");
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(date)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_recurring",
    header: "Recurring",
    cell: ({ row }) => {
      const isRecurring = row.getValue("is_recurring");
      return isRecurring ? (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          Yes
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          No
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return isActive ? (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Active
        </Badge>
      ) : (
        <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
          Inactive
        </Badge>
      );
    },
  },
  {
    accessorKey: "coupon_batch_id",
    header: "Coupon",
    cell: ({ row }) => {
      const couponBatchId = row.getValue("coupon_batch_id");
      return couponBatchId ? (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          #{couponBatchId}
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          None
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        festival={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
