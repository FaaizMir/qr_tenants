"use client";

import { useEffect, useState } from "react";
import { Lock, Search, Download } from "lucide-react";
import { getSubscriptionType } from "@/lib/auth-utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { StatusBadge } from "@/components/common/status-badge";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

export default function MerchantCustomerDataContainer() {
  const [subscription, setSubscription] = useState("temporary");
  const [loading, setLoading] = useState(true);

  // Simulated subscription check
  useEffect(() => {
    const type = getSubscriptionType();
    setSubscription(type);
    setLoading(false);
  }, []);

  // Dummy customer data
  const customers = [
    {
      id: 1,
      name: "John Doe",
      phone: "+1 555-0123",
      email: "john@example.com",
      visits: 12,
      lastVisit: "2024-06-02",
      status: "active",
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "+1 555-0124",
      email: "jane@example.com",
      visits: 8,
      lastVisit: "2024-05-28",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      phone: "+1 555-0125",
      email: "mike@example.com",
      visits: 3,
      lastVisit: "2024-04-15",
      status: "inactive",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      phone: "+1 555-0126",
      email: "sarah@example.com",
      visits: 15,
      lastVisit: "2024-06-01",
      status: "active",
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredCustomers.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    { accessorKey: "name", header: "Name" },
    {
      id: "contact",
      header: "Phone / Email",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.original.phone}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.email}
          </span>
        </div>
      ),
    },
    { accessorKey: "visits", header: "Total Visits" },
    { accessorKey: "lastVisit", header: "Last Visit" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          View History
        </Button>
      ),
    },
  ];

  if (loading) return null;

  if (subscription !== "annual") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center space-y-6">
        <div className="bg-muted p-6 rounded-full">
          <Lock className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-3xl font-bold">Premium Feature</h1>
          <p className="text-muted-foreground">
            Customer Data access is available exclusively for Annual Information
            Subscription plan members.
          </p>
        </div>
        <Card className="max-w-sm w-full border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Upgrade to Annual</CardTitle>
            <CardDescription>Unlock full customer insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-2 text-left list-disc list-inside">
              <li>Access detailed customer profiles</li>
              <li>Export customer data (CSV/Excel)</li>
              <li>Advanced segmentation</li>
              <li>Higher coupon limits (10,000/batch)</li>
            </ul>
            <Button className="w-full">Upgrade Now</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Data</h1>
          <p className="text-muted-foreground">
            View and manage your customer database
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search customers..."
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={filteredCustomers.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
