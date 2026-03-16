import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
import imageCompression from "browser-image-compression";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { getCroppedImg, getImageUrl } from "@/lib/utils/imageUtils";

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PaidAdsSettings({ config: initialConfig, merchantId, mode = "agent" }) {
  const t = useTranslations("merchantPaidAds");
  const isSuperadminMode = mode === "superadmin";
  const [superadminPlacementDuration, setSuperadminPlacementDuration] = useState(7);

  const [state, setState] = useState({
    paid_ads: initialConfig?.paid_ads ?? false,
    placement: initialConfig?.placement ?? "top",
    paid_ad_image: initialConfig?.paid_ad_image ?? "",
    paid_ad_video: initialConfig?.paid_ad_video ?? "",
    paid_ad_video_status: initialConfig?.paid_ad_video_status ?? false,
    paid_ad_duration: initialConfig?.paid_ad_duration ?? 7,
    paid_ad_start_date: "", // Empty until user selects a date
  });

  const [uploading, setUploading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(
    state.paid_ad_video_status ? "video" : "image",
  );
  const [availablePlacements, setAvailablePlacements] = useState([
    "top",
    "bottom",
    "left",
    "right",
  ]);
  const [loadingPlacements, setLoadingPlacements] = useState(true);
  // Cropper State
  const [imageSrc, setImageSrc] = useState(null);

  // Confirmation Dialog State
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // Booked dates state for conflict detection
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);
  const [dateConflictWarning, setDateConflictWarning] = useState("");
  const [conflictingBookedDates, setConflictingBookedDates] = useState([]);
  const [agentAdLock, setAgentAdLock] = useState({
    locked: false,
    message: "",
  });
  const [superadminAdLock, setSuperadminAdLock] = useState({
    locked: false,
    message: "",
  });

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
            paid_ads: isSuperadminMode
              ? (data.superadmin_homepage_ad_enabled ?? false)
              : (data.paid_ads ?? false),
            placement: isSuperadminMode
              ? (data.superadmin_homepage_ad_placement ?? "top")
              : (data.paid_ad_placement ?? "top"),
            paid_ad_image: isSuperadminMode
              ? (data.superadmin_homepage_ad_image ?? "")
              : (data.paid_ad_image ?? ""),
            paid_ad_video: isSuperadminMode
              ? (data.superadmin_homepage_ad_video ?? "")
              : (data.paid_ad_video ?? ""),
            paid_ad_video_status: isSuperadminMode
              ? (data.superadmin_homepage_ad_video_status ?? false)
              : (data.paid_ad_video_status ?? false),
            paid_ad_duration: isSuperadminMode
              ? (superadminPlacementDuration ?? 7)
              : (data.paid_ad_duration ?? 7),
            paid_ad_start_date: isSuperadminMode
              ? (data.superadmin_homepage_ad_start_date
                  ? new Date(data.superadmin_homepage_ad_start_date).toISOString().split("T")[0]
                  : getTodayDateString())
              : getTodayDateString(),
          }));
        }
      } catch (error) {
        console.error("Failed to sync paid ads settings:", error);
      }
    };
    fetchSettings();
  }, [merchantId, isSuperadminMode, superadminPlacementDuration]);

  useEffect(() => {
    if (!isSuperadminMode) return;

    const fetchSuperadminDuration = async () => {
      try {
        const settingsResp = await axiosInstance.get(
          "/super-admin-settings/homepage-placement-pricing",
        );
        const settings = settingsResp?.data?.data || settingsResp?.data || {};
        const duration = Number(settings?.ad_homepage_placement_duration_days) || 7;
        setSuperadminPlacementDuration(duration);
        setState((prev) => ({
          ...prev,
          paid_ad_duration: duration,
        }));
      } catch (error) {
        console.error("Failed to fetch superadmin homepage ad duration:", error);
      }
    };

    fetchSuperadminDuration();
  }, [isSuperadminMode]);

  useEffect(() => {
    if (!merchantId) {
      setAgentAdLock({ locked: false, message: "" });
      setSuperadminAdLock({ locked: false, message: "" });
      return;
    }

    const fetchAdLockState = async () => {
      try {
        const response = await axiosInstance.get(`/approvals/merchant/${merchantId}`);
        const approvals = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        const now = new Date();
        const pendingStatuses = [
          "pending",
          "pending_agent_review",
          "forwarded_to_superadmin",
          "approved_pending_payment",
          "payment_completed_scheduled",
          "payment_completed_active",
        ];

        const agentLockApproval = approvals.find((approval) => {
          if (approval?.approval_type !== "paid_ad") return false;

          const status = String(approval?.approval_status || "").toLowerCase();

          if (pendingStatuses.includes(status)) {
            return true;
          }

          if (status === "approved") {
            if (!approval?.ad_expired_at) return true;
            return new Date(approval.ad_expired_at) > now;
          }

          return false;
        });

        const superadminPendingStatuses = [
          "pending_agent_review",
          "forwarded_to_superadmin",
          "approved_pending_payment",
          "payment_completed_scheduled",
          "payment_completed_active",
        ];

        const superadminLockApproval = approvals.find((approval) => {
          if (approval?.approval_type !== "homepage_ad_push") return false;

          const status = String(approval?.approval_status || "").toLowerCase();

          if (superadminPendingStatuses.includes(status)) {
            return true;
          }

          if (status === "payment_completed_active" || status === "payment_completed_scheduled") {
            if (!approval?.ad_expired_at) return true;
            return new Date(approval.ad_expired_at) > now;
          }

          return false;
        });

        if (agentLockApproval) {
          const status = String(agentLockApproval?.approval_status || "").toLowerCase();
          const isPending = pendingStatuses.includes(status);
          setAgentAdLock({
            locked: true,
            message: isPending
              ? t("messages.agentAdRequestInProgress")
              : t("messages.agentAdActive"),
          });
        } else {
          setAgentAdLock({ locked: false, message: "" });
        }

        if (superadminLockApproval) {
          const status = String(superadminLockApproval?.approval_status || "").toLowerCase();
          const isPending = superadminPendingStatuses.includes(status) && ![
            "payment_completed_active",
            "payment_completed_scheduled",
          ].includes(status);
          setSuperadminAdLock({
            locked: true,
            message: isPending
              ? t("messages.superadminAdRequestInProgress")
              : t("messages.superadminAdActive"),
          });
        } else {
          setSuperadminAdLock({ locked: false, message: "" });
        }
      } catch (error) {
        console.error("Failed to fetch ad lock state:", error);
        setAgentAdLock({ locked: false, message: "" });
        setSuperadminAdLock({ locked: false, message: "" });
      }
    };

    fetchAdLockState();
  }, [merchantId, sendingRequest]);

  const isAgentAdsLocked = !isSuperadminMode && agentAdLock.locked;
  const isSuperadminAdsLocked = isSuperadminMode && superadminAdLock.locked;
  const isCurrentAdsLocked = isAgentAdsLocked || isSuperadminAdsLocked;
  const currentAdsLockMessage = isSuperadminMode
    ? superadminAdLock.message
    : agentAdLock.message;

  // Fetch available placements
  useEffect(() => {
    if (!merchantId) return;

    const fetchAvailablePlacements = async () => {
      setLoadingPlacements(true);
      try {
        // Fetch available placements for this merchant's admin (per-admin basis)
        const response = await axiosInstance.get(
          `/approvals/available-placements/merchant/${merchantId}`,
        );

        if (response.data && Array.isArray(response.data)) {
          setAvailablePlacements(response.data);

          // If current placement is not available, set to first available
          if (
            response.data.length > 0 &&
            !response.data.includes(state.placement)
          ) {
            setState((prev) => ({ ...prev, placement: response.data[0] }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch available placements:", error);
        // Fallback to all placements if API fails
        setAvailablePlacements(["top", "bottom", "left", "right"]);
      } finally {
        setLoadingPlacements(false);
      }
    };

    fetchAvailablePlacements();
  }, [merchantId, state.placement]);

  // Fetch booked dates when placement changes
  useEffect(() => {
    if (!state.placement || !merchantId) return;

    const fetchBookedDates = async () => {
      setLoadingBookedDates(true);
      // Clear any previous conflict warning when placement changes
      setDateConflictWarning("");
      try {
        const response = await axiosInstance.get(
          `/approvals/booked-dates/${state.placement}/merchant/${merchantId}`,
          {
            params: {
              approvalType: isSuperadminMode ? "homepage_ad_push" : "paid_ad",
            },
          },
        );

        if (response.data && Array.isArray(response.data.bookedDates)) {
          setBookedDates(response.data.bookedDates);
        } else {
          setBookedDates([]);
        }
      } catch (error) {
        console.error("Failed to fetch booked dates:", error);
        setBookedDates([]);
      } finally {
        setLoadingBookedDates(false);
      }
    };

    fetchBookedDates();
  }, [state.placement, merchantId, isSuperadminMode]);

  // Check for date conflicts when start date or duration changes
  useEffect(() => {
    if (!state.paid_ad_start_date || bookedDates.length === 0) {
      setDateConflictWarning("");
      setConflictingBookedDates([]);
      return;
    }

    const startDate = new Date(state.paid_ad_start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + (state.paid_ad_duration || 7));

    // Check for conflicts
    const conflicts = bookedDates.filter((booking) => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      // Check if date ranges overlap
      return startDate < bookingEnd && bookingStart < endDate;
    });

    setConflictingBookedDates(conflicts);

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const conflictStart = new Date(conflict.startDate).toLocaleDateString();
      const conflictEnd = new Date(conflict.endDate).toLocaleDateString();
      setDateConflictWarning(
        `⚠️ The selected dates conflict with an existing booking (${conflictStart} - ${conflictEnd}) for this placement. Please choose different dates or another placement.`,
      );
    } else {
      setDateConflictWarning("");
    }
  }, [state.paid_ad_start_date, state.paid_ad_duration, bookedDates]);
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

    // Check if there's a pending file upload - if yes, show confirmation dialog
    if (pendingFile) {
      setConfirmChecked(false);
      setIsConfirmDialogOpen(true);
      return;
    }

    // If no pending file, proceed directly
    await proceedWithSubmit();
  };

  const proceedWithSubmit = async () => {
    if (!merchantId) return;

    setUploading(true);
    setUploadProgress(0);
    setIsConfirmDialogOpen(false);

    try {
      // 1. Update general settings (toggle, placement, duration)
      await axiosInstance.patch(
        `/merchant-settings/merchant/${merchantId}`,
        isSuperadminMode
          ? {
              superadmin_homepage_ad_enabled: state.paid_ads,
              superadmin_homepage_ad_placement: state.placement || "top",
              superadmin_homepage_ad_start_date:
                state.paid_ad_start_date || getTodayDateString(),
            }
          : {
              paid_ads: state.paid_ads,
              paid_ad_placement: state.placement || "top",
              paid_ad_duration: parseInt(state.paid_ad_duration || "7", 10),
            },
      );

      // 2. Handle upload if pending
      if (pendingFile) {
        const formData = new FormData();
        if (pendingFile.type === "image") {
          toast.info(t("messages.uploadingImage"));
          formData.append(
            isSuperadminMode ? "superadminHomepageAdImage" : "paidAdImage",
            pendingFile.file,
            pendingFile.filename || "image.jpg",
          );
          formData.append(
            isSuperadminMode ? "superadminHomepageAdPlacement" : "paidAdPlacement",
            state.placement || "top",
          );
          if (!isSuperadminMode) {
            formData.append(
              "paidAdDuration",
              String(state.paid_ad_duration || "7"),
            );
          }
          formData.append(
            isSuperadminMode ? "superadminHomepageAdStartDate" : "paidAdStartDate",
            state.paid_ad_start_date || getTodayDateString(),
          );

          const response = await axiosInstance.post(
            isSuperadminMode
              ? `/merchant-settings/merchant/${merchantId}/superadmin-homepage-ad-image`
              : `/merchant-settings/merchant/${merchantId}/paid-ad-image`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadProgress(percentCompleted);
              },
            },
          );

          const newImageUrl = isSuperadminMode
            ? response.data?.data?.superadmin_homepage_ad_image
            : response.data?.data?.paid_ad_image;
          if (newImageUrl) {
            setState((prev) => ({
              ...prev,
              paid_ad_image: newImageUrl,
              paid_ad_video_status: false,
            }));
          }
          toast.success(t("messages.imageUploaded"));
        } else if (pendingFile.type === "video") {
          toast.info(t("messages.uploadingVideo"));
          formData.append(
            isSuperadminMode ? "superadminHomepageAdVideo" : "paidAdVideo",
            pendingFile.file,
          );
          formData.append(
            isSuperadminMode ? "superadminHomepageAdPlacement" : "paidAdPlacement",
            state.placement || "top",
          );
          if (!isSuperadminMode) {
            formData.append(
              "paidAdDuration",
              String(state.paid_ad_duration || "7"),
            );
          }
          formData.append(
            isSuperadminMode ? "superadminHomepageAdStartDate" : "paidAdStartDate",
            state.paid_ad_start_date || getTodayDateString(),
          );

          const response = await axiosInstance.post(
            isSuperadminMode
              ? `/merchant-settings/merchant/${merchantId}/superadmin-homepage-ad-video`
              : `/merchant-settings/merchant/${merchantId}/paid-ad-video`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 180000, // 3 minutes timeout for video uploads
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadProgress(percentCompleted);
              },
            },
          );

          const newVideoUrl = isSuperadminMode
            ? response.data?.data?.superadmin_homepage_ad_video
            : response.data?.data?.url;
          if (newVideoUrl) {
            setState((prev) => ({
              ...prev,
              paid_ad_video: newVideoUrl,
              paid_ad_video_status: true,
            }));
          }
          toast.success(t("messages.videoUploaded"));
        }
        setPendingFile(null);
      } else {
        toast.success(t("messages.settingsUpdated"));
      }
    } catch (error) {
      console.error(error);
      if (error.code === "ECONNABORTED") {
        toast.error(t("messages.uploadTimeout"));
      } else {
        toast.error(
          error?.response?.data?.message || t("messages.errorSaving"),
        );
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePreview = (type, url) => {
    setPreviewContent({ type, url: getImageUrl(url) });
    setIsPreviewOpen(true);
  };

  const handleSendAgentRequest = async () => {
    if (!merchantId || isSuperadminMode) return;

    if (isCurrentAdsLocked) {
      toast.error(currentAdsLockMessage || t("messages.adLocked"));
      return;
    }

    if (pendingFile) {
      toast.error(t("messages.pendingFileError"));
      return;
    }

    if (!state.paid_ads) {
      toast.error(t("messages.toggleDisabledError"));
      return;
    }

    if (!state.paid_ad_image && !state.paid_ad_video) {
      toast.error(t("messages.noMediaError"));
      return;
    }

    if (dateConflictWarning) {
      toast.error(t("messages.dateConflictError"));
      return;
    }

    setSendingRequest(true);
    try {
      await axiosInstance.post(
        `/merchant-settings/merchant/${merchantId}/paid-ad-request`,
        {
          paidAdStartDate: state.paid_ad_start_date || getTodayDateString(),
        },
      );
      toast.success(t("messages.requestSent"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          t("messages.requestFailed"),
      );
    } finally {
      setSendingRequest(false);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleTogglePaidAds = async (checked) => {
    if (!merchantId) return;

    if (isCurrentAdsLocked) {
      toast.error(currentAdsLockMessage || t("messages.adLocked"));
      return;
    }

    const previousValue = state.paid_ads;
    setState((p) => ({
      ...p,
      paid_ads: checked,
    }));
    setToggling(true);

    try {
      const payload = isSuperadminMode
        ? { superadmin_homepage_ad_enabled: checked }
        : { paid_ads: checked };

      await axiosInstance.patch(`/merchant-settings/merchant/${merchantId}`, payload);

      window.dispatchEvent(
        new CustomEvent("MERCHANT_SETTINGS_UPDATED", {
          detail: isSuperadminMode
            ? { superadmin_homepage_ad_enabled: checked }
            : { paid_ads: checked },
        }),
      );

      toast.success(
        checked
          ? (isSuperadminMode ? t("messages.superadminAdsEnabled") : t("messages.agentAdsEnabled"))
          : (isSuperadminMode ? t("messages.superadminAdsDisabled") : t("messages.agentAdsDisabled")),
      );
    } catch (error) {
      setState((p) => ({
        ...p,
        paid_ads: previousValue,
      }));
      toast.error(
        error?.response?.data?.message || t("messages.errorToggle"),
      );
    } finally {
      setToggling(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // More generous initial size check (10MB) - we'll compress after
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error(t("messages.imageTooLarge"));
        e.target.value = null; // Clear the input
        return;
      }

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

    // Size limit check (25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB in bytes
    if (file.size > maxSize) {
      toast.error(t("messages.videoTooLarge"));
      e.target.value = null; // Clear the input
      return;
    }

    // Optimize video format check - prefer MP4 and WebM
    const fileType = file.type.toLowerCase();
    if (!fileType.includes("mp4") && !fileType.includes("webm")) {
      toast.warning(t("messages.videoFormatWarning"));
    }

    // Create local object URL for preview and duration check
    const objectUrl = URL.createObjectURL(file);

    // Validate video duration (max 30 seconds)
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = function () {
      URL.revokeObjectURL(video.src);
      const duration = video.duration;

      // Check if duration exceeds 30 seconds
      if (duration > 30) {
        toast.error(
          t("messages.videoTooLong", { duration: Math.round(duration) }),
        );
        e.target.value = null; // Clear the input
        URL.revokeObjectURL(objectUrl); // Clean up
        return;
      }

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.info(t("messages.videoSelected"));

      // Set pending file for upload
      setPendingFile({
        file: file,
        type: "video",
        previewUrl: objectUrl,
        filename: file.name,
      });
      setActiveTab("video");
    };

    video.onerror = function () {
      toast.error(t("messages.videoMetadataError"));
      URL.revokeObjectURL(objectUrl);
      e.target.value = null;
    };

    video.src = objectUrl;
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

      // Compress the cropped image for faster upload
      const options = {
        maxSizeMB: 0.8, // Target 800KB max
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: "image/jpeg", // Convert to JPEG for better compression
        initialQuality: 0.85, // High quality but compressed
      };

      const compressedFile = await imageCompression(croppedBlob, options);

      const objectUrl = URL.createObjectURL(compressedFile);
      const filename =
        currentFilename?.replace(/\.[^/.]+$/, ".jpg") || "image.jpg";

      setPendingFile({
        file: compressedFile,
        type: "image",
        previewUrl: objectUrl,
        filename: filename,
      });

      setActiveTab("image");
      setIsCropperOpen(false);
      setImageSrc(null); // Clear raw source

      const sizeMB = (compressedFile.size / (1024 * 1024)).toFixed(1);
      toast.success(t("messages.imageReady"));
    } catch (error) {
      console.error(error);
      toast.error(t("messages.errorProcessing"));
    }
  };

  const handleDeleteImage = async () => {
    if (!merchantId) return;
    if (isCurrentAdsLocked) {
      toast.error(currentAdsLockMessage || t("messages.adLocked"));
      return;
    }

    try {
      await axiosInstance.delete(
        isSuperadminMode
          ? `/merchant-settings/merchant/${merchantId}/superadmin-homepage-ad-image`
          : `/merchant-settings/merchant/${merchantId}/paid-ad-image`,
      );

      setState((prev) => ({
        ...prev,
        paid_ad_images: [],
        paid_ad_image: "",
      }));

      toast.success(t("messages.imageDeleted"));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error(t("messages.errorDeleting"));
    }
  };

  const handleDeleteVideo = async () => {
    if (!merchantId) return;
    if (isCurrentAdsLocked) {
      toast.error(currentAdsLockMessage || t("messages.adLocked"));
      return;
    }

    try {
      await axiosInstance.delete(
        isSuperadminMode
          ? `/merchant-settings/merchant/${merchantId}/superadmin-homepage-ad-video`
          : `/merchant-settings/merchant/${merchantId}/paid-ad-video`,
      );

      setState((prev) => ({
        ...prev,
        paid_ad_videos: [],
        paid_ad_video: "",
      }));

      toast.success(t("messages.videoDeleted"));
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(t("messages.errorDeleting"));
    }
  };

  return (
      <>
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
                    {t("title")}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground mt-0.5">
                    {t("description")}
                  </CardDescription>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm border ${state.paid_ads ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" : "bg-gray-100 text-gray-400 border-gray-200"}`}
              >
                {state.paid_ads ? t("status.active") : t("status.off")}
              </div>
            </div>
          </CardHeader>
          <div className="px-6 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{t("toggle.label")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("toggle.description")}
                </p>
              </div>
              <Switch
                checked={state.paid_ads}
                onCheckedChange={handleTogglePaidAds}
                disabled={toggling || isCurrentAdsLocked}
              />
            </div>
            {isCurrentAdsLocked && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {currentAdsLockMessage}
              </div>
            )}
          </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("placement.label")}</Label>
                      {loadingPlacements ? (
                        <div className="h-10 rounded-md border bg-muted animate-pulse flex items-center px-3 text-sm text-muted-foreground">
                          {t("placement.loading")}
                        </div>
                      ) : availablePlacements.length === 0 ? (
                        <div className="space-y-2">
                          <div className="mb-3 inline-flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            {t("placement.noSlotsAvailable")}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("placement.noSlotsMessage")}
                          </p>
                        </div>
                      ) : (
                        <>
                          <Select
                            value={state.placement || availablePlacements[0]}
                            onValueChange={(val) => {
                              setState({ ...state, placement: val });
                            }}
                            disabled={availablePlacements.length === 0 || isCurrentAdsLocked}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("placement.selectPlaceholder")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {availablePlacements.includes("top") && (
                                <SelectItem value="top">
                                  {t("placement.top")}
                                </SelectItem>
                              )}
                              {availablePlacements.includes("left") && (
                                <SelectItem value="left">
                                  {t("placement.left")}
                                </SelectItem>
                              )}
                              {availablePlacements.includes("right") && (
                                <SelectItem value="right">
                                  {t("placement.right")}
                                </SelectItem>
                              )}
                              {availablePlacements.includes("bottom") && (
                                <SelectItem value="bottom">
                                  {t("placement.bottom")}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {availablePlacements.length < 4 && !isCurrentAdsLocked && (
                            <p className="text-xs text-amber-600 font-medium">
                              {t("placement.slotsOccupied", {
                                count: 4 - availablePlacements.length,
                                available: availablePlacements.length,
                              })}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t("duration.label")}</Label>
                      {isSuperadminMode ? (
                        <>
                          <div className="h-10 rounded-md border bg-muted flex items-center px-3 text-sm text-muted-foreground">
                            {(state.paid_ad_duration || 7)} days
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("duration.lockedMessage")}
                          </p>
                        </>
                      ) : (
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
                          disabled={isCurrentAdsLocked}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("duration.selectPlaceholder")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">
                              {t("duration.days7")}
                            </SelectItem>
                            <SelectItem value="14">
                              {t("duration.days14")}
                            </SelectItem>
                            <SelectItem value="30">
                              {t("duration.days30")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>{t("startDate.label")}</Label>
                      <input
                        type="date"
                        min={getTodayDateString()}
                        value={state.paid_ad_start_date || getTodayDateString()}
                        onChange={(e) => {
                          setState({
                            ...state,
                            paid_ad_start_date: e.target.value,
                          });
                        }}
                        disabled={isCurrentAdsLocked}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      />

                      {/* Show conflict warning */}
                      {!isCurrentAdsLocked && dateConflictWarning && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-700 font-medium">
                            {dateConflictWarning}
                          </p>
                        </div>
                      )}

                      {/* Show loading or booked dates */}
                      {!isCurrentAdsLocked && loadingBookedDates ? (
                        <p className="text-xs text-gray-500">
                          {t("startDate.loadingBookedDates")}
                        </p>
                      ) : !isCurrentAdsLocked && conflictingBookedDates.length > 0 ? (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs font-semibold text-blue-900 mb-2">
                            {t("startDate.conflictingBookedDates", { placement: state.placement })}
                          </p>
                          <ul className="text-xs text-blue-800 space-y-1">
                            {conflictingBookedDates.map((booking, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                                {new Date(booking.startDate).toLocaleDateString()} to{" "}
                                {new Date(booking.endDate).toLocaleDateString()}
                                {booking.status && (
                                  <span className="text-blue-600 font-medium ml-1">
                                    ({booking.status})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : !isCurrentAdsLocked ? (
                        <p className="text-xs text-green-600 font-medium">
                          {t("startDate.dateRangeAvailable")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <Tabs
                    value={activeTab}
                    onValueChange={(val) => {
                      setActiveTab(val);
                      setState({
                        ...state,
                        paid_ad_video_status: val === "video",
                      });
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger
                        value="image"
                        className="flex items-center gap-2 font-semibold"
                      >
                        <ImageIcon className="h-4 w-4" /> {t("tabs.image")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="video"
                        className="flex items-center gap-2 font-semibold"
                      >
                        <VideoIcon className="h-4 w-4" /> {t("tabs.video")}
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
                              alt={t("common.pendingUploadAlt")}
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
                              {t("status.pending")}
                            </div>
                          </div>
                        ) : state.paid_ad_image ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border bg-background group shadow-sm">
                            <Image
                              src={getImageUrl(state.paid_ad_image)}
                              alt={t("common.activeAdAlt")}
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
                                disabled={isCurrentAdsLocked}
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
                                <Check className="w-3 h-3" />{" "}
                                {t("status.active")}
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
                              disabled={uploading || !!dateConflictWarning || isCurrentAdsLocked}
                            />
                            <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium text-foreground/80">
                                {t("upload.addImage")}
                              </span>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {t("upload.imageInfo")}
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
                              {t("status.pending")}
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
                                disabled={isCurrentAdsLocked}
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
                                <Check className="w-3 h-3" />{" "}
                                {t("status.active")}
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
                              disabled={uploading || !!dateConflictWarning || isCurrentAdsLocked}
                            />
                            <div className="h-10 w-10 rounded-full bg-background shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium text-foreground/80">
                                {t("upload.addVideo")}
                              </span>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {t("upload.videoInfo")}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {t("upload.videoInfoExtra")}
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
                        <DialogTitle>{t("cropper.title")}</DialogTitle>
                        <DialogDescription>
                          {t("cropper.description")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="relative w-full h-80 bg-slate-50 rounded-lg overflow-hidden border border-muted">
                        {imageSrc && (
                          <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={16 / 9}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                          />
                        )}
                      </div>
                      <div className="space-y-4 py-2">
                        <div className="flex items-center gap-4">
                          <Label className="w-12">{t("cropper.zoom")}</Label>
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
                          {t("cropper.cancel")}
                        </Button>
                        <Button
                          onClick={handleCropAndSave}
                          disabled={uploading}
                        >
                          {uploading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {t("cropper.save")}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Preview Dialog */}
                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogContent className="max-w-[400px] w-[90vw] p-0 bg-white rounded-2xl overflow-hidden border-none shadow-2xl [&>button]:hidden">
                      <DialogTitle className="sr-only">
                        {t("preview.title")}
                      </DialogTitle>
                      <DialogDescription className="sr-only">
                        {t("preview.description")}
                      </DialogDescription>
                      <div className="relative flex items-center justify-center p-4">
                        {previewContent.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewContent.url}
                            alt={t("common.previewAlt")}
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
                  <div className="flex flex-col items-end pt-4">
                    <div className="flex flex-col items-end w-full sm:w-auto">
                      {availablePlacements.length === 0 &&
                        !loadingPlacements && (
                          <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 max-w-xs ">
                            <span className="mt-0.5 shrink-0 font-bold">⚠</span>
                            <span>{t("messages.noSlotsWarning")}</span>
                          </div>
                        )}
                      {uploading && uploadProgress > 0 && (
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">
                              {t("upload.uploadProgress")}
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              {uploadProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-700 h-2 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {!isSuperadminMode && (
                          <Button
                            onClick={handleSendAgentRequest}
                            disabled={
                              uploading ||
                              toggling ||
                              sendingRequest ||
                              isCurrentAdsLocked ||
                              availablePlacements.length === 0 ||
                              !!dateConflictWarning ||
                              !!pendingFile ||
                              !state.paid_ads ||
                              (!state.paid_ad_image && !state.paid_ad_video)
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all h-9 px-4 text-sm font-semibold rounded-lg w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {sendingRequest ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("buttons.sendingRequest")}
                              </>
                            ) : (
                              t("buttons.sendRequest")
                            )}
                          </Button>
                        )}

                        <Button
                          onClick={handleSubmit}
                          disabled={uploading || toggling || sendingRequest || isCurrentAdsLocked || availablePlacements.length === 0 || !!dateConflictWarning}
                          className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-blue-200 transition-all h-9 px-4 text-sm font-semibold rounded-lg w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:shadow-none"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {uploadProgress > 0
                                ? `${t("upload.uploading")} ${uploadProgress}%`
                                : t("upload.uploading")}
                            </>
                          ) : availablePlacements.length === 0 ? (
                            t("upload.noSlotsButton")
                          ) : (
                            t("upload.uploadingSave")
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Confirmation Dialog for Paid Ad Upload */}
        <Dialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {t("confirmation.title")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("confirmation.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-red-200 bg-red-50">
                <input
                  type="checkbox"
                  id="confirm-checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <label
                  htmlFor="confirm-checkbox"
                  className="text-sm leading-relaxed text-red-700 font-medium cursor-pointer select-none"
                >
                  {t("confirmation.checkboxLabel")}
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setConfirmChecked(false);
                }}
                className="w-full sm:w-auto"
              >
                {t("confirmation.cancel")}
              </Button>
              <Button
                onClick={proceedWithSubmit}
                disabled={!confirmChecked}
                className="bg-blue-700 hover:bg-blue-800 text-white w-full sm:w-auto"
              >
                {t("confirmation.submit")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
}
