import React, { useState, useCallback, useRef } from "react";
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
  Check,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
  Play,
} from "lucide-react";
import Cropper from "react-easy-crop";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { getCroppedImg, getImageUrl } from "../utils/imageUtils";

export default function PaidAdsSettings({ config, setConfig, merchantId }) {
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    config.paid_ad_video_status ? "video" : "image",
  );
  console.log("mcid", merchantId);
  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [currentFilename, setCurrentFilename] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState({
    type: null,
    url: null,
  });

  const handlePreview = (type, url) => {
    setPreviewContent({ type, url: getImageUrl(url) });
    setIsPreviewOpen(true);
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleTogglePaidAds = async (checked) => {
    if (!merchantId) return;

    const newPlacement = config.placement || "top";

    // Optimistic update
    setConfig({
      ...config,
      paid_ads: checked,
      // placement: newPlacement
    });

    try {
      await axiosInstance.patch(`/merchant-settings/merchant/${merchantId}`, {
        paid_ads: checked,
        paid_ad_placement: newPlacement,
      });
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Insufficient paid ad credits");
      // Revert
      setConfig({
        ...config,
        paid_ads: !checked,
      });
    }
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

    setUploading(true);
    const formData = new FormData();
    formData.append("paidAdVideo", file);

    try {
      // Using a specific endpoint for video or standard upload if backend supports it
      const response = await axiosInstance.post(
        `/merchant-settings/merchant/${merchantId}/paid-ad-video`, // Assuming similar endpoint pattern
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data?.data?.url) {
        // Adjust based on actual backend response
        const newVideoUrl = response.data.data.url;
        setConfig((prev) => ({
          ...prev,
          paid_ad_video: newVideoUrl,
          paid_ad_videos: [...(prev.paid_ad_videos || []), newVideoUrl],
          paid_ad_video_status: true, // Auto-enable video mode on upload
        }));
        setActiveTab("video");
        toast.success("Video uploaded successfully");
      }
    } catch (error) {
      console.error(error);
      // Fallback for demo if endpoint fails (simulated success for UI testing)
      // toast.error("Error uploading video. Backend might not support it yet.");
      toast.error(error?.response?.data?.message || "Error uploading video");
    } finally {
      setUploading(false);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    });
  };

  const handleCropAndSave = async () => {
    if (!merchantId) return;
    setUploading(true);

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append(
        "paidAdImage",
        croppedImage,
        currentFilename || "image.jpg",
      );

      const response = await axiosInstance.post(
        `/merchant-settings/merchant/${merchantId}/paid-ad-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data?.data?.paid_ad_image) {
        const newImageUrl = response.data.data.paid_ad_image;

        setConfig((prev) => {
          const currentImages = prev.paid_ad_images || [];
          const newImages = [...currentImages, newImageUrl];
          return {
            ...prev,
            paid_ad_image: newImageUrl,
            paid_ad_images: newImages,
            paid_ad_video_status: false, // Switch to image mode
          };
        });
        setActiveTab("image");
        toast.success("Paid ad image uploaded successfully");
        setIsCropperOpen(false);
        setImageSrc(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (indexToRemove) => {
    setConfig((prev) => {
      const currentImages = prev.paid_ad_images || [];
      const newImages = currentImages.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        paid_ad_images: newImages,
        paid_ad_image:
          newImages.length > 0 ? newImages[newImages.length - 1] : "",
      };
    });
  };

  const handleDeleteVideo = (indexToRemove) => {
    setConfig((prev) => {
      const currentVideos = prev.paid_ad_videos || [];
      const newVideos = currentVideos.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        paid_ad_videos: newVideos,
        paid_ad_video:
          newVideos.length > 0 ? newVideos[newVideos.length - 1] : "",
      };
    });
  };

  return (
    <Card className="border-muted/40 shadow-sm overflow-hidden">
      <CardHeader className="pb-6 border-b border-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              Promotional Ads
            </CardTitle>
            <CardDescription>
              Display a custom banner image or video to your customers
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <Label className="text-base font-medium">Enable Paid Ads</Label>
            <p className="text-sm text-muted-foreground">
              Show promotional content on the review page
            </p>
          </div>
          <Switch
            checked={config.paid_ads}
            onCheckedChange={handleTogglePaidAds}
          />
        </div>

        {config.paid_ads && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
            <div className="space-y-2">
              <Label>Ad Placement</Label>
              <Select
                value={config.placement || "top"}
                onValueChange={(val) =>
                  setConfig({ ...config, placement: val })
                }
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
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
                setConfig({ ...config, paid_ad_video_status: val === "video" });
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image Ads
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <VideoIcon className="h-4 w-4" /> Video Ads
                </TabsTrigger>
              </TabsList>

              {/* Image Tab */}
              <TabsContent value="image" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.paid_ad_images &&
                    config.paid_ad_images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-xl overflow-hidden border bg-background group shadow-sm"
                      >
                        <img
                          src={getImageUrl(imgUrl)}
                          alt={`Ad ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-zoom-in"
                          onClick={() => handlePreview("image", imgUrl)}
                        >
                          {config.paid_ad_image !== imgUrl && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfig({
                                  ...config,
                                  paid_ad_image: imgUrl,
                                  paid_ad_video_status: false,
                                });
                              }}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(index);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {config.paid_ad_image === imgUrl &&
                          !config.paid_ad_video_status && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </div>
                          )}
                      </div>
                    ))}

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
                </div>
              </TabsContent>

              {/* Video Tab */}
              <TabsContent value="video" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {config.paid_ad_videos &&
                    config.paid_ad_videos.map((vidUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-xl overflow-hidden border bg-background group shadow-sm"
                      >
                        <video
                          src={getImageUrl(vidUrl)}
                          className="w-full h-full object-cover opacity-80"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Play className="w-8 h-8 text-white/80 fill-white" />
                        </div>

                        <div
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-auto cursor-zoom-in"
                          onClick={() => handlePreview("video", vidUrl)}
                        >
                          {config.paid_ad_video !== vidUrl && (
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfig({
                                  ...config,
                                  paid_ad_video: vidUrl,
                                  paid_ad_video_status: true,
                                });
                              }}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVideo(index);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {config.paid_ad_video === vidUrl &&
                          config.paid_ad_video_status && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </div>
                          )}
                      </div>
                    ))}

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
                <div className="relative w-full h-64 sm:h-80 bg-black rounded-lg overflow-hidden border border-muted">
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
                    <Slider
                      value={[zoom]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={(value) => setZoom(value[0])}
                      className="flex-1"
                    />
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
                    Upload & Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-fit p-0 bg-transparent border-none shadow-none ring-0 [&>button]:hidden">
                <DialogTitle className="sr-only">Ad Preview</DialogTitle>
                <DialogDescription className="sr-only">
                  Full size preview of the promotional ad
                </DialogDescription>
                <div className="relative group">
                  {previewContent.type === "image" ? (
                    <img
                      src={previewContent.url}
                      alt="Preview"
                      className="max-w-[95vw] lg:max-w-4xl max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    />
                  ) : (
                    <video
                      src={previewContent.url}
                      controls
                      autoPlay
                      className="max-w-[95vw] lg:max-w-4xl max-h-[85vh] rounded-lg shadow-2xl bg-black"
                    />
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -top-3 -right-3 h-8 w-8 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white text-slate-900 border-none transition-transform hover:scale-110 z-50"
                    onClick={() => setIsPreviewOpen(false)}
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
