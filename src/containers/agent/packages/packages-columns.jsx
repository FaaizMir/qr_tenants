import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Layers,
  Calendar,
  DollarSign,
  Tag,
  CircleDot,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const ActionCell = ({ row, onEdit, onDelete }) => {
  const router = useRouter();
  const pkg = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-9 p-0 hover:bg-muted transition-colors rounded-full"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Package Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() =>
            onEdit ? onEdit(pkg) : router.push(`/agent/packages/edit/${pkg.id}`)
          }
        >
          <Pencil className="mr-2 h-4 w-4 text-blue-500" />
          Edit Package
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 cursor-pointer"
          onClick={() =>
            onDelete ? onDelete(pkg) : console.log("Delete", pkg.id)
          }
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Package
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const PackagesColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: "name",
    header: "Package Info",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 py-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shadow-sm border border-primary/20">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-foreground">
            {row.original.name}
          </span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
            {row.original.description || "No description"}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Pricing",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="flex items-center text-sm font-bold text-emerald-600">
          <DollarSign className="h-3 w-3 mr-0.5" />
          {Number(row.original.price).toLocaleString()}
          <span className="ml-1 text-[10px] text-muted-foreground font-normal">
            {row.original.currency}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground">
          {row.original.price_per_credit} per credit
        </div>
      </div>
    ),
  },
  {
    accessorKey: "credits",
    header: "Credits",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Layers className="h-4 w-4 text-orange-500" />
        <span>{row.original.credits}</span>
      </div>
    ),
  },
  {
    accessorKey: "credit_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.credit_type?.toLowerCase();
      return (
        <Badge
          variant="outline"
          className={cn(
            "capitalize px-2 py-0.5 text-[10px] font-medium border-slate-200",
            type === "whatsapp message" &&
            "bg-green-50 text-green-700 border-green-200",
            type === "paid ads" && "bg-blue-50 text-blue-700 border-blue-200",
            type === "coupon" && "bg-purple-50 text-purple-700 border-purple-200"
          )}
        >
          {row.original.credit_type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "merchant_type",
    header: "Plan",
    cell: ({ row }) => (
      <div className="flex items-center text-[11px] font-medium text-slate-600">
        <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
        <span className="capitalize">{row.original.merchant_type}</span>
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <div className="flex items-center gap-2 font-medium">
          <CircleDot
            className={cn(
              "h-3 w-3",
              active ? "text-emerald-500 fill-emerald-500/20" : "text-slate-300"
            )}
          />
          <span
            className={cn(
              "text-[11px]",
              active ? "text-emerald-700" : "text-slate-500"
            )}
          >
            {active ? "Active" : "Inactive"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "sort_order",
    header: "Rank",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono text-[10px]">
        #{row.original.sort_order}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <ActionCell row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
