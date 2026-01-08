import { Download, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const statementsColumns = [
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
    {
        accessorKey: "merchants",
        header: "Onboarded",
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.merchants || 12} new
            </div>
        )
    },
    {
        accessorKey: "totalEarnings",
        header: "Credits Used",
        cell: ({ row }) => <span className="text-muted-foreground font-mono">{(row.original.creditsUsed || 4500).toLocaleString()}</span>,
    },
    {
        accessorKey: "netProfit",
        header: "Net Profit",
        cell: ({ row }) => {
            // Mock calc if not present
            const val = row.original.netProfit || (row.original.totalEarnings - row.original.commission);
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">${val.toLocaleString()}</Badge>
        }
    },
    {
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
    },
];
