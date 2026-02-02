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

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMMM dd, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

export default function FestivalDetails() {
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
        {
          params: { merchant_id: merchantId },
        },
      );
      setFestival(response.data.data || response.data);
    } catch (err) {
      console.error("Failed to fetch festival message:", err);
      setError("Failed to load festival message details");
      toast.error("Failed to load festival message");
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
      await axiosInstance.delete(`/festival-messages/${festivalId}`, {
        params: { merchant_id: merchantId },
      });
      toast.success("Festival message deleted successfully");
      router.push("/merchant/festival-messages");
    } catch (err) {
      console.error("Failed to delete festival message:", err);
      toast.error("Failed to delete festival message");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      router.back();
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
          Back to Festival Messages
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Festival message not found"}
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
            Back
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
              {festival.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Festival Message
              </p>
              <p className="text-sm whitespace-pre-wrap">{festival.message}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Recurring Yearly
              </p>
              <Badge
                variant="secondary"
                className={
                  festival.is_recurring
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {festival.is_recurring ? "Yes" : "No"}
              </Badge>
            </div>
            {festival.coupon_batch_id && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  <Ticket className="h-4 w-4 inline mr-1" />
                  Coupon Batch ID
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
              Schedule & Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Festival Date
              </p>
              <p className="text-sm">{formatDate(festival.festival_date)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Status
              </p>
              <Badge
                className={
                  festival.is_active
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }
              >
                {festival.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Created At
              </p>
              <p className="text-sm">{formatDate(festival.created_at)}</p>
            </div>
            {festival.updated_at && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last Updated
                </p>
                <p className="text-sm">{formatDate(festival.updated_at)}</p>
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              festival message &quot;{festival.festival_name}&quot; and remove
              it from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
