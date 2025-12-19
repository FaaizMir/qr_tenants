"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";
import Link from "next/link";

import { batches } from "./coupons-listing-data";
import { batchesColumns } from "./coupons-listing-columns";

export default function MerchantCouponsListingContainer({ embedded = false }) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const filteredData = batches.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedData = filteredData.slice(
        page * pageSize,
        (page + 1) * pageSize
    );

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
                    <CardTitle>All Batches</CardTitle>
                </CardHeader>
                <CardContent>
                    <TableToolbar
                        placeholder="Search batches..."
                        onSearchChange={setSearch}
                    />
                    <DataTable
                        data={paginatedData}
                        columns={batchesColumns}
                        page={page}
                        pageSize={pageSize}
                        total={filteredData.length}
                        setPage={setPage}
                        setPageSize={setPageSize}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
