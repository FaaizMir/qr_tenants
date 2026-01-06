import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ActionCell = ({ row, onEdit, onDelete }) => {
    const prize = row.original;

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

                <DropdownMenuItem onClick={() => onEdit && onEdit(prize)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Prize
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete && onDelete(prize)}
                >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Prize
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const PrizesColumns = ({ onEdit, onDelete }) => [
    {
        accessorKey: "prize_name",
        header: "Prize Name",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.prize_name}</span>
        ),
    },
    {
        accessorKey: "prize_description",
        header: "Description",
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground line-clamp-2">
                {row.original.prize_description}
            </span>
        ),
    },
    {
        accessorKey: "prize_type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize">
                {row.original.prize_type}
            </Badge>
        ),
    },
    {
        accessorKey: "probability",
        header: "Probability",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.probability}%</span>
        ),
    },
    {
        accessorKey: "daily_limit",
        header: "Daily Limit",
    },
    {
        accessorKey: "total_limit",
        header: "Total Limit",
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? "success" : "destructive"}>
                {row.original.is_active ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
            <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
        ),
    },
];
