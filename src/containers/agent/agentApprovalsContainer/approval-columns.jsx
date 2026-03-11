"use client";

import { Badge } from "@/components/ui/badge";
import { User, MapPin, ImageIcon, Play } from "lucide-react";
import { ApprovalStatusToggle } from "./approval-status-toggle";
import Image from "next/image";

export const getApprovalColumns = (handleStatusUpdate, t) => [
  {
    accessorKey: "name",
    header: t("columns.businessAccount"),
    meta: { label: t("columns.businessAccount") },
    cell: ({ row }) => (
      <div className="flex items-start gap-3 py-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
          <User className="h-4 w-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {row.original.name}
          </span>
          {row.original.email && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              {row.original.email}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "adImage",
    header: t("columns.adContent"),
    meta: { label: t("columns.adContent") },
    cell: ({ row }) => {
      const url = row.original.adImage;
      const isVideo = row.original.adType === "video";
      return (
        <div className="flex items-center justify-start">
          {url ? (
            <button
              className="rounded-md border p-0.5 bg-white shadow-sm hover:shadow-md transition-all active:scale-95 overflow-hidden group relative"
              onClick={() =>
                row.original.onPreview(
                  row.original.adType,
                  row.original.adImage,
                )
              }
            >
              {isVideo ? (
                <div className="relative w-10 h-10 bg-slate-900 rounded flex items-center justify-center">
                  <video
                    src={url}
                    className="w-full h-full object-cover rounded opacity-80"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              ) : (
                <Image
                  width={40}
                  height={40}
                  src={url}
                  alt={t("common.adAltText")}
                  className="object-cover rounded shadow-inner group-hover:opacity-80 transition-opacity"
                />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic px-2">
              <ImageIcon className="h-3.5 w-3.5" />
              {t("columns.noAd")}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "approvalType",
    header: t("columns.approvalType"),
    meta: { label: t("columns.approvalType") },
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.approvalType?.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "paid_ad_placement",
    header: t("columns.adPlacement"),
    meta: { label: t("columns.adPlacement") },
    cell: ({ row }) => {
      const placement = row.original.paid_ad_placement;
      return (
        <Badge variant="secondary" className="capitalize">
          {placement && placement !== "—"
            ? placement.replaceAll("_", " ")
            : "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "merchant_type",
    header: t("columns.merchantType"),
    meta: { label: t("columns.merchantType") },
    cell: ({ row }) => {
      const merchantType = row.original.merchant_type;
      return (
        <Badge variant="secondary" className="capitalize">
          {merchantType && merchantType !== "—"
            ? merchantType.replaceAll("_", " ")
            : "—"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "location",
    header: t("columns.location"),
    meta: { label: t("columns.location") },
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
        <span className="truncate max-w-[150px]">{row.original.location}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: t("columns.requestedDate"),
    meta: { label: t("columns.requestedDate") },
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.original.createdAt}
      </span>
    ),
  },
  {
    accessorKey: "adStartDate",
    header: t("columns.adStartDate"),
    meta: { label: t("columns.adStartDate") },
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.original.adStartDate || "—"}
      </span>
    ),
  },
  {
    accessorKey: "adEndDate",
    header: t("columns.adEndDate"),
    meta: { label: t("columns.adEndDate") },
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.original.adEndDate || "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: t("columns.approvalStatus"),
    meta: { label: t("columns.approvalStatus") },

    cell: ({ row }) => (
      <ApprovalStatusToggle
        initialStatus={row.original.status}
        merchantName={row.original.name}
        onStatusChange={(newStatus, disapprovalReason) =>
          handleStatusUpdate(row.original.id, newStatus, disapprovalReason)
        }
      />
    ),
  },
];
