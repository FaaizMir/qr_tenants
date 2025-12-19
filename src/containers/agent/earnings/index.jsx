"use client";

import { DollarSign, TrendingUp, Award } from "lucide-react";
import { KpiCard } from "@/components/common/kpi-card";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";

export default function AgentEarningsContainer() {
  // Dummy KPI data
  const kpiData = [
    {
      title: "Total Earnings (YTD)",
      value: "$45,230",
      icon: DollarSign,
      trend: "up",
      trendValue: "+15.3%",
    },
    { title: "Commission Rate", value: "12.5%", icon: TrendingUp },
    { title: "Top Merchant", value: "Coffee House", icon: Award },
  ];

  // Dummy monthly earnings
  const monthlyEarnings = [
    { month: "January", earnings: 3200 },
    { month: "February", earnings: 3800 },
    { month: "March", earnings: 3500 },
    { month: "April", earnings: 4200 },
    { month: "May", earnings: 4800 },
    { month: "June", earnings: 5200 },
  ];

  // Dummy commission breakdown
  const commissionBreakdown = [
    {
      merchant: "Coffee House",
      totalSales: 25000,
      commission: 3125,
      rate: "12.5%",
    },
    {
      merchant: "Pizza Palace",
      totalSales: 18000,
      commission: 2250,
      rate: "12.5%",
    },
    {
      merchant: "Beauty Salon",
      totalSales: 15000,
      commission: 1875,
      rate: "12.5%",
    },
    {
      merchant: "Pet Store",
      totalSales: 12000,
      commission: 1500,
      rate: "12.5%",
    },
    {
      merchant: "Book Shop",
      totalSales: 10000,
      commission: 1250,
      rate: "12.5%",
    },
  ];

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const filteredBreakdown = commissionBreakdown.filter((item) =>
    item.merchant.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredBreakdown.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  const columns = [
    {
      accessorKey: "merchant",
      header: "Merchant",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.merchant}</span>
      ),
    },
    {
      accessorKey: "totalSales",
      header: "Total Sales",
      cell: ({ row }) => `$${row.original.totalSales.toLocaleString()}`,
    },
    { accessorKey: "rate", header: "Commission Rate" },
    {
      accessorKey: "commission",
      header: "Commission Earned",
      cell: ({ row }) => (
        <span className="text-green-600 font-semibold">
          ${row.original.commission.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">
          Track your commission and earnings
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Monthly Earnings Chart */}
      <ChartWrapper title="Monthly Earnings (Last 6 Months)">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Bar chart showing monthly earnings trend: $
          {monthlyEarnings.map((m) => m.earnings).join(", ")}
        </div>
      </ChartWrapper>

      {/* Commission Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown by Merchant</CardTitle>
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
            total={filteredBreakdown.length}
            setPage={setPage}
            setPageSize={setPageSize}
          />
        </CardContent>
      </Card>

      {/* Top Performing Merchants */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Merchants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {commissionBreakdown.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{item.merchant}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.totalSales.toLocaleString()} in sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +${item.commission.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">commission</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
