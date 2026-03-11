"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
import { getImageUrl } from "@/lib/utils/imageUtils";
import { toast } from "@/lib/toast";
import Image from "next/image";

export default function AgentApprovalsContainer() {
  const t = useTranslations("agentApprovals");
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
    console.log("Opening preview - Type:", type, "URL:", url);
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
          const isVideo = item.ad_type === "video";
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
              fullImageUrl = getImageUrl(relativePath);
            }
          }

          return {
            id: item.id,
            name: item.merchant?.business_name || t("common.notAvailable"),
            email: item.merchant?.user?.email || null,
            adImage: fullImageUrl,
            adType: isVideo ? "video" : "image",
            approvalType: item.approval_type,
            location:
              [item.merchant?.city, item.merchant?.country]
                .filter(Boolean)
                .join(", ") || t("common.notAvailable"),
            status: item.approval_status,
            createdAt: item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : t("common.notAvailable"),
            adStartDate: item.ad_created_at
              ? new Date(item.ad_created_at).toLocaleDateString()
              : "—",
            adEndDate: item.ad_expired_at
              ? new Date(item.ad_expired_at).toLocaleDateString()
              : "—",
            onPreview: handlePreview,
            merchant_type: item.merchant?.merchant_type ?? "—",
            paid_ad_placement:
              item.merchant?.settings?.paid_ad_placement ?? "—",
            raw: item,
          };
        });
        setData(mappedData);
      } catch (error) {
        console.error("Error fetching approvals:", error);
        toast.error(t("messages.fetchError"));
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, [adminId, t]);

  const handleStatusUpdate = useCallback(
    async (id, newStatus, disapprovalReason = null) => {
      const action = newStatus ? "approve" : "reject";
      console.log(`Attempting to ${action} approval with ID: ${id}, New Status: ${action}, Reason: ${disapprovalReason}`);
      try {
        const requestBody = {
          id: id,
          approval_status: newStatus,
        };
        
        // Add disapproval_reason only when rejecting
        if (!newStatus && disapprovalReason) {
          requestBody.disapproval_reason = disapprovalReason;
        }
        
        await axiosInstance.patch(`/approvals/${adminId}/${action}`, requestBody);

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
    },
    [adminId]
  );

  const columns = useMemo(
    () => getApprovalColumns(handleStatusUpdate, t),
    [handleStatusUpdate, t],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader></CardHeader>
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
          <DialogTitle className="sr-only">{t("preview.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("preview.description")}
          </DialogDescription>
          <div className="relative flex items-center justify-center p-4">
            {previewContent.type === "image" ? (
              <Image
                src={previewContent.url}
                alt={t("common.adPreviewAlt")}
                width={800}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            ) : (
              <video
                key={previewContent.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-xl shadow-md bg-black"
                style={{ minHeight: "300px" }}
                onError={(e) => {
                  console.error("Video load error:", e);
                  console.error("Video URL that failed:", previewContent.url);
                }}
                onLoadStart={() => console.log("Video loading started...")}
                onCanPlay={() => console.log("Video can play now")}
              >
                <source src={previewContent.url} type="video/mp4" />
                <source src={previewContent.url} type="video/webm" />
                {t("preview.videoNotSupported")}
              </video>
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
