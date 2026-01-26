import { Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const commonColumns = [
    {
        accessorKey: "month",
        header: "Billing Period",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <span className="font-medium block">{row.original.month}</span>
                    <span className="text-xs text-muted-foreground">ID: STM-{row.original.id}</span>
                </div>
            </div>
        ),
    },
];

const actionColumn = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
        <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-2">
                <Download className="h-3.5 w-3.5" />
                PDF
            </Button>
        </div>
    ),
};

export const getStatementsColumns = (role) => {
    if (role === "merchant") {
        return [
            ...commonColumns,
            {
                accessorKey: "coupons",
                header: "Coupons",
                cell: ({ row }) => (
                    <div className="text-xs">
                        <span className="block">Gen: {row.original.generated || 1200}</span>
                        <span className="text-muted-foreground">Red: {row.original.redeemed || 800}</span>
                    </div>
                ),
            },
            {
                accessorKey: "whatsapp",
                header: "WhatsApp (UI/BI)",
                cell: ({ row }) => (
                    <div className="text-xs">
                        <span className="block">UI: {row.original.wa_ui || 4500}</span>
                        <span className="text-muted-foreground">BI: {row.original.wa_bi || 1200}</span>
                    </div>
                ),
            },
            {
                accessorKey: "adSpend",
                header: "Ad Spend",
                cell: ({ row }) => <span className="font-medium">${(row.original.adSpend || 450).toLocaleString()}</span>,
            },
            actionColumn,
        ];
    }

    if (role === "super_admin") {
        return [
            ...commonColumns,
            {
                accessorKey: "totalRevenue",
                header: "Total Revenue",
                cell: ({ row }) => <span className="font-bold text-emerald-600">${(row.original.totalRevenue || 125000).toLocaleString()}</span>,
            },
            {
                accessorKey: "waVolume",
                header: "WA Volume (UI/BI)",
                cell: ({ row }) => (
                    <div className="text-xs">
                        <span className="block">UI: {row.original.wa_ui_total || "1.2M"}</span>
                        <span className="text-muted-foreground">BI: {row.original.wa_bi_total || "450K"}</span>
                    </div>
                ),
            },
            {
                accessorKey: "topAgent",
                header: "Top Region",
                cell: ({ row }) => <Badge variant="outline">{row.original.topRegion || "UK Branch"}</Badge>,
            },
            actionColumn,
        ];
    }

    // Default: Agent
    return [
        ...commonColumns,
        {
            accessorKey: "merchants",
            header: "Onboarded",
            cell: ({ row }) => <div className="text-sm">{row.original.merchants || 12} new</div>,
        },
        {
            accessorKey: "totalEarnings",
            header: "Total Income",
            cell: ({ row }) => <span className="text-muted-foreground font-mono">${(row.original.totalEarnings || 4500).toLocaleString()}</span>,
        },
        {
            accessorKey: "netProfit",
            header: "Net Profit",
            cell: ({ row }) => {
                const val = row.original.netProfit || (row.original.totalEarnings || 4500) - (row.original.costs || 300);
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">${val.toLocaleString()}</Badge>;
            },
        },
        actionColumn,
    ];
};

// Kept for backward compatibility if needed immediately, but should be replaced by getStatementsColumns calls
export const statementsColumns = getStatementsColumns("agent");
