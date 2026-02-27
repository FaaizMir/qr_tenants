"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";

import { getMerchantsColumns } from "./merchants-listing-columns";
import { getMerchants } from "@/lib/services/helper";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import useDebounce from "@/hooks/useDebounceRef";

export default function AgentMerchantsListingContainer({
  showCreate = true,
  showEdit = true,
  isMasterAdmin = false,
}) {
  const t = useTranslations("agentMerchants.listing");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debouncedSearch = useDebounce(search, 500);

  const fetchMerchants = useCallback(async () => {
    setLoading(true);
    try {
      // API expects 1-based page
      const resp = await getMerchants({
        page: page + 1,
        pageSize,
        search: debouncedSearch,
      });
      // resp expected shape: { data: [...], meta: { total, page, pageSize } }
      const items = resp?.data || resp || [];

      // Map backend items to table shape
      const mapped = items.map((m) => ({
        id: m.id,
        name: m.business_name || m.user?.name || "-",
        email: m.user?.email || "",
        businessType: m.business_type || "-",
        location:
          m.city && m.country
            ? `${m.city}, ${m.country}`
            : m.city || m.country || "-",
        status: (m.user?.is_active ?? m.is_active) ? "active" : "inactive",
        subscription: m.merchant_type || m.subscription || "-",
        joinDate: m.created_at
          ? new Date(m.created_at).toLocaleDateString()
          : "-",
        raw: m,
      }));

      setData(mapped);
      setTotal(resp?.meta?.total ?? mapped.length);
    } catch (e) {
      console.error("Failed to load merchants", e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleDeleted = () => {
    fetchMerchants();
  };

  const columns = getMerchantsColumns(handleDeleted, showEdit, isMasterAdmin, t);

  // Column name translations for visibility dropdown
  const columnNameTranslations = {
    name: t("columnNames.name"),
    businessType: t("columnNames.businessType"),
    location: t("columnNames.location"),
    status: t("columnNames.status"),
    qr: t("columnNames.qr"),
    actions: t("columnNames.actions"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <TableToolbar
            placeholder={t("searchPlaceholder")}
            onSearchChange={setSearch}
            rightSlot={
              showCreate && (
                <Button onClick={() => router.push("/agent/merchants/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addMerchant")}
                </Button>
              )
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
            columnNameTranslations={columnNameTranslations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
