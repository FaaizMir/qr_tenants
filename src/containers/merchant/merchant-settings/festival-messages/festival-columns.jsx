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

const formatDate = (dateString, t) => {
  if (!dateString) return t("details.na");
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch (error) {
    return t("details.invalidDate");
  }
};

// Actions Cell Component
const ActionsCell = ({ festival, onEdit, onDelete, t }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("actions.openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />{" "}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("actions.actions")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              href={`/merchant/festival-messages/${festival.id}`}
              className="flex items-center cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("actions.viewDetails")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onEdit(festival)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t("actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {t("deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.description", { festivalName: festival.festival_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(festival.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("deleteDialog.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const getFestivalColumns = (onEdit, onDelete, t) => [
  {
    accessorKey: "festival_name",
    header: t("columns.festivalName"),
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
    header: t("columns.message"),
    cell: ({ row }) => {
      const message = row.getValue("message");
      return (
        <div className="max-w-xs">
          <p className="truncate text-sm text-muted-foreground">
            {message || t("columns.noMessage")}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "festival_date",
    header: t("columns.festivalDate"),
    cell: ({ row }) => {
      const date = row.getValue("festival_date");
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(date, t)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "is_recurring",
    header: t("columns.recurring"),
    cell: ({ row }) => {
      const isRecurring = row.getValue("is_recurring");
      return isRecurring ? (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          {t("columns.yes")}
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          {t("columns.no")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: t("columns.status"),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return isActive ? (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          {t("active")}
        </Badge>
      ) : (
        <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
          {t("inactive")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "coupon_batch_id",
    header: t("columns.coupon"),
    cell: ({ row }) => {
      const couponBatchId = row.getValue("coupon_batch_id");
      return couponBatchId ? (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          #{couponBatchId}
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          {t("columns.none")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: t("columns.actions"),
    cell: ({ row }) => (
      <ActionsCell
        festival={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        t={t}
      />
    ),
  },
];
