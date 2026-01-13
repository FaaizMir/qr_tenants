"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

import { getMerchantsColumns } from "./merchants-listing-columns";
import { useTranslations } from "next-intl";
import { getMerchants } from "@/lib/services/helper";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function AgentMerchantsListingContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const tMerchants = useTranslations("dashboard.agentMerchantManagement");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter()

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      // API expects 1-based page
      const resp = await getMerchants({ page: page + 1, pageSize, search });
      // resp expected shape: { data: [...], meta: { total, page, pageSize } }
      const items = resp?.data || resp || [];

      // Map backend items to table shape
      const mapped = items.map((m) => ({
        id: m.id,
        name: m.business_name || m.user?.name || "-",
        email: m.user?.email || "",
        businessType: m.business_type || "-",
        location: m.city && m.country ? `${m.city}, ${m.country}` : (m.city || m.country || "-"),
        status: (m.user?.is_active ?? m.is_active) ? "active" : "inactive",
        subscription: m.merchant_type || m.subscription || "-",
        joinDate: m.created_at ? new Date(m.created_at).toLocaleDateString() : "-",
        raw: m,
      }));

      setData(mapped);
      setTotal(resp?.meta?.total ?? mapped.length);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load merchants", e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleDeleted = () => {
    fetchMerchants();
  };

  const columns = getMerchantsColumns(handleDeleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {tMerchants("merchantmanagement")}
          </h1>
          <p className="text-muted-foreground">{tMerchants("description")}</p>
        </div>
        <Button onClick={() => router.push("/agent/merchants/create")}>
          <Plus className="mr-2 h-4 w-4" />
          {tMerchants("addmerchant")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle> {tMerchants("allmerchants")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder={tMerchants("searchmerchants")}
            onSearchChange={setSearch}
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
