"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Users,
  Ticket,
  MessageSquare,
  Edit,
  Trash2,
  Send,
  Loader2,
} from "lucide-react";
import axios from "@/lib/axios";
import { toast } from "@/lib/toast";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CampaignFormDialog from "./campaign-form";

export default function CampaignDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
  const campaignId = params?.id;

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch campaign details
  const fetchCampaign = async () => {
    if (!campaignId) return;

    setLoading(true);
    try {
      const res = await axios.get(`/scheduled-campaigns/${campaignId}`);
      setCampaign(res?.data?.data || res?.data);
    } catch (error) {
      console.error("Failed to fetch campaign details:", error);
      toast.error("Failed to load campaign details");
      router.push("/merchant/campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  // Handle delete
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/scheduled-campaigns/${campaignId}`);
      toast.success("Campaign deleted successfully");
      router.push("/merchant/campaigns");
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      toast.error("Failed to delete campaign");
      setDeleting(false);
      router.back();
    }
  };

  // Handle success after edit
  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    fetchCampaign();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: {
        variant: "default",
        label: "Scheduled",
        class: "bg-blue-100 text-blue-800",
      },
      sent: {
        variant: "secondary",
        label: "Sent",
        class: "bg-green-100 text-green-800",
      },
      failed: {
        variant: "destructive",
        label: "Failed",
        class: "bg-red-100 text-red-800",
      },
      cancelled: {
        variant: "outline",
        label: "Cancelled",
        class: "bg-gray-100 text-gray-800",
      },
    };
    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <Badge
        variant={config.variant}
        className={`${config.class} text-sm px-3 py-1`}
      >
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campaign not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{campaign.campaign_name}</h1>
              <p className="text-muted-foreground">Campaign Details</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;
                    {campaign.campaign_name}&quot;? This action cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleting && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {campaign.total_customers || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Messages Sent
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {campaign.messages_sent || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <Send className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Messages Failed
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {campaign.messages_failed || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <MessageSquare className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Campaign Information</CardTitle>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Campaign Message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-medium">Message</span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {campaign.campaign_message}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Schedule Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      <span className="font-medium">Scheduled For</span>
                    </div>
                    <p className="text-sm font-medium">
                      {formatDate(campaign.scheduled_date)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Target Audience</span>
                    </div>
                    <p className="text-sm font-medium capitalize">
                      {campaign.target_audience?.replace(/_/g, " ") ||
                        "All Users"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupon Batch Info - Only if send_coupons is true */}
            {campaign.send_coupons && campaign.coupon_batch && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-orange-600" />
                    Attached Coupon Batch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Batch Name
                      </p>
                      <p className="text-sm font-semibold">
                        {campaign.coupon_batch.batch_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Batch Type
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {campaign.coupon_batch.batch_type}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Total Coupons
                      </p>
                      <p className="text-sm font-medium">
                        {campaign.coupon_batch.total_quantity}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Issued</p>
                      <p className="text-sm font-medium">
                        {campaign.coupon_batch.issued_quantity}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Valid From
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(
                          campaign.coupon_batch.start_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Valid Until
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(
                          campaign.coupon_batch.end_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campaign Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Campaign ID</span>
                  <span className="font-mono">#{campaign.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>
                    {new Date(campaign.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>
                    {new Date(campaign.updated_at).toLocaleDateString()}
                  </span>
                </div>
                {campaign.started_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started At</span>
                      <span>
                        {new Date(campaign.started_at).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
                {campaign.completed_at && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Completed At
                      </span>
                      <span>
                        {new Date(campaign.completed_at).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <CampaignFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        campaign={campaign}
        merchantId={merchantId}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
