import Link from "next/link";
import { Eye, Copy } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const couponsColumns = [
    { accessorKey: "coupon_code", header: "Code" },
    {
        id: "batch",
        header: "Batch",
        accessorFn: (row) => row.batch?.batch_name || "-",
    },
    {
        id: "merchant",
        header: "Merchant",
        accessorFn: (row) => row.merchant?.business_name || "-",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        accessorKey: "issued_at",
        header: "Issued At",
        cell: ({ row }) => {
            const v = row.original.issued_at;
            return v ? new Date(v).toLocaleString() : "-";
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <div className="flex gap-2">
                <Link href={`/en/merchant/coupons/${row.original.id}`}>
                    <Button variant="ghost" size="icon" title="View Batch">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Copy QR hash"
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(row.original.qr_hash || "");
                            toast.success("QR hash copied to clipboard");
                        } catch (err) {
                            toast.error("Failed to copy");
                        }
                    }}
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];

