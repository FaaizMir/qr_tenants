import Link from "next/link";
import { Button } from "@/components/ui/button";
import QRImageDialogHover from "@/components/common/qr-image-dialog";
import { MerchantStatusToggle } from "./merchant-status-toggle";
import { DeleteMerchantAction } from "./delete-merchant-action";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Edit } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { User, MapPin, Tag } from "lucide-react";

export const getMerchantsColumns = (onDeleted) => [
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
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {row.original.email}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "businessType",
        header: "Category & Plan",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <Tag className="h-3 w-3" />
                    {row.original.businessType}
                </div>
                <Badge
                    variant="secondary"
                    className="w-fit text-[10px] uppercase tracking-wider font-bold"
                >
                    {row.original.subscription}
                </Badge>
            </div>
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="flex items-center h-full">
                <MerchantStatusToggle
                    initialStatus={row.original.status}
                    merchantId={row.original.id}
                />
            </div>
        ),
    },
    {
        accessorKey: "qr",
        header: () => <div className="text-center font-semibold">QR Scan</div>,
        cell: ({ row }) => {
            const raw = row.original.raw || {};
            const img = raw.qr_code_image || raw.qr_code || null;
            return (
                <div className="flex justify-center">
                    {img ? (
                        <div className="flex items-center justify-center border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden p-0.5">
                            <QRImageDialogHover
                                imageBase64={img}
                                filename={`qr-${row.original.id}.png`}
                                label={`Scan for ${row.original.name}`}
                            />
                        </div>
                    ) : (
                        <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest bg-slate-100 px-2 py-1 rounded">
                            NO QR
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-start pr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1.5">
                                Merchant Options
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/agent/merchants/${row.original.id}`}>
                                    <FileText className="mr-2 h-4 w-4 text-slate-500" />
                                    <span className="font-medium">Details</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/agent/merchants/edit/${row.original.id}`}>
                                    <Edit className="mr-2 h-4 w-4 text-slate-500" />
                                    <span className="font-medium">Edit</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DeleteMerchantAction
                                merchantId={row.original.id}
                                merchantName={row.original.name}
                                onDeleted={onDeleted}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
];
