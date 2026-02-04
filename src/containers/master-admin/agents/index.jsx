"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import useDebounce from "@/hooks/useDebounceRef";
import axiosInstance from "@/lib/axios";
import { getAgentsColumns } from "./agent-columns";

export default function AgentMerchantsListingContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  // const tMerchants = useTranslations("dashboard.agentMerchantManagement");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debouncedSearch = useDebounce(search, 500);

  const fetchAgents = useCallback(async () => {
    setLoading(true);

    try {
      const resp = await axiosInstance.get("/admins", {
        params: {
          page: page + 1,
          pageSize,
          search: debouncedSearch,
        },
      });

      /**
       * Expected response:
       * {
       *   data: Admin[],
       *   meta: { total }
       * }
       */
      const items = resp?.data?.data ?? [];

      setTotal(resp?.data?.meta?.total ?? 0);
      setData(items);
    } catch (error) {
      console.error("Failed to load admins", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDeleted = () => {
    fetchAgents();
  };

  const columns = getAgentsColumns(handleDeleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Management</h1>
          <p className="text-muted-foreground">
            Manage your agents and their accounts.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search agents..."
            onSearchChange={setSearch}
            rightSlot={
              <Button
                onClick={() => router.push("/master-admin/agents/create")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Agent
              </Button>
            }
          />
          <DataTable
            data={data}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            setPageSize={setPageSize}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
