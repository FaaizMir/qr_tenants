"use client";

import { RefreshCw } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";

import { syncHistory } from "./sync-data";
import { syncColumns } from "./sync-columns";

export default function AgentCouponSyncContainer() {
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
            columns={syncColumns}
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
