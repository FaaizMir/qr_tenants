import { StatusBadge } from "@/components/common/status-badge";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const serialCodesColumns = [
  {
    accessorKey: "coupon_code",
    header: "Code",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium">
          {row.original.coupon_code}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            navigator.clipboard.writeText(row.original.coupon_code);
            toast.success("Copied to clipboard");
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  /*  {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return customer ? (
                <div className="flex flex-col text-xs">
                    <span className="font-medium">{customer.name || "Customer"}</span>
                    <span className="text-muted-foreground">{customer.email || ""}</span>
                </div>
            ) : (
                <span className="text-muted-foreground text-xs">—</span>
            );
        },
    },*/
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
      return v ? (
        <span className="text-xs text-muted-foreground">
          {new Date(v).toLocaleString()}
        </span>
      ) : (
        "-"
      );
    },
  },
  {
    accessorKey: "redeemed_at",
    header: "Redemption Date",
    cell: ({ row }) => {
      const v = row.original.redeemed_at;
      return v ? (
        <span className="text-xs font-medium">
          {new Date(v).toLocaleString()}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">Not redeemed</span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return row.original.pdf_url ? (
        <a href={row.original.pdf_url} target="_blank" rel="noreferrer">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </a>
      ) : null;
    },
  },
];
