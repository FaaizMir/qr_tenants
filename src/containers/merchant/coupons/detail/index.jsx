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
    try {
      if (!batch) {
        toast.error("Batch info not loaded yet");
        return;
      }
      toast.info("Fetching all coupons for PDF export...");

      // Fetch ALL coupons for this batch
      const resp = await axiosInstance.get(`/coupons`, {
        params: { batchId: id, page: 1, pageSize: 10000 },
      });

      const allCoupons = resp?.data?.data?.coupons || resp?.data?.coupons || [];

      if (!allCoupons || allCoupons.length === 0) {
        toast.error("No data to export");
        return;
      }

      const doc = new jsPDF();

      // --- Title ---
      doc.setFontSize(18);
      doc.text("Batch Details Report", 14, 20);

      // --- Batch Info Section ---
      doc.setFontSize(11);
      doc.setTextColor(100);

      // Display batch info in a simple list or just text lines
      let yPos = 30;
      const lineHeight = 7;

      doc.text(`Batch Name: ${batch.batch_name || "-"}`, 14, yPos);
      yPos += lineHeight;
      doc.text(`Batch ID: ${batch.id || "-"}`, 14, yPos);
      yPos += lineHeight;
      doc.text(`Type: ${batch.batch_type || "-"}`, 14, yPos);
      yPos += lineHeight;
      doc.text(`Status: ${batch.is_active ? "Active" : "Inactive"}`, 14, yPos);
      yPos += lineHeight;
      doc.text(
        `Validity: ${batch.start_date || "-"} to ${batch.end_date || "-"}`,
        14,
        yPos
      );
      yPos += lineHeight;
      doc.text(
        `Utilization: ${batch.issued_quantity} / ${batch.total_quantity}`,
        14,
        yPos
      );

      yPos += 10; // Extra spacing before table

      // --- Coupons Table ---
      const tableColumn = [
        "Code",
        "Status",
        "Issued At",
        "Redeemed At",
        "Customer",
      ];
      const tableRows = [];

      allCoupons.forEach((c) => {
        const customerInfo = c.customer
          ? `${c.customer.name || ""}\n${c.customer.email || ""}`
          : "";

        const rowData = [
          c.coupon_code || "-",
          c.status || "-",
          c.issued_at ? new Date(c.issued_at).toLocaleString() : "-",
          c.redeemed_at ? new Date(c.redeemed_at).toLocaleString() : "-",
          customerInfo,
        ];
        tableRows.push(rowData);
      });

      autoTable(doc, {
        startY: yPos,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 163, 74] }, // Greenish header to match active badge or primary brand color
      });

      const sanitizedBatchName = (batch.batch_name || "batch")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      doc.save(`${sanitizedBatchName}_${id}_report.pdf`);
      toast.success("PDF Export complete");
    } catch (e) {
      console.error(e);
      toast.error("Failed to export PDF");
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
