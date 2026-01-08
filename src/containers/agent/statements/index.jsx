"use client";

import { Calendar, Download, FileText, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Update imports to point to local data if needed, or define locally for now
import { statements } from "./statements-data";
import { statementsColumns } from "./statements-columns";

export default function AgentStatementsContainer() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("2024");

  const filteredStatements = statements.filter((item) =>
    item.month.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredStatements.slice(
    page * pageSize,
    (page + 1) * pageSize
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            Monthly generated reports of earnings, commissions, and deductions.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export All (CSV)
        </Button>
      </div>

      {/* Current Month Projection Widget */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
              Current Period: June 2024
            </CardTitle>
            <CardDescription>Projected statement execution on July 1st, 2024.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-8 mt-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Earnings</p>
                <p className="text-2xl font-bold mt-1">$2,450.00</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Est. Deductions</p>
                <p className="text-2xl font-bold mt-1 text-red-600">-$306.25</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Net Profit</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">$2,143.75</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Statement Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Fiscal Year</label>
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
            <div className="text-xs text-muted-foreground text-center pt-2">
              Statements are read-only and immutable once generated.
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
            columns={statementsColumns}
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
