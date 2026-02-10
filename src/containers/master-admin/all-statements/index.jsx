"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Download,
  FileText,
  Building2,
  Loader2,
  Users,
  Store,
  Shield,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { getAllStatementsColumns } from "./all-statements-columns";

export default function AllStatementsContainer() {
  const router = useRouter();

  const [statements, setStatements] = useState({
    merchants: [],
    agents: [],
    super_admin: [],
    all_statements: [],
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());

  const [counts, setCounts] = useState({
    merchants: 0,
    agents: 0,
    super_admin: 0,
  });

  // Fetch statements
  const fetchStatements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/monthly-statements/pdfs/all", {
        params: {
          year: year,
          month: month,
        },
      });

      const data = response.data.data;

      setStatements({
        merchants: data.statements?.merchants || [],
        agents: data.statements?.agents || [],
        super_admin: data.statements?.super_admin || [],
        all_statements: data.all_statements || [],
      });

      setCounts(data.counts || { merchants: 0, agents: 0, super_admin: 0 });
    } catch (error) {
      console.error("Failed to fetch statements:", error);
      toast.error("Failed to load statements. Please try again.");
      setStatements({
        merchants: [],
        agents: [],
        super_admin: [],
        all_statements: [],
      });
      setCounts({ merchants: 0, agents: 0, super_admin: 0 });
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  // Download statement PDF
  const handleDownloadPdf = async (statementId, ownerName, ownerType) => {
    try {
      const response = await axiosInstance.get(
        `/monthly-statements/${statementId}/download`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `statement_${ownerType}_${ownerName}_${year}_${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Statement downloaded successfully!");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDF. Please try again.");
    }
  };

  const columns = getAllStatementsColumns(handleDownloadPdf);

  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Get current tab data
  const getCurrentTabData = () => {
    switch (activeTab) {
      case "merchants":
        return statements.merchants;
      case "agents":
        return statements.agents;
      case "super_admin":
        return statements.super_admin;
      default:
        return statements.all_statements;
    }
  };

  const currentData = getCurrentTabData();
  const paginatedData = currentData.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-zinc-900 p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/master-admin/dashboard")}
            className="rounded-full h-10 w-10 hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
              All Financial Statements
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              View and download monthly statements for merchants, agents, and
              platform admin.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-border/50 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.merchants}</p>
                <p className="text-xs text-muted-foreground">Merchants</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.agents}</p>
                <p className="text-xs text-muted-foreground">Agents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{counts.super_admin}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Statement Filters
          </CardTitle>
          <CardDescription className="text-xs">
            Filter statements by year and month
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Year
              </label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Month
              </label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </label>
              <Button
                variant="outline"
                className="w-full h-9 hover:bg-muted transition-colors"
                onClick={fetchStatements}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh List
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statements Table with Tabs */}
      <Card className="border-border/50 shadow-xs">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Statement History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">
                All ({statements.all_statements.length})
              </TabsTrigger>
              <TabsTrigger value="merchants">
                Merchants ({counts.merchants})
              </TabsTrigger>
              <TabsTrigger value="agents">Agents ({counts.agents})</TabsTrigger>
              <TabsTrigger value="super_admin">
                Admin ({counts.super_admin})
              </TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">
                  Loading statements...
                </p>
              </div>
            ) : currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No Statements Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                  No statements available for the selected period.
                </p>
              </div>
            ) : (
              <DataTable
                data={paginatedData}
                columns={columns}
                page={page}
                pageSize={pageSize}
                total={currentData.length}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
