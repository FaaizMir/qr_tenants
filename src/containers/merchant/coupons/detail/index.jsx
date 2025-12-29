"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download, Copy, Tag, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import Link from "next/link";
import { DataTable } from "@/components/common/data-table";
import TableToolbar from "@/components/common/table-toolbar";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DownloadCloud } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { serialCodesColumns } from "./coupons-detail-columns";

export default function MerchantCouponDetailContainer() {
  const id = useParams()?.id;
  const router = useRouter();

  const [batch, setBatch] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const copyToClipboard = async (text, label = "Text") => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.success(`${label} copied to clipboard`);
    } catch (e) {
      toast.error(`Failed to copy ${label}`);
    }
  };

  const handleExportPdf = async () => {
    if (!id) {
      toast.error("Batch ID not available");
      return;
    }

    setLoading(true);
    try {
      toast.info("Fetching PDF...");

      const resp = await axiosInstance.get(`/coupon-batches/export/pdf/${id}`);

      const base64 = resp?.data?.data?.base64;
      console.log("Base64: ", base64);
      if (!base64) {
        toast.error("No PDF data received");
        setLoading(false);
        return;
      }

      // Convert base64 to blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      console.log("byteCharacters: ", byteCharacters);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      console.log("blob: ", blob);
      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `coupon_batch_${id}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchBatchCoupons = async () => {
      setLoading(true);
      try {
        // Request coupons filtered by batchId
        const resp = await axiosInstance.get(`/coupons`, {
          params: { batchId: id, page: page + 1, pageSize },
        });

        const data = resp?.data?.data || resp?.data || {};
        const couponList = data.coupons || [];

        setCoupons(couponList);
        setTotal(data.total || couponList.length);

        // If we have coupons, we can extract batch info from the first record
        // Alternatively, we could fetch batch info from a dedicated batch endpoint if it existed
        if (couponList.length > 0) {
          setBatch(couponList[0].batch);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          "Failed to load coupons";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchBatchCoupons();
  }, [id, page, pageSize]);

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      !search ||
      (c.coupon_code || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.customer?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (c.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/en/merchant/coupons">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch Details</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Tag className="h-4 w-4" />
              {batch ? batch.batch_name : "Loading batch info..."}
            </p>
          </div>
        </div>
        {batch && (
          <div className="flex items-center gap-3">
            <Badge variant={batch.is_active ? "default" : "secondary"}>
              {batch.is_active ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {batch.batch_type}
            </Badge>
          </div>
        )}
      </div>

      {/* Batch Stats Cards */}
      {batch && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quantity
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.total_quantity}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Issued Quantity
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.issued_quantity}</div>
              <p className="text-xs text-muted-foreground">
                {batch.total_quantity > 0
                  ? Math.round(
                      (batch.issued_quantity / batch.total_quantity) * 100
                    )
                  : 0}
                % Utilized
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start:</span>
                  <span>{new Date(batch.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">End:</span>
                  <span>{new Date(batch.end_date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons in Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <TableToolbar
            placeholder="Search code..."
            onSearchChange={setSearch}
            rightSlot={
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="redeemed">Redeemed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleExportPdf}>
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            }
          />
          <DataTable
            data={filteredCoupons}
            columns={serialCodesColumns}
            page={page}
            pageSize={pageSize}
            total={total}
            setPage={setPage}
            setPageSize={setPageSize}
            loading={loading}
            pagination={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
