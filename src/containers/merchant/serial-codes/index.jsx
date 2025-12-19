"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { ExportButton } from "@/components/common/export-button";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MerchantSerialCodesContainer() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy serial codes data
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Dummy serial codes data
  const serialCodes = [
    {
      id: 1,
      code: "SUM-8X92",
      batch: "Summer Special",
      status: "used",
      customer: "John Doe",
      date: "2024-06-02",
    },
    {
      id: 2,
      code: "SUM-3A7B",
      batch: "Summer Special",
      status: "used",
      customer: "Jane Smith",
      date: "2024-06-01",
    },
    {
      id: 3,
      code: "WEL-9Y8Z",
      batch: "Welcome Offer",
      status: "unused",
      customer: "-",
      date: "-",
    },
    {
      id: 4,
      code: "WEL-4K2L",
      batch: "Welcome Offer",
      status: "unused",
      customer: "-",
      date: "-",
    },
    {
      id: 5,
      code: "FLA-1M2N",
      batch: "Flash Sale",
      status: "used",
      customer: "Mike Johnson",
      date: "2024-05-25",
    },
    {
      id: 6,
      code: "FLA-3P4Q",
      batch: "Flash Sale",
      status: "used",
      customer: "Sarah Wilson",
      date: "2024-05-25",
    },
  ];

  const filteredCodes = serialCodes.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredCodes.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    {
      accessorKey: "code",
      header: "Serial Code",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{row.original.code}</span>
      ),
    },
    { accessorKey: "batch", header: "Batch Name" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "date", header: "Used Date" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Serial Codes</h1>
        <p className="text-muted-foreground">
          Search and manage all generated coupon codes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search code or customer..."
            onSearchChange={setSearchTerm}
            rightSlot={
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="unused">Unused</SelectItem>
                  </SelectContent>
                </Select>
                <ExportButton />
              </div>
            }
          />
          <DataTable
            data={paginatedData}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={filteredCodes.length}
            setPage={setPage}
            setPageSize={setPageSize}
            style={{ marginTop: "1rem" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
