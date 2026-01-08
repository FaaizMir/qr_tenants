"use client";

import { useTranslations } from "next-intl";
import { kpiData, monthlyEarnings, commissionBreakdown } from "./earnings-data";
import { earningsColumns } from "./earnings-columns";
import { KpiCard } from "@/components/common/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";
import { Download, PieChart, TrendingUp, DollarSign, Calendar, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentEarningsContainer() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const tAgentEarnings = useTranslations("dashboard.agentEarnings");

  const KpiData = kpiData(tAgentEarnings);
  const EarningColumns = earningsColumns(tAgentEarnings);

  // Filter logic
  const filteredBreakdown = commissionBreakdown.filter((item) =>
    item.merchant.toLowerCase().includes(search.toLowerCase()) ||
    item.source.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredBreakdown.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{tAgentEarnings("earnings")}</h1>
          <p className="text-muted-foreground"> {tAgentEarnings("description")}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Report (Annual Only)
        </Button>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {KpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} className="border-muted/60" />
        ))}
        {/* Add Profit After Deductions Card */}
        <Card className="border-muted/60 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Net Profit</h3>
              <div className="text-3xl font-bold tracking-tight">$85,240</div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400">
              After all system deductions
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Breakdown Table */}
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{tAgentEarnings("commissionbreakdown")}</CardTitle>
                <CardDescription>Detailed log of earnings from subscriptions, ads, and coupons.</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <Lock className="h-3 w-3" /> Base pricing fixed by Admin
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TableToolbar
              placeholder="Search merchant or source..."
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

        {/* ... (Revenue Sources Widget Remains) ... */}
        {/* Earnings by Service Type (Mini Widget) */}
        <Card className="col-span-3 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Subscriptions", val: "65%", color: "bg-blue-500" },
              { label: "WhatsApp Markup", val: "15%", color: "bg-green-500" },
              { label: "Ad Boosts", val: "12%", color: "bg-purple-500" },
              { label: "Temp. Merchants", val: "8%", color: "bg-orange-500" },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold">{item.val}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: item.val }}></div>
                </div>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t mt-auto">
            <h4 className="text-sm font-medium mb-3">Top Campaign</h4>
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <div className="flex gap-2 items-center mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Summer Sale Boost</span>
              </div>
              <p className="text-xs text-muted-foreground">Generated $450 in 3 days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ... (Monthly Performance Remains) ... */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Monthly Profit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {monthlyEarnings.slice(0, 4).map((m, i) => (
              <div key={i} className="p-4 border rounded-lg text-center hover:bg-muted/30 transition-colors">
                <div className="text-sm text-muted-foreground mb-1">{m.month}</div>
                <div className="text-xl font-bold">${m.earnings}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
