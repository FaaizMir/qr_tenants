import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";

export const merchantsColumns = (tMerchants) => [
  { accessorKey: "name", header: tMerchants("name") },
  { accessorKey: "email", header: tMerchants("email") },
  {
    accessorKey: "status",
    header: tMerchants("status"),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "subscription",
    header: tMerchants("subscription"),
    cell: ({ row }) => <StatusBadge status={row.original.subscription} />,
  },
  { accessorKey: "joinDate", header: tMerchants("joindate") },
  {
    id: "actions",
    header: tMerchants("actions"),
    cell: ({ row }) => (
      <Link href={`/en/agent/merchants/${row.original.id}`}>
        <Button variant="outline" size="sm">
          {tMerchants("viewdetails")}
        </Button>
      </Link>
    ),
  },
];
