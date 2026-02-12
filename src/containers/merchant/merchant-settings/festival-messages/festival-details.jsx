"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Edit,
  Trash2,
  Loader2,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/lib/toast";
import FestivalForm from "./festival-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

const formatDate = (dateString, t) => {
  if (!dateString) return t("details.na");
  try {
    return format(new Date(dateString), "MMMM dd, yyyy");
  } catch (error) {
    return t("details.invalidDate");
  }
};

export default function FestivalDetails() {
  const t = useTranslations("merchantFestival");
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const festivalId = params.id || params.festivalId;
  const merchantId = session?.user?.merchantId;

  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFestival = async () => {
    if (!festivalId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/festival-messages/${festivalId}`,
      );
      setFestival(response.data.data || response.data);
    } catch (err) {
      console.error("Failed to fetch festival message:", err);
      const errorMsg =
        err?.response?.data?.message ||
        t("errors.failedToLoadDetails");
      setError(errorMsg);
      toast.error(t("errors.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestival();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festivalId, merchantId]);

  const handleDelete = async () => {
    if (!festivalId) return;

    setDeleting(true);
    try {
      await axiosInstance.delete(`/festival-messages/${festivalId}`);
      toast.success(t("success.deleted"));
      router.push("/merchant/festival-messages");
    } catch (err) {
      console.error("Failed to delete festival message:", err);
      const errorMsg =
        err?.response?.data?.message || t("errors.failedToDelete");
      toast.error(errorMsg);
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    fetchFestival();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !festival) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("details.backToList")}
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || t("details.notFound")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("details.back")}
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{festival.festival_name}</h1>
            <Badge
              className={
                festival.is_active
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-500 hover:bg-gray-600 text-white"
              }
            >
              {festival.is_active ? t("active") : t("inactive")}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            {t("details.edit")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("details.delete")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t("details.messageDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("details.festivalMessage")}
              </p>
              <p className="text-sm whitespace-pre-wrap">{festival.message}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("details.recurringYearly")}
              </p>
              <Badge
                variant="secondary"
                className={
                  festival.is_recurring
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {festival.is_recurring ? t("columns.yes") : t("columns.no")}
              </Badge>
            </div>
            {festival.coupon_batch_id && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  <Ticket className="h-4 w-4 inline mr-1" />
                  {t("details.couponBatchId")}
                </p>
                <p className="text-sm font-mono">#{festival.coupon_batch_id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("details.scheduleInfo")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("details.festivalDate")}
              </p>
              <p className="text-sm">{formatDate(festival.festival_date, t)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("details.status")}
              </p>
              <Badge
                className={
                  festival.is_active
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }
              >
                {festival.is_active ? t("active") : t("inactive")}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {t("details.createdAt")}
              </p>
              <p className="text-sm">{formatDate(festival.created_at, t)}</p>
            </div>
            {festival.updated_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("details.lastUpdated")}
                </p>
                <p className="text-sm">{formatDate(festival.updated_at, t)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FestivalForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        festival={festival}
        merchantId={merchantId}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteDialog.confirmDescription", { festivalName: festival.festival_name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("deleteDialog.deleting")}
                </>
              ) : (
                t("deleteDialog.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
