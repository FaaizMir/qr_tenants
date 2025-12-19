"use client";

import { RefreshCw, Play } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";

export default function AgentCouponSyncContainer() {
  // Dummy sync data
  const syncHistory = [
    {
      id: 1,
      merchant: "Coffee House",
      items: 50,
      status: "completed",
      date: "2024-06-02 10:30 AM",
    },
    {
      id: 2,
      merchant: "Pizza Palace",
      items: 100,
      status: "in-progress",
      date: "2024-06-02 11:15 AM",
    },
    {
      id: 3,
      merchant: "Beauty Salon",
      items: 25,
      status: "completed",
      date: "2024-06-01 02:45 PM",
    },
    {
      id: 4,
      merchant: "Pet Store",
      items: 0,
      status: "failed",
      date: "2024-05-31 09:20 AM",
    },
    {
      id: 5,
      merchant: "Book Shop",
      items: 75,
      status: "completed",
      date: "2024-05-30 04:10 PM",
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredHistory = syncHistory.filter((item) =>
    item.merchant.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredHistory.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    { accessorKey: "merchant", header: "Merchant" },
    {
      accessorKey: "items",
      header: "Items Synced",
      cell: ({ row }) => `${row.original.items} codes`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "date", header: "Date & Time" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) =>
        row.original.status === "failed" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <Play className="h-4 w-4 mr-1" /> Retry
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupon Sync Management</h1>
          <p className="text-muted-foreground">
            Monitor and trigger coupon synchronizations
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Request New Sync
        </Button>
      </div>

      {/* Pending Syncs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Synchronizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Pizza Palace</p>
                <p className="text-sm text-muted-foreground">
                  Syncing 100 serial codes...
                </p>
              </div>
            </div>
            <StatusBadge status="in-progress" />
          </div>
        </CardContent>
      </Card>

      {/* Sync History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search sync history..."
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={filteredHistory.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
