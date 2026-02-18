"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Copy, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import useDebounce from "@/hooks/useDebounceRef";

const AllCouponsColumns = (t) => [
  {
    accessorKey: "coupon_code",
    header: t("allCoupons.columns.couponCode"),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium">
          {row.original.coupon_code}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            navigator.clipboard.writeText(row.original.coupon_code);
            toast.success(t("allCoupons.copiedToClipboard"));
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    id: "batch_name",
    header: t("allCoupons.columns.batchName"),
    cell: ({ row }) => row.original.batch?.batch_name || "-",
  },
  {
    accessorKey: "status",
    header: t("allCoupons.columns.status"),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "start_date",
    header: t("allCoupons.columns.startDate"),
    cell: ({ row }) => {
      const date = row.original.batch?.start_date;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    id: "expiry_date",
    header: t("allCoupons.columns.expiryDate"),
    cell: ({ row }) => {
      const date = row.original.batch?.end_date;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "issued_at",
    header: t("allCoupons.columns.issuedAt"),
    cell: ({ row }) => {
      const date = row.original.issued_at;
      return date ? new Date(date).toLocaleString() : "-";
    },
  },
  {
    accessorKey: "redeemed_at",
    header: t("allCoupons.columns.redeemedAt"),
    cell: ({ row }) => {
      const date = row.original.redeemed_at;
      return date ? new Date(date).toLocaleString() : t("allCoupons.notRedeemed");
    },
  },
];

export default function MerchantAllCoupons() {
  const t = useTranslations("merchantCoupons");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const locale = useLocale();
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const resp = await axiosInstance.get("/coupons", {
          params: {
            page: page + 1,
            pageSize,
            search: debouncedSearch || undefined,
          },
        });
        const data = resp?.data?.data || resp?.data || resp || {};

        // Handle both possible structures: { coupons: [], total: N } or just an array
        const list = Array.isArray(data) ? data : data.coupons || [];
        const totalCount = data.total || list.length;

        setCoupons(list);
        setTotal(totalCount);
      } catch (err) {
        toast.error(t("errors.failedToLoadCoupons"));
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [page, pageSize, debouncedSearch, t]);

  const filteredCoupons = coupons.filter((c) =>
    c.coupon_code.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("allCoupons.title")}</h1>
          <p className="text-muted-foreground">
            {t("allCoupons.subtitle")}
          </p>
        </div>
        <Link href={`/${locale}/merchant/coupons/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("allCoupons.createCoupon")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <TableToolbar
            placeholder={t("allCoupons.searchPlaceholder")}
            onSearchChange={setSearch}
          />
          <DataTable
            data={filteredCoupons}
            columns={AllCouponsColumns(t)}
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            setPageSize={setPageSize}
            isLoading={loading}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
