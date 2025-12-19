"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState, useEffect } from "react";
import Link from "next/link";

import axiosInstance from "@/lib/axios";
import { couponsColumns } from "./coupons-listing-columns";
import { toast } from "sonner";

export default function MerchantCouponsListingContainer({ embedded = false }) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchCoupons = async () => {
            setLoading(true);
            try {
                const resp = await axiosInstance.get("/coupons", {
                    params: { page: page + 1, pageSize },
                });
                const data = resp?.data?.data || {};
                setCoupons(data.coupons || []);
                setTotal(data.total || (data.coupons || []).length);
            } catch (err) {
                const msg = err?.response?.data?.message || err.message || "Failed to load coupons";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [page, pageSize]);

    const filteredData = coupons.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (item.coupon_code || "").toLowerCase().includes(q) ||
            (item.qr_hash || "").toLowerCase().includes(q) ||
            (item.batch?.batch_name || "").toLowerCase().includes(q) ||
            (item.merchant?.business_name || "").toLowerCase().includes(q)
        );
    });

    const paginatedData = filteredData;

    return (
        <div className="space-y-6">
            {!embedded && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Coupon Batches</h1>
                        <p className="text-muted-foreground">Manage your discount coupons</p>
                    </div>
                    <Link href="/en/merchant/coupons/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Batch
                        </Button>
                    </Link>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    <TableToolbar
                        placeholder="Search batches..."
                        onSearchChange={setSearch}
                    />
                    <DataTable
                        data={paginatedData}
                        columns={couponsColumns}
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        loading={loading}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
