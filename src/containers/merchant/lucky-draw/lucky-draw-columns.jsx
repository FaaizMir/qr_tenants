import { Trophy } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";

export const winnersColumns = [
    {
        accessorKey: "name",
        header: "Winner Name",
        cell: ({ row }) => (
            <div className="font-medium flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                    <Trophy className="h-3 w-3" />
                </div>
                {row.original.name}
            </div>
        ),
    },
    { accessorKey: "prize", header: "Prize" },
    { accessorKey: "date", header: "Draw Date" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <StatusBadge
                status={row.original.status === "claimed" ? "completed" : "expired"}
            />
        ),
    },
];
