"use client";

import { Badge } from "@/components/ui/badge";
import { User, MapPin, ImageIcon, Play } from "lucide-react";
import { ApprovalStatusToggle } from "./approval-status-toggle";
import Image from "next/image";

export const getApprovalColumns = (handleStatusUpdate) => [
  {
    accessorKey: "name",
    header: "Business & Account",
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
    header: "Ad Content",
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
                  alt="Ad"
                  className="object-cover rounded shadow-inner group-hover:opacity-80 transition-opacity"
                />
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic px-2">
              <ImageIcon className="h-3.5 w-3.5" />
              No Ad
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "approvalType",
    header: "Approval Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.approvalType?.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "paid_ad_placement",
    header: "Ad Placement",
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
    header: "Merchant Type",
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
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
        <span className="truncate max-w-[150px]">{row.original.location}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Requested Date",
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {row.original.createdAt}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Approval Status",

    cell: ({ row }) => (
      <ApprovalStatusToggle
        initialStatus={row.original.status}
        merchantName={row.original.name}
        onStatusChange={(newStatus) =>
          handleStatusUpdate(row.original.id, newStatus)
        }
      />
    ),
  },
];
