import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Megaphone,
  Trash2,
  Plus,
  Minus,
  Check,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { getCroppedImg, getImageUrl } from "@/lib/utils/imageUtils";

export default function PaidAdsSettings({ config: initialConfig, merchantId }) {
  const [state, setState] = useState({
    paid_ads: initialConfig?.paid_ads ?? false,
    placement: initialConfig?.placement ?? "top",
    paid_ad_image: initialConfig?.paid_ad_image ?? "",
    paid_ad_video: initialConfig?.paid_ad_video ?? "",
    paid_ad_video_status: initialConfig?.paid_ad_video_status ?? false,
    paid_ad_duration: initialConfig?.paid_ad_duration ?? 7,
  });

  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    state.paid_ad_video_status ? "video" : "image",
  );
  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);

  // Fetch true state from API on mount
  useEffect(() => {
    if (!merchantId) return;
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get(
          `/merchant-settings/merchant/${merchantId}`,
        );
        const data = res?.data?.data;
        if (data) {
          setState((prev) => ({
            ...prev,
            paid_ads: data.paid_ads ?? false,
            placement: data.paid_ad_placement ?? "top",
            paid_ad_image: data.paid_ad_image ?? "",
            paid_ad_video: data.paid_ad_video ?? "",
            paid_ad_video_status: data.paid_ad_video_status ?? false,
            paid_ad_duration: data.paid_ad_duration ?? 7,
          }));
        }
      } catch (error) {
        console.error("Failed to sync paid ads settings:", error);
      }
    };
    fetchSettings();
  }, [merchantId]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [currentFilename, setCurrentFilename] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewContent, setPreviewContent] = useState({
    type: null,
    url: null,
  });

  useEffect(() => {
    const onSettingsUpdate = (e) => {
      if (e.detail?.paid_ads !== undefined) {
        setState((p) => ({ ...p, paid_ads: e.detail.paid_ads }));
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
    return () =>
      window.removeEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
  }, []);

  const handleSubmit = async () => {
    if (!merchantId) return;

    setUploading(true);
    try {
      // 1. Update general settings (toggle, placement, duration)
      await axiosInstance.patch(`/merchant-settings/merchant/${merchantId}`, {
        paid_ads: state.paid_ads,
        paid_ad_placement: state.placement || "top",
        paid_ad_duration: parseInt(state.paid_ad_duration || "7", 10),
      });

      // 2. Handle upload if pending
      if (pendingFile) {
        const formData = new FormData();
        if (pendingFile.type === "image") {
          formData.append(
            "paidAdImage",
            pendingFile.file,
            pendingFile.filename || "image.jpg",
          );
          formData.append("paidAdPlacement", state.placement || "top");

          const response = await axiosInstance.post(
            `/merchant-settings/merchant/${merchantId}/paid-ad-image`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );

          if (response.data?.data?.paid_ad_image) {
            const newImageUrl = response.data.data.paid_ad_image;
            setState((prev) => ({
              ...prev,
              paid_ad_image: newImageUrl,
              paid_ad_video_status: false,
            }));
          }
        } else if (pendingFile.type === "video") {
          formData.append("paidAdVideo", pendingFile.file);

          const response = await axiosInstance.post(
            `/merchant-settings/merchant/${merchantId}/paid-ad-video`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );

          if (response.data?.data?.url) {
            const newVideoUrl = response.data.data.url;
            setState((prev) => ({
              ...prev,
              paid_ad_video: newVideoUrl,
              paid_ad_video_status: true,
            }));
          }
        }
        setPendingFile(null);
      }

      toast.success("Settings and ad updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Error saving settings");
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = (type, url) => {
    setPreviewContent({ type, url: getImageUrl(url) });
    setIsPreviewOpen(true);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleTogglePaidAds = (checked) => {
    setState((p) => ({
      ...p,
      paid_ads: checked,
    }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCurrentFilename(file.name);
      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setIsCropperOpen(true);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !merchantId) return;

    // Size limit check (e.g., 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file is too large. Max size is 50MB.");
      return;
    }

    // setUploading(true); // Defer upload

    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);

    setPendingFile({
      file: file,
      type: "video",
      previewUrl: objectUrl,
      filename: file.name,
    });
    setActiveTab("video");
    toast.info("Video selected. Click 'Upload & Save' to finish.");
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleCropAndSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const objectUrl = URL.createObjectURL(croppedBlob);

      setPendingFile({
        file: croppedBlob,
        type: "image",
        previewUrl: objectUrl,
        filename: currentFilename || "image.jpg",
      });

      setActiveTab("image");
      setIsCropperOpen(false);
      setImageSrc(null); // Clear raw source
      toast.info("Image selected. Click Upload & Save to apply changes.");
    } catch (error) {
      console.error(error);
      toast.error("Error cropping image");
    }
  };

  const handleDeleteImage = async () => {
    if (!merchantId) return;

    try {
      await axiosInstance.delete(
        `/merchant-settings/merchant/${merchantId}/paid-ad-image`,
      );

      setState((prev) => ({
        ...prev,
        paid_ad_images: [],
        paid_ad_image: "",
      }));

      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleDeleteVideo = async () => {
    if (!merchantId) return;

    try {
      await axiosInstance.delete(
        `/merchant-settings/merchant/${merchantId}/paid-ad-video`,
      );

      setState((prev) => ({
        ...prev,
        paid_ad_videos: [],
        paid_ad_video: "",
      }));

      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  return (
    <Card className="border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden transition-all duration-700 hover:shadow-primary/5 bg-white rounded-[2.5rem] w-[1300px] ">
      <CardHeader className="p-6 border-b border-gray-100 bg-linear-to-r from-purple-50/30 to-transparent relative overflow-hidden">
        <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
          <Megaphone className="h-40 w-40 text-purple-400 rotate-12" />
        </div>
        <div className="flex items-center justify-between relative z-10 transition-all duration-500">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-3xl shadow-inner border border-purple-100/50">
              <Megaphone className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Promotional Banners
              </CardTitle>
              <CardDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                Visual marketing content
              </CardDescription>
            </div>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border ${state.paid_ads ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-gray-100 text-gray-400 border-gray-200"}`}
          >
            {state.paid_ads ? "Active" : "OFF"}
          </div>
        </div>
      </CardHeader>
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          state.paid_ads
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-50 grayscale"
        }`}
      >
        <div className="overflow-hidden">
          <CardContent className="px-6 py-2">
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Placement</Label>
                  <Select
                    value={state.placement || "top"}
                    onValueChange={(val) => {
                      setState({ ...state, placement: val });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select
                    value={
                      state.paid_ad_duration
                        ? String(state.paid_ad_duration)
                        : "7"
                    }
                    onValueChange={(val) => {
                      setState({
                        ...state,
                        paid_ad_duration: parseInt(val, 10),
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  setActiveTab(val);
                  setState({ ...state, paid_ad_video_status: val === "video" });
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger
                    value="image"
                    className="flex items-center gap-2 font-semibold"
                  >
                    <ImageIcon className="h-4 w-4" /> Image Ads
                  </TabsTrigger>
                  <TabsTrigger
                    value="video"
                    className="flex items-center gap-2 font-semibold"
                  >
                    <VideoIcon className="h-4 w-4" /> Video Ads
                  </TabsTrigger>
                </TabsList>

                {/* Image Tab */}
                <TabsContent value="image" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pendingFile?.type === "image" ? (
                      <div
                        className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/50 bg-background shadow-md group cursor-zoom-in"
                        onClick={() =>
                          handlePreview("image", pendingFile.previewUrl)
                        }
                      >
                        <Image
                          src={pendingFile.previewUrl}
                          alt="Pending Upload"
                          className="object-cover"
                          fill
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingFile(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[11px] px-2 py-0.5 rounded-full font-bold shadow-sm pointer-events-none">
                          Pending
                        </div>
                      </div>
                    ) : state.paid_ad_image ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border bg-background group shadow-sm">
                        <Image
                          src={getImageUrl(state.paid_ad_image)}
                          alt="Active Ad"
                          className="object-cover"
                          fill
                          unoptimized
                        />
                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-zoom-in"
                          onClick={() =>
                            handlePreview("image", state.paid_ad_image)
                          }
                        >
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {!state.paid_ad_video_status && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[11px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </div>
                        )}
                      </div>
                    ) : (
                      <Label
                        htmlFor="ad-image-upload"
                        className="aspect-video rounded-xl border-2 border-dashed border-muted hover:border-primary/50 bg-muted/20 hover:bg-muted/40 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <input
                          id="ad-image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                        <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-foreground/80">
                            Add Image
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            1200x600px recommended
                          </p>
                        </div>
                      </Label>
                    )}
                  </div>
                </TabsContent>

                {/* Video Tab */}
                <TabsContent value="video" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pendingFile?.type === "video" ? (
                      <div
                        className="relative aspect-video rounded-xl overflow-hidden border-2 border-primary/50 bg-background shadow-md group cursor-zoom-in"
                        onClick={() =>
                          handlePreview("video", pendingFile.previewUrl)
                        }
                      >
                        <video
                          src={pendingFile.previewUrl}
                          className="w-full h-full object-cover opacity-80"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Play className="w-8 h-8 text-white/80 fill-white" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-auto">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingFile(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm pointer-events-none">
                          Pending
                        </div>
                      </div>
                    ) : state.paid_ad_video ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border bg-background group shadow-sm">
                        <video
                          src={getImageUrl(state.paid_ad_video)}
                          className="w-full h-full object-cover opacity-80"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Play className="w-8 h-8 text-white/80 fill-white" />
                        </div>

                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-auto cursor-zoom-in"
                          onClick={() =>
                            handlePreview("video", state.paid_ad_video)
                          }
                        >
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVideo();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {state.paid_ad_video_status && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </div>
                        )}
                      </div>
                    ) : (
                      <Label
                        htmlFor="ad-video-upload"
                        className="aspect-video rounded-xl border-2 border-dashed border-muted hover:border-primary/50 bg-muted/20 hover:bg-muted/40 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all group"
                      >
                        <input
                          id="ad-video-upload"
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          disabled={uploading}
                        />
                        <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-center">
                          <span className="text-sm font-medium text-foreground/80">
                            Add Video
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            MP4, WebM (Max 50MB)
                          </p>
                        </div>
                      </Label>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Cropper Dialog */}
              <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Adjust Image</DialogTitle>
                    <DialogDescription>
                      Drag to reposition and use the slider to zoom.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative w-full h-80 bg-slate-50 rounded-lg overflow-hidden border border-muted">
                    {imageSrc && (
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                    )}
                  </div>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-4">
                      <Label className="w-12">Zoom</Label>
                      <div className="flex-1 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full shrink-0"
                          onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Slider
                          value={[zoom]}
                          min={1}
                          max={3}
                          step={0.1}
                          onValueChange={(value) => setZoom(value[0])}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full shrink-0"
                          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setIsCropperOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCropAndSave} disabled={uploading}>
                      {uploading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Image
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Preview Dialog */}
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-[400px] w-[90vw] p-0 bg-white rounded-2xl overflow-hidden border-none shadow-2xl [&>button]:hidden">
                  <DialogTitle className="sr-only">Ad Preview</DialogTitle>
                  <DialogDescription className="sr-only">
                    Full size preview of the promotional ad
                  </DialogDescription>
                  <div className="relative flex items-center justify-center p-4">
                    {previewContent.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewContent.url}
                        alt="Preview"
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
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-blue-200 transition-all h-9 px-4 text-sm font-semibold rounded-lg w-full sm:w-auto"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload & Save"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
