"use client";

import { use } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useState } from "react";

import { getBatchDetails, serialCodes } from "./coupons-detail-data";
import { serialCodesColumns } from "./coupons-detail-columns";

export default function MerchantCouponDetailContainer({ params }) {
    const { id } = use(params);

    // Dummy batch data
    const batch = getBatchDetails(id);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const filteredCodes = serialCodes.filter(
        (item) =>
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            (item.customer &&
                item.customer.toLowerCase().includes(search.toLowerCase()))
    );

    const paginatedData = filteredCodes.slice(
        page * pageSize,
        (page + 1) * pageSize
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/en/merchant/coupons">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{batch.name}</h1>
                    <p className="text-muted-foreground">Batch Details & Serial Codes</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Batch Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="mt-1">
                                    <StatusBadge status={batch.status} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Discount</p>
                                <p className="font-medium text-lg">{batch.discount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created Date</p>
                                <p className="font-medium">{batch.created}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Valid Untill</p>
                                <p className="font-medium">{batch.validUntil}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Usage Progress</span>
                                <span className="text-sm text-muted-foreground">
                                    {batch.used} / {batch.quantity} codes used
                                </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary"
                                    style={{ width: `${(batch.used / batch.quantity) * 100}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code */}
                <Card>
                    <CardHeader>
                        <CardTitle>Master QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                            <QRCodeSVG
                                value={`https://qrscanner.com/claim/${batch.id}`}
                                size={150}
                            />
                        </div>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                            Scan to claim a random coupon from this batch
                        </p>
                        <Button variant="outline" className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download QR
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Serial Codes */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Serial Codes</CardTitle>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </CardHeader>
                <CardContent>
                    <TableToolbar
                        placeholder="Search codes..."
                        onSearchChange={setSearch}
                    />
                    <DataTable
                        data={paginatedData}
                        columns={serialCodesColumns}
                        page={page}
                        pageSize={pageSize}
                        total={filteredCodes.length}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        style={{ marginTop: "1rem" }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
