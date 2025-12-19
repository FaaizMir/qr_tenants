"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

import { serialCodesColumns } from "./coupons-detail-columns";

export default function MerchantCouponDetailContainer({ params }) {
    const id = useParams()?.id;
    const router = useRouter();

    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const paginatedData = [];

    useEffect(() => {
        if (!id) return;
        const fetchCoupon = async () => {
            setLoading(true);
            try {
                // debug: log id and resolved URL to help trace why backend isn't receiving the request
                try {
                    // eslint-disable-next-line no-console
                    console.debug("Fetching coupon", { id, baseURL: axiosInstance.defaults.baseURL, path: `/coupons/${id}` });
                } catch (e) {}
                try {
                    if (typeof window !== "undefined") {
                        // show a visible toast so it's easier to see in the UI when the request is attempted
                        toast.success(`Requesting coupon id: ${id} -> ${axiosInstance.defaults.baseURL || ""}/coupons/${id}`);
                    }
                } catch (e) {}
                const resp = await axiosInstance.get(`/coupons/${id}`);
                const data = resp?.data?.data || resp?.data;
                setCoupon(data);
            } catch (err) {
                const msg = err?.response?.data?.message || err.message || "Failed to load coupon";
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupon();
    }, [id]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/en/merchant/coupons">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">{coupon ? coupon.coupon_code : "Coupon Detail"}</h1>
                    <p className="text-muted-foreground">{coupon?.batch?.batch_name || "Coupon & Batch details"}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Batch Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {coupon ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        <StatusBadge status={coupon.status} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Coupon Code</p>
                                    <p className="font-medium text-lg">{coupon.coupon_code}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Issued At</p>
                                    <p className="font-medium">{coupon.issued_at ? new Date(coupon.issued_at).toLocaleString() : "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Batch Type</p>
                                    <p className="font-medium">{coupon.batch?.batch_type || "-"}</p>
                                </div>

                                <div className="col-span-2 mt-4">
                                    <p className="text-sm text-muted-foreground">Merchant</p>
                                    <p className="font-medium">{coupon.merchant?.business_name || "-"}</p>
                                    <p className="text-sm text-muted-foreground">{coupon.merchant?.address}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Loading...</p>
                        )}
                    </CardContent>
                </Card>

                {/* QR Code */}
                <Card>
                    <CardHeader>
                        <CardTitle>Master QR Code</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                            {coupon?.merchant?.qr_code_image ? (
                                // merchant-provided base64 image
                                <img src={coupon.merchant.qr_code_image} alt="QR" width={150} height={150} />
                            ) : (
                                <QRCodeSVG value={coupon?.merchant?.qr_code_url || ""} size={150} />
                            )}
                        </div>
                        <p className="text-sm text-center text-muted-foreground mb-4">
                            Scan to claim this coupon / view feedback
                        </p>
                        <Button variant="outline" className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Download QR
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Serial Codes */}
            {/* If you want serial codes per batch, backend endpoint can be used to fetch them and render here. */}
        </div>
    );
}
