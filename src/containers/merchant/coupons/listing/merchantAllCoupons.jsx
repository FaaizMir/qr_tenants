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
import { useLocale } from "next-intl";
import useDebounce from "@/hooks/useDebounceRef";

const columns = [
  {
    accessorKey: "coupon_code",
    header: "Coupon Code",
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
            toast.success("Copied to clipboard");
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    id: "batch_name",
    header: "Batch Name",
    cell: ({ row }) => row.original.batch?.batch_name || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "start_date",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.original.batch?.start_date;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    id: "expiry_date",
    header: "Expiry Date",
    cell: ({ row }) => {
      const date = row.original.batch?.end_date;
      return date ? new Date(date).toLocaleDateString() : "-";
    },
  },
  {
    accessorKey: "issued_at",
    header: "Issued At",
    cell: ({ row }) => {
      const date = row.original.issued_at;
      return date ? new Date(date).toLocaleString() : "-";
    },
  },
  {
    accessorKey: "redeemed_at",
    header: "Redeemed At",
    cell: ({ row }) => {
      const date = row.original.redeemed_at;
      return date ? new Date(date).toLocaleString() : "Not redeemed";
    },
  },
];

export default function MerchantAllCoupons() {
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
        toast.error("Failed to load coupons");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [page, pageSize, debouncedSearch]);

  const filteredCoupons = coupons.filter((c) =>
    c.coupon_code.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Coupons</h1>
          <p className="text-muted-foreground">
            View and manage all generated coupons
          </p>
        </div>
        <Link href={`/${locale}/merchant/coupons/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Coupon
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <TableToolbar
            placeholder="Search coupons..."
            onSearchChange={setSearch}
          />
          <DataTable
            data={filteredCoupons}
            columns={columns}
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
