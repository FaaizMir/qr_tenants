"use client";

import { FileText, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AgentStatementsContainer() {
  // Dummy statement data
  const statements = [
    {
      id: 1,
      month: "May 2024",
      totalEarnings: 5200,
      commission: 650,
      downloads: 3,
    },
    {
      id: 2,
      month: "April 2024",
      totalEarnings: 4800,
      commission: 600,
      downloads: 1,
    },
    {
      id: 3,
      month: "March 2024",
      totalEarnings: 3500,
      commission: 437.5,
      downloads: 2,
    },
    {
      id: 4,
      month: "February 2024",
      totalEarnings: 3800,
      commission: 475,
      downloads: 1,
    },
    {
      id: 5,
      month: "January 2024",
      totalEarnings: 3200,
      commission: 400,
      downloads: 4,
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredStatements = statements.filter((item) =>
    item.month.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredStatements.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.month}</span>
      ),
    },
    {
      accessorKey: "totalEarnings",
      header: "Total Earnings",
      cell: ({ row }) => `$${row.original.totalEarnings.toLocaleString()}`,
    },
    {
      accessorKey: "commission",
      header: "Commission",
      cell: ({ row }) => `$${row.original.commission.toLocaleString()}`,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            View and download your monthly statements
          </p>
        </div>
      </div>

      {/* Current Month Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Current Month (June 2024)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">
                Estimated Earnings
              </p>
              <p className="text-2xl font-bold">$2,450.00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission</p>
              <p className="text-2xl font-bold">$306.25</p>
            </div>
            <div className="flex items-end">
              <p className="text-sm text-muted-foreground italic">
                Statement will be available on July 1st
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex items-center gap-4 max-w-sm">
        <label className="text-sm font-medium whitespace-nowrap">
          Filter by year:
        </label>
        <Input type="number" defaultValue="2024" className="w-32" />
        <Button variant="secondary">Apply</Button>
      </div>

      {/* Statements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Statements</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search statements..."
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={filteredStatements.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
