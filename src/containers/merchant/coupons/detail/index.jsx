"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Copy, Tag, Calendar, Users, MapPin, DownloadCloud } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

    const copyToClipboard = async (text, label = "Text") => {
        try {
            await navigator.clipboard.writeText(text || "");
            toast.success(`${label} copied to clipboard`);
        } catch (e) {
            toast.error(`Failed to copy ${label}`);
        }
    };

    const downloadDataUrl = (dataUrl, filename = "qr.png") => {
        try {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            toast.error("Failed to download image");
        }
    };

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
        <div className="space-y-8">
  {/* Header */}
  <div className="flex items-center justify-between rounded-2xl  p-6 border shadow-sm">
    <div className="flex items-center gap-4">
      <Link href="/en/merchant/coupons">
        <Button variant="ghost" size="icon" className="hover:bg-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {coupon ? coupon.coupon_code : "Coupon Detail"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
          <Tag className="h-4 w-4" />
          {coupon?.batch?.batch_name || "Coupon & Batch details"}
        </p>
      </div>
    </div>

    {coupon?.pdf_url && (
      <a href={coupon.pdf_url} target="_blank" rel="noreferrer">
        <Button className="rounded-xl shadow-md">
          <DownloadCloud className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </a>
    )}
  </div>

  {/* Content */}
  <div className="grid gap-6 md:grid-cols-3">
    {/* Main Card */}
    <Card className="md:col-span-2 rounded-2xl border bg-white/80 backdrop-blur shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Batch Information</CardTitle>
        <Badge variant="outline" className="rounded-lg">
          ID: {coupon?.id ?? "-"}
        </Badge>
      </CardHeader>

      <CardContent>
        {coupon ? (
          <div className="space-y-6">
            {/* Status Row */}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <div className="mt-2">
                  <StatusBadge status={coupon.status} />
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Batch Type
                </p>
                <p className="font-semibold">
                  {coupon.batch?.batch_type || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Issued At
                </p>
                <p className="font-semibold">
                  {coupon.issued_at
                    ? new Date(coupon.issued_at).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 p-4 border">
              <p className="text-sm text-muted-foreground">Coupon Code</p>
              <div className="flex items-center gap-3 mt-2">
                <h2 className="font-mono text-3xl font-bold tracking-widest text-indigo-600">
                  {coupon.coupon_code}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-white"
                  onClick={() =>
                    copyToClipboard(coupon.coupon_code, "Coupon code")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Batch & Merchant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              {/* Batch */}
              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <p className="text-sm text-muted-foreground">Batch</p>
                <p className="font-semibold text-lg">
                  {coupon.batch?.batch_name || "-"}
                </p>

                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start:
                    <span className="font-medium ml-auto">
                      {coupon.batch?.start_date || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End:
                    <span className="font-medium ml-auto">
                      {coupon.batch?.end_date || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Quantity:
                    <span className="font-medium ml-auto">
                      {coupon.batch?.total_quantity ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Merchant */}
              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <p className="text-sm text-muted-foreground">Merchant</p>
                <p className="font-semibold text-lg">
                  {coupon.merchant?.business_name || "-"}
                </p>

                <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  QR Hash:
                  <span className="font-medium ml-auto">
                    {coupon.merchant?.qr_code_hash || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  </div>
</div>

    );
}
