"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import axiosInstance from "@/lib/axios";
import { couponsColumns } from "./coupons-listing-columns";
import { toast } from "@/lib/toast";
import useDebounce from "@/hooks/useDebounceRef";

export default function MerchantCouponsListingContainer({ embedded = false }) {
  const t = useTranslations("merchantCoupons");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const debouncedSearch = useDebounce(search, 500);
  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const resp = await axiosInstance.get("/coupon-batches", {
          params: { page: page + 1, pageSize },
        });
        console.log("Coupons API Response:", resp);

        // Handle various response structures (axios wrapped vs interceptor unwrapped)
        // Expected: { data: { batches: [], total: N } } OR { batches: [], total: N }
        const data = resp?.data?.data || resp?.data || resp || {};

        console.log("Extracted Data:", data);

        setCoupons(data.batches || []);
        setTotal(data.total || (data.batches || []).length);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          t("errors.failedToLoadCouponsBatches");
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [page, pageSize, t]);

  const filteredData = coupons.filter((item) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return (
      (item.batch_name || "").toLowerCase().includes(q) ||
      (item.batch_type || "").toLowerCase().includes(q)
    );
  });

  const paginatedData = filteredData;

  const handleDeleteCoupon = async (batch) => {
    try {
      await axiosInstance.delete(`/coupon-batches/${batch.id}`);

      toast.success(t("messages.batchDeleted"));

      setCoupons((prev) => prev.filter((c) => c.id !== batch.id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        t("errors.failedToDeleteCouponBatch");
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("listing.title")}</h1>
            <p className="text-muted-foreground">
              {t("listing.subtitle")}
            </p>
          </div>
          <Link href="/en/merchant/coupons/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("listing.createBatch")}
            </Button>
          </Link>
        </div>
      )}

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          <TableToolbar
            placeholder={t("listing.searchPlaceholder")}
            onSearchChange={setSearch}
          />
          <DataTable
            data={paginatedData}
            columns={couponsColumns(handleDeleteCoupon, t)}
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            setPageSize={setPageSize}
            loading={loading}
            pagination={true}
            columnNameTranslations={{
              batchName: t("listing.columnNames.batchName"),
              batch_name: t("listing.columnNames.batchName"),
              batchType: t("listing.columnNames.batchType"),
              batch_type: t("listing.columnNames.batchType"),
              type: t("listing.columnNames.type"),
              usage: t("listing.columnNames.usage"),
              validity: t("listing.columnNames.validity"),
              status: t("listing.columnNames.status"),
              isActive: t("listing.columnNames.isActive"),
              is_active: t("listing.columnNames.isActive"),
              actions: t("listing.columnNames.actions"),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
