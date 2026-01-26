"use client";

import {
  Calendar,
  Download,
  FileText,
  Filter,
  Building2,
  Users,
  CreditCard,
  MessageSquare,
  Ticket,
  TrendingUp,
  Globe,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

// Update imports to point to local data if needed, or define locally for now
import { statements } from "./statements-data";
import { getStatementsColumns } from "./statements-columns";
import useDebounce from "@/hooks/useDebounceRef";

export default function StatementsContainer() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role?.toLowerCase() || "agent";

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [year, setYear] = useState("2024");

  const columns = getStatementsColumns(role);

  // Determine display company name based on role
  const getCompanyName = () => {
    if (role === "super_admin") return "Master Platform Admin";
    return user?.companyName || user?.name || "Your Company";
  };

  const companyName = getCompanyName();

  const filteredStatements = statements.filter((item) =>
    item.month.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const paginatedData = filteredStatements.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              {companyName}
            </p>
          </div>
          <h1 className="text-3xl font-bold">
            {role === "super_admin" ? "Master " : role === "merchant" ? "Merchant " : "Agent "}
            Financial Statements
          </h1>
          <p className="text-muted-foreground">
            Monthly auto-generated PDF reports (Day 1 of each month).
            {role === "merchant" && " Includes coupon stats, WhatsApp usage, and ad spend."}
            {role === "agent" && " Includes earnings, fees, package income, costs, and wallet ledger."}
            {role === "super_admin" && " Includes platform revenue, global metrics, and full ledger overview."}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Generate PDF
        </Button>
      </div>

      {/* Current Month Projection Widget */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-linear-to-r from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
              Current Period: June 2024
            </CardTitle>
            <CardDescription>
              Auto-generates on July 1st. Statement header will show {companyName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {role === "merchant" && (
              <div className="space-y-6">
                {/* Merchant Content: Coupons & WhatsApp */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coupons</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm font-medium">Gen: 1,240</p>
                      <p className="text-sm font-medium">Redeemed: 856</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WhatsApp UI</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm font-medium text-emerald-600">Success: 3,450</p>
                      <p className="text-sm font-medium text-red-600">Fail: 12</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">WhatsApp BI</p>
                    <div className="mt-1 space-y-1">
                      <p className="text-sm font-medium text-emerald-600">Success: 890</p>
                      <p className="text-sm font-medium text-red-600">Fail: 5</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ads Purchases</p>
                    <p className="text-2xl font-bold mt-1">$450.00</p>
                  </div>
                </div>

                <div className="border-t border-border mt-4 pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Credit Balances</p>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Coupon Credits</p>
                      <p className="text-lg font-bold">45,000 / 38,200</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">WA UI Credits</p>
                      <p className="text-lg font-bold">12,000 / 8,550</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">WA BI Credits</p>
                      <p className="text-lg font-bold">5,000 / 4,110</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === "agent" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Merchants</p>
                    <p className="text-2xl font-bold mt-1">3</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annual Fees</p>
                    <p className="text-2xl font-bold mt-1">$1,200.00</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Package Income</p>
                    <p className="text-2xl font-bold mt-1">$1,250.00</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Costs Deducted</p>
                    <p className="text-2xl font-bold mt-1 text-red-600">-$306.25</p>
                  </div>
                </div>
                <div className="border-t border-border mt-4 pt-4">
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wallet Opening</p>
                      <p className="text-xl font-bold mt-1">$5,000.00</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wallet Closing</p>
                      <p className="text-xl font-bold mt-1">$7,143.75</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Profit</p>
                      <p className="text-xl font-bold mt-1 text-emerald-600">$2,143.75</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {role === "super_admin" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform Revenue</p>
                    <p className="text-2xl font-bold mt-1">$45,280.00</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ad Revenue</p>
                    <p className="text-2xl font-bold mt-1">$8,450.00</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WA UI Volume</p>
                    <p className="text-2xl font-bold mt-1">1.2M</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WA BI Volume</p>
                    <p className="text-2xl font-bold mt-1">450K</p>
                  </div>
                </div>
                <div className="border-t border-border mt-4 pt-4">
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Countries</p>
                      <p className="text-xl font-bold mt-1">12 Active</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Agents</p>
                      <p className="text-xl font-bold mt-1">UK, MY, IN</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Agents</p>
                      <p className="text-xl font-bold mt-1">48</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Statement Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Fiscal Year
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
              <p className="font-semibold mt-2">Auto-Generation Schedule</p>
              <p>Every month on day 1</p>
              <p className="mt-2 text-xs">
                Statements include {role === "super_admin" ? "full ledger overview" : "ledger lines with all transactions"}.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Statement History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search by month..."
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
