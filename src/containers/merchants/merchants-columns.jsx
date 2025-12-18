"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Store,
  QrCode,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const merchantsColumns = (
  onEdit,
  onDelete,
  onViewDetails,
  onShowQRCode
) => {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent"
        >
          Merchant Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const merchant = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{merchant.name}</div>
              <div className="text-sm text-muted-foreground">
                {merchant.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "subdomain",
      header: "Subdomain",
      cell: ({ row }) => (
        <div className="text-sm font-mono">{row.original.subdomain}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.phone || "N/A"}</div>
      ),
    },
    {
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          active: { variant: "default", label: "Active" },
          inactive: { variant: "secondary", label: "Inactive" },
          suspended: { variant: "destructive", label: "Suspended" },
        };
        const config = statusConfig[status] || statusConfig.inactive;
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      header: "Stores",
      accessorKey: "storeCount",
      cell: ({ row }) => (
        <div className="text-sm font-medium">{row.original.storeCount || 0}</div>
      ),
    },
    {
      id: "qrCode",
      header: "QR Code",
      cell: ({ row }) => {
        const merchant = row.original;
        const merchantUrl = `https://${merchant.subdomain}.example.com`;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onShowQRCode && onShowQRCode(merchant)}
              >
                <div className="h-10 w-10 p-1 bg-white rounded border">
                  <QRCodeSVG
                    value={merchantUrl}
                    size={36}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to view/download QR code</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      enableSorting: false,
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const merchant = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-secondary hover:text-secondary"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => onViewDetails(merchant)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(merchant)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Merchant
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(merchant)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Merchant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};

