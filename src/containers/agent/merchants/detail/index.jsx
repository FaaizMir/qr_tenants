"use client";

import { ArrowLeft, Mail, Phone, Calendar, CreditCard, MapPin, Hash, Briefcase, Tag, Link2, RefreshCw, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import QRImageDialogHover from "@/components/common/qr-image-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { BreadcrumbComponent } from "@/components/common/breadcrumb-component";

import { transactions, activityLog } from "./merchants-detail-data";
import { transactionColumns } from "./merchants-detail-columns";
import { useParams } from "next/navigation";

export default function AgentMerchantDetailContainer({ params }) {
    const { id } = useParams();

    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        try {
            const base = axiosInstance?.defaults?.baseURL || "";
            const url = `${base.replace(/\/$/, "")}/merchants/${id}`.replace(/:\/\//, "__TEMP__").replace(/__TEMP__/,'://');
            console.debug("Fetching merchant details", { id, baseURL: axiosInstance?.defaults?.baseURL, url });

            axiosInstance
                .get(`/merchants/${id}`)
                .then((res) => {
                    const payload = res?.data?.data || res?.data || null;
                    console.debug("Merchant fetch response", { payload, status: res?.status });
                    setMerchant(payload);
                })
                .catch((err) => {
                    console.error("Failed to fetch merchant:", err?.message || err, err?.response?.status, err?.response?.data);
                    setError(err);
                })
                .finally(() => setLoading(false));
        } catch (err) {
            console.error("Unexpected error while fetching merchant:", err);
            setError(err);
            setLoading(false);
        }
    }, [id]);

    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");

    const filteredTransactions = transactions.filter(item =>
        item.description.toLowerCase().includes(search.toLowerCase())
    );

    const paginatedData = filteredTransactions.slice(page * pageSize, (page + 1) * pageSize);

    const breadcrumbData = [
        { name: "Agent Dashboard", url: "/en/agent/dashboard" },
        { name: "Merchants Management", url: "/en/agent/merchants" },
        { name: merchant?.business_name || merchant?.user?.name || "Merchant", url: `/en/agent/merchants/${id}` },
    ];
    return (
        <div className="space-y-6">
            <BreadcrumbComponent data={breadcrumbData} />

            <div className="flex items-center gap-4">
                <Link href="/en/agent/merchants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>

                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{merchant?.business_name || merchant?.user?.name || "Merchant"}</h1>
                    <p className="text-muted-foreground">Merchant Details</p>
                </div>

                <div className="ml-4">
                    <Link href={`/en/agent/merchants/${id}/edit`}>
                        <Button className="">Edit Merchant</Button>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div>Loading merchant...</div>
            ) : error ? (
                <div className="text-destructive">Failed to load merchant details.</div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Profile Information */}
                        <Card className="h-full min-h-[420px]">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 h-full flex flex-col">
                                <div className="flex items-start gap-4">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {merchant?.user?.avatar ? (
                                            <img src={merchant.user.avatar} alt={merchant.user.name} className="h-16 w-16 object-cover" />
                                        ) : (
                                            <span className="text-sm">{(merchant?.user?.name || "").split(" ").map(n => n[0]).slice(0,2).join("")}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">Owner</p>
                                        <p className="font-medium text-lg">{merchant?.user?.name || "-"}</p>
                                        <p className="text-sm text-muted-foreground">{merchant?.user?.email || "-"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4 items-start">
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Business Name</p>
                                                <p className="font-medium">{merchant?.business_name || "-"}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Business Type</p>
                                                    <p className="font-medium">{merchant?.business_type || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{merchant?.user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">QR Hash</p>
                                                <p className="font-medium break-all">{merchant?.qr_code_hash || "-"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{merchant?.user?.phone || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created At</p>
                                            <p className="font-medium">{new Date(merchant?.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="font-medium">{merchant?.address || "-"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Subscription Details */}
                        <Card className="h-full min-h-[420px]">
                            <CardHeader>
                                <CardTitle>Subscription Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 h-full flex flex-col justify-between">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Merchant Type</p>
                                        <div className="mt-1">
                                            <StatusBadge status={merchant?.merchant_type} />
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-muted-foreground">Tax ID</p>
                                        <div className="mt-1">
                                            <p className="font-medium">{merchant?.tax_id || "-"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link2 className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">QR Code URL</p>
                                            <a className="text-primary break-all" href={merchant?.qr_code_url} target="_blank" rel="noreferrer">{merchant?.qr_code_url}</a>
                                        </div>
                                    </div>
                                </div>

                                {merchant?.qr_code_image && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">QR Preview</p>
                                        <div className="mt-2">
                                            <QRImageDialogHover imageBase64={merchant.qr_code_image} filename={`qr-${merchant.id}.png`} label={`QR for ${merchant.business_name || merchant.user?.name}`} sizeClass={`w-40 h-40`} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="font-medium">{merchant?.created_at ? new Date(merchant.created_at).toLocaleString() : "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <RefreshCw className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Updated At</p>
                                        <p className="font-medium">{merchant?.updated_at ? new Date(merchant.updated_at).toLocaleString() : "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Trash2 className="h-5 w-5 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Deleted At</p>
                                        <p className="font-medium">{merchant?.deleted_at ? new Date(merchant.deleted_at).toLocaleString() : "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transaction History (unchanged, still using dummy data) */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TableToolbar
                                placeholder="Search transactions..."
                                onSearchChange={setSearch}
                            />
                            <DataTable
                                data={paginatedData}
                                columns={transactionColumns}
                                page={page}
                                pageSize={pageSize}
                                total={filteredTransactions.length}
                                setPage={setPage}
                                setPageSize={setPageSize}
                            />
                        </CardContent>
                    </Card> */}

                    {/* Activity Log (unchanged) */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle>Activity Log</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activityLog.map((log) => (
                                    <div key={log.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                                        <div>
                                            <p className="font-medium">{log.action}</p>
                                            <p className="text-sm text-muted-foreground">{log.details}</p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{log.date}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card> */}
                </>
            )}
        </div>
    );
}
