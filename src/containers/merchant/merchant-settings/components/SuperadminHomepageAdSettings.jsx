"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SuperadminHomepageAdSettings({ merchantId }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [state, setState] = useState({
    enabled: false,
    placement: "top",
    startDate: getTodayDateString(),
    image: "",
    video: "",
    isVideo: false,
  });

  useEffect(() => {
    if (!merchantId) return;

    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/merchant-settings/merchant/${merchantId}`);
        const data = res?.data?.data;
        if (!data) return;

        setState({
          enabled: data.superadmin_homepage_ad_enabled ?? false,
          placement: data.superadmin_homepage_ad_placement || "top",
          startDate: data.superadmin_homepage_ad_start_date
            ? new Date(data.superadmin_homepage_ad_start_date).toISOString().split("T")[0]
            : getTodayDateString(),
          image: data.superadmin_homepage_ad_image || "",
          video: data.superadmin_homepage_ad_video || "",
          isVideo: data.superadmin_homepage_ad_video_status ?? false,
        });
      } catch (error) {
        console.error("Failed to load superadmin homepage ad settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [merchantId]);

  const handleSave = async () => {
    if (!merchantId) return;

    setSaving(true);
    try {
      await axiosInstance.patch(`/merchant-settings/merchant/${merchantId}`, {
        superadmin_homepage_ad_enabled: state.enabled,
        superadmin_homepage_ad_placement: state.placement,
        superadmin_homepage_ad_start_date: state.startDate,
      });

      toast.success("Superadmin homepage ad settings updated.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !merchantId) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("superadminHomepageAdImage", file);
      formData.append("superadminHomepageAdPlacement", state.placement);
      formData.append("superadminHomepageAdStartDate", state.startDate);

      const res = await axiosInstance.post(
        `/merchant-settings/merchant/${merchantId}/superadmin-homepage-ad-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const data = res?.data?.data;
      setState((prev) => ({
        ...prev,
        image: data?.superadmin_homepage_ad_image || prev.image,
        isVideo: false,
      }));
      toast.success("Superadmin homepage ad image uploaded.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
      event.target.value = null;
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !merchantId) return;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("superadminHomepageAdVideo", file);
      formData.append("superadminHomepageAdPlacement", state.placement);
      formData.append("superadminHomepageAdStartDate", state.startDate);

      const res = await axiosInstance.post(
        `/merchant-settings/merchant/${merchantId}/superadmin-homepage-ad-video`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      const data = res?.data?.data;
      setState((prev) => ({
        ...prev,
        video: data?.superadmin_homepage_ad_video || prev.video,
        isVideo: true,
      }));
      toast.success("Superadmin homepage ad video uploaded.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Video upload failed.");
    } finally {
      setUploadingVideo(false);
      event.target.value = null;
    }
  };

  return (
    <Card className="border-gray-100 shadow-lg rounded-3xl">
      <CardHeader>
        <CardTitle>Superadmin Homepage Ad Settings</CardTitle>
        <CardDescription>
          Configure media, toggle and start date for superadmin homepage ad requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading settings...
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Label>Enable Superadmin Homepage Ad</Label>
              <Switch
                checked={state.enabled}
                onCheckedChange={(checked) => setState((prev) => ({ ...prev, enabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Ad Placement</Label>
              <Select
                value={state.placement}
                onValueChange={(value) => setState((prev) => ({ ...prev, placement: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top Banner</SelectItem>
                  <SelectItem value="left">Left Sidebar</SelectItem>
                  <SelectItem value="right">Right Sidebar</SelectItem>
                  <SelectItem value="bottom">Bottom Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                min={getTodayDateString()}
                value={state.startDate}
                onChange={(e) => setState((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Upload Ad Image</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {uploadingImage && <p className="text-xs text-muted-foreground">Uploading image...</p>}
              </div>

              <div className="space-y-2">
                <Label>Upload Ad Video</Label>
                <Input type="file" accept="video/*" onChange={handleVideoUpload} />
                {uploadingVideo && <p className="text-xs text-muted-foreground">Uploading video...</p>}
              </div>
            </div>

            {(state.image || state.video) && (
              <p className="text-xs text-muted-foreground">
                Active media: {state.isVideo ? "Video" : "Image"}
              </p>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Save Superadmin Homepage Ad Settings
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
