import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ActionCell = ({ row, onEdit, onDelete }) => {
    const t = useTranslations("merchantLuckyDraw.columns.actionsMenu");
    const prize = row.original;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("openMenu")}</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>

                <DropdownMenuItem onClick={() => onEdit && onEdit(prize)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("edit")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete && onDelete(prize)}
                >
                    <Trash className="mr-2 h-4 w-4" />
                    {t("delete")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const PrizesColumns = ({ onEdit, onDelete }) => {
    const t = useTranslations("merchantLuckyDraw.columns");
    
    return [
        {
            accessorKey: "prize_name",
            header: t("prizeName"),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.prize_name}</span>
            ),
        },
        {
            accessorKey: "prize_description",
            header: t("description"),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground line-clamp-2">
                    {row.original.prize_description}
                </span>
            ),
        },
        {
            accessorKey: "prize_type",
            header: t("type"),
            cell: ({ row }) => (
                <Badge variant="outline" className="capitalize">
                    {row.original.prize_type}
                </Badge>
            ),
        },
        {
            accessorKey: "probability",
            header: t("probability"),
            cell: ({ row }) => (
                <span className="font-medium">{row.original.probability}%</span>
            ),
        },
        {
            accessorKey: "daily_limit",
            header: t("dailyLimit"),
        },
        {
            accessorKey: "total_limit",
            header: t("totalLimit"),
        },
        {
            accessorKey: "is_active",
            header: t("status"),
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? "success" : "destructive"}>
                    {row.original.is_active ? t("statusActive") : t("statusInactive")}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: t("actions"),
            cell: ({ row }) => (
                <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
            ),
        },
    ];
};
