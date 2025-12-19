"use client";

import { KpiCard } from "@/components/common/kpi-card";
import { ChartWrapper } from "@/components/common/chart-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";

import { kpiData, monthlyEarnings, commissionBreakdown } from "./earnings-data";
import { earningsColumns } from "./earnings-columns";
import { useTranslations } from "next-intl";

export default function AgentEarningsContainer() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const tAgentEarnings = useTranslations("dashboard.agentEarnings");

  const KpiData = kpiData(tAgentEarnings);
  const EarningColumns = earningsColumns(tAgentEarnings);
  const filteredBreakdown = commissionBreakdown.filter((item) =>
    item.merchant.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredBreakdown.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{tAgentEarnings("earnings")}</h1>
        <p className="text-muted-foreground">{tAgentEarnings("description")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {KpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* Monthly Earnings Chart */}
      {/* <ChartWrapper title={tAgentEarnings("monthlyearnings")}>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Bar chart showing monthly earnings trend: $
          {monthlyEarnings.map((m) => m.earnings).join(", ")}
        </div>
      </ChartWrapper> */}

      {/* Commission Calculation */}
      <Card>
        <CardHeader>
          <CardTitle>{tAgentEarnings("commissionbreakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder={tAgentEarnings("searchmerchants")}
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={EarningColumns}
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
          <CardTitle>{tAgentEarnings("topperformingmerchants")}</CardTitle>
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
