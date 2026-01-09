import Link from "next/link";
import { Button } from "@/components/ui/button";
import QRImageDialogHover from "@/components/common/qr-image-dialog";
import { MerchantStatusToggle } from "./merchant-status-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Edit, Trash } from "lucide-react";

export const merchantsColumns = [
    {
        accessorKey: "name",
        header: "Business Name",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.name}</span>
                <span className="text-xs text-muted-foreground">{row.original.email}</span>
            </div>
        )
    },
    {
        accessorKey: "subscription",
        header: "Plan",
        cell: ({ row }) => (
            <div className="capitalize">{row.original.subscription}</div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <MerchantStatusToggle
                initialStatus={row.original.status}
                merchantId={row.original.id}
            />
        ),
    },
    {
        accessorKey: "qr",
        header: "QR",
        cell: ({ row }) => {
            const raw = row.original.raw || {};
            const img = raw.qr_code_image || raw.qr_code || null;
            return img ? <QRImageDialogHover imageBase64={img} filename={`qr-${row.original.id}.png`} label={`QR for ${row.original.name}`} /> : <span className="text-muted-foreground text-xs">N/A</span>;
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/agent/merchants/${row.original.id}`} className="cursor-pointer">
                                <FileText className="mr-2 h-4 w-4" /> View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/agent/merchants/edit/${row.original.id}`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                            <Trash className="mr-2 h-4 w-4" /> Delete Merchant
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
