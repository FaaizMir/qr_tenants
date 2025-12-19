"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

export default function AgentMerchantsListingContainer() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy merchant data
  const merchants = [
    {
      id: 1,
      name: "Coffee House",
      email: "coffee@example.com",
      status: "active",
      subscription: "annual",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Pizza Palace",
      email: "pizza@example.com",
      status: "active",
      subscription: "temporary",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Beauty Salon",
      email: "beauty@example.com",
      status: "active",
      subscription: "annual",
      joinDate: "2024-03-10",
    },
    {
      id: 4,
      name: "Pet Store",
      email: "pets@example.com",
      status: "inactive",
      subscription: "temporary",
      joinDate: "2024-01-05",
    },
    {
      id: 5,
      name: "Book Shop",
      email: "books@example.com",
      status: "active",
      subscription: "annual",
      joinDate: "2024-04-18",
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredMerchants = merchants.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredMerchants.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "subscription",
      header: "Subscription",
      cell: ({ row }) => <StatusBadge status={row.original.subscription} />,
    },
    { accessorKey: "joinDate", header: "Join Date" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Link href={`/en/agent/merchants/${row.original.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Merchants Management</h1>
          <p className="text-muted-foreground">
            Manage all your merchants here
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Merchant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Merchants</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search merchants..."
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={filteredMerchants.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
