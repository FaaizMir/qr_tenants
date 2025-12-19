"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

import { merchants } from "./merchants-listing-data";
import { merchantsColumns } from "./merchants-listing-columns";

export default function AgentMerchantsListingContainer() {
  const [searchTerm, setSearchTerm] = useState("");
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
            columns={merchantsColumns}
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
