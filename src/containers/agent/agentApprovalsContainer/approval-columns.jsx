"use client";

import { Badge } from "@/components/ui/badge";
import { User, MapPin, ImageIcon } from "lucide-react";
import { ApprovalStatusToggle } from "./approval-status-toggle";
import QRImageDialogHover from "@/components/common/qr-image-dialog";


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
        header: "Ad Image",
        cell: ({ row }) => {
            const img = row.original.adImage;
            return (
                <div className="flex items-center justify-start">
                    {img ? (
                        <div className="rounded-md border p-0.5 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <QRImageDialogHover
                                imageBase64={img}
                                filename={`ad-${row.original.id}.png`}
                                label={`Ad: ${row.original.name}`}
                                sizeClass="w-10 h-10"
                            />
                        </div>
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
                onStatusChange={(newStatus) => handleStatusUpdate(row.original.id, newStatus)}
            />
        ),
    },
];
