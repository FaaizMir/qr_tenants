"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { DataTable } from "@/components/common/data-table";
import { getApprovalColumns } from "./approval-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AgentApprovalsContainer() {
  const { data: session } = useSession();
  const adminId = session?.adminId;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({
    type: null,
    url: null,
  });

  const handlePreview = (type, url) => {
    setPreviewContent({ type, url });
    setIsPreviewOpen(true);
  };

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!adminId) return;

    const fetchApprovals = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/admins/${adminId}/approvals`,
        );
        const items = response.data || [];

        // Map API response to table shape
        const mappedData = items.map((item) => {
          const settings = item.merchant?.settings || {};
          const isVideo = settings.paid_ad_video_status;
          const relativePath = isVideo
            ? settings.paid_ad_video
            : settings.paid_ad_image;

          let fullImageUrl = null;

          if (relativePath) {
            if (
              relativePath.startsWith("http") ||
              relativePath.startsWith("data:")
            ) {
              fullImageUrl = relativePath;
            } else {
              let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
              // Remove trailing '/v1' if present
              baseUrl = baseUrl.replace(/\/v1\/?$/, "");
              // Ensure no double slashes
              const cleanBase = baseUrl.replace(/\/+$/, "");
              const cleanPath = relativePath.replace(/^\/+/, "");
              fullImageUrl = `${cleanBase}/${cleanPath}`;
            }
          }

          console.log("Ad Preview URL:", fullImageUrl);
          return {
            id: item.id,
            name: item.merchant?.business_name || "N/A",
            email: item.merchant?.user?.email || null,
            adImage: fullImageUrl, // keeping key name for compatibility or renaming to adUrl
            adType: isVideo ? "video" : "image",
            approvalType: item.approval_type,
            location:
              [item.merchant?.city, item.merchant?.country]
                .filter(Boolean)
                .join(", ") || "N/A",
            status: item.approval_status,
            createdAt: item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "N/A",
            onPreview: handlePreview,
            raw: item,
          };
        });

        setData(mappedData);
      } catch (error) {
        console.error("Error fetching approvals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [adminId]);

  const handleStatusUpdate = async (id, newStatus) => {
    const action = newStatus ? "approve" : "reject";
    try {
      await axiosInstance.patch(`/approvals/${adminId}/${action}`, {
        id: id,
        approval_status: newStatus,
      });

      // Update local state to reflect change immediately
      setData((prevData) =>
        prevData.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );

      return true;
    } catch (error) {
      console.error(`Error ${action}ing approval:`, error);
      throw error; // Re-throw so the UI can handle it
    }
  };

  const columns = useMemo(() => getApprovalColumns(handleStatusUpdate), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">Manage agent approvals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={data.length} // Client-side pagination for now since API might not return meta
            setPage={setPage}
            setPageSize={setPageSize}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Preview Dialog - SAME DESIGN as PaidAdsSettings */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[400px] w-[90vw] p-0 bg-white rounded-2xl overflow-hidden border-none shadow-2xl [&>button]:hidden">
          <DialogTitle className="sr-only">Ad Preview</DialogTitle>
          <DialogDescription className="sr-only">
            Full size preview of the promotional ad
          </DialogDescription>
          <div className="relative flex items-center justify-center p-4">
            {previewContent.type === "image" ? (
              <img
                src={previewContent.url}
                alt="Ad Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            ) : (
              <video
                src={previewContent.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-xl shadow-md bg-black"
              />
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 h-8 w-8 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 border-none transition-transform hover:scale-110 z-50"
              onClick={() => setIsPreviewOpen(false)}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
