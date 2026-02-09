"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";

import { IdentityForm } from "./components/IdentityForm";
import { ReviewForm } from "./components/ReviewForm";
import { RedirectWait } from "./components/RedirectWait";
import { LuckyDraw } from "./components/LuckyDraw";
import { RewardSuccess } from "./components/RewardSuccess";
import { ThankYou } from "./components/ThankYou";
import { Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CustomerReviewFlow() {
  const [step, setStep] = useState(1); // 1: Identity, 2: Review, 3: Redirect, 4: Lucky/Reward or ThankYou
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      address: "",
      gender: "male",
      rating: 5,
      text: "",
      platform: null,
    },
  });

  const formValues = watch();

  // Configuration
  const [merchantConfig, setMerchantConfig] = useState({
    name: "",
    logo: null,
    rewardType: "lucky_draw",
    address: "",
    mapLink: "https://google.com",
    enablePresetReviews: true,
    enableGoogle: false,
    enableFacebook: false,
    enableInstagram: false,
    enableRed: false,
    googleReviewLink: "",
    facebookReviewLink: "",
    instagramReviewLink: "",
    redReviewLink: "",
    // Lucky draw vs direct coupon settings
    luckyDrawEnabled: false,
    whatsappBatchId: null, // The batch ID to use when lucky draw is disabled
  });

  const [submissionData, setSubmissionData] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: null,
  });

  const triggerError = (title, message, details = null) => {
    setErrorDialog({
      isOpen: true,
      title,
      message,
      details,
    });
  };
  const searchParams = useSearchParams();
  const merchantId =
    searchParams.get("merchantId") || searchParams.get("mid") || "1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Try to load from sessionStorage first
        const cachedData = sessionStorage.getItem("couponReviewData");
        if (cachedData) {
          const { merchant } = JSON.parse(cachedData);
          if (merchant && (merchant.id == merchantId || merchantId === "1")) {
            setMerchantConfig((prev) => ({
              ...prev,
              name: merchant.name || merchant.business_name || prev.name,
              address: merchant.address || prev.address,
              enablePresetReviews:
                merchant.settings?.enable_preset_reviews ??
                prev.enablePresetReviews,
              enableGoogle:
                merchant.settings?.enable_google_reviews ?? prev.enableGoogle,
              enableFacebook:
                merchant.settings?.enable_facebook_reviews ??
                prev.enableFacebook,
              enableInstagram:
                merchant.settings?.enable_instagram_reviews ??
                prev.enableInstagram,
              enableRed:
                merchant.settings?.enable_xiaohongshu_reviews ?? prev.enableRed,
              googleReviewLink:
                merchant.settings?.google_review_url || prev.googleReviewLink,
              facebookReviewLink:
                merchant.settings?.facebook_page_url || prev.facebookReviewLink,
              instagramReviewLink:
                merchant.settings?.instagram_url || prev.instagramReviewLink,
              redReviewLink:
                merchant.settings?.xiaohongshu_url || prev.redReviewLink,
              // Lucky draw settings from cache
              luckyDrawEnabled:
                merchant.settings?.luckydraw_enabled ?? prev.luckyDrawEnabled,
              whatsappBatchId:
                merchant.settings?.whatsapp_enabled_for_batch_id ??
                prev.whatsappBatchId,
            }));

            if (merchant.settings) {
              setInitializing(false);
              return;
            }
          }
        }

        // 2. Fetch remote data using publicAxios to avoid 401s
        const [settingsRes, merchantRes] = await Promise.all([
          axiosInstance
            .get(`/merchant-settings/merchant/${merchantId}`)
            .catch(() => null),
          axiosInstance.get(`/merchants/${merchantId}`).catch(() => null),
        ]);

        const settings = settingsRes?.data?.data;
        const merchant = merchantRes?.data?.data;

        console.log("Merchant Settings:", settings);
        console.log("Lucky Draw Enabled:", settings?.luckydraw_enabled);
        console.log(
          "WhatsApp Batch ID:",
          settings?.whatsapp_enabled_for_batch_id,
        );

        if (settings || merchant) {
          setMerchantConfig((prev) => ({
            ...prev,
            name: merchant?.name || merchant?.business_name || prev.name,
            address: merchant?.address || prev.address,
            logo: merchant?.logo_url || prev.logo,
            rewardType: settings?.reward_type || prev.rewardType,
            enablePresetReviews:
              settings?.enable_preset_reviews ?? prev.enablePresetReviews,
            enableGoogle: settings?.enable_google_reviews ?? prev.enableGoogle,
            enableFacebook:
              settings?.enable_facebook_reviews ?? prev.enableFacebook,
            enableInstagram:
              settings?.enable_instagram_reviews ?? prev.enableInstagram,
            enableRed: settings?.enable_xiaohongshu_reviews ?? prev.enableRed,
            googleReviewLink:
              settings?.google_review_url || prev.googleReviewLink,
            facebookReviewLink:
              settings?.facebook_page_url || prev.facebookReviewLink,
            instagramReviewLink:
              settings?.instagram_url || prev.instagramReviewLink,
            redReviewLink: settings?.xiaohongshu_url || prev.redReviewLink,
            // Lucky draw vs direct coupon settings
            luckyDrawEnabled: settings?.luckydraw_enabled ?? false,
            whatsappBatchId: settings?.whatsapp_enabled_for_batch_id ?? null,
          }));
        }
      } catch (error) {
        console.error("Error fetching merchant data:", error);
        const responseData = error.response?.data;

        // Show toast notification
        toast.error(
          "Configuration load failed. Using default settings. Some features may be limited.",
        );

        // Set default fallback config to allow user to continue
        setMerchantConfig((prev) => ({
          ...prev,
          name: "Welcome",
          address: "Store Location",
          enablePresetReviews: true,
          enableGoogle: true,
        }));

        console.warn(
          "Using fallback configuration:",
          responseData || error.message,
        );
      } finally {
        setInitializing(false);
      }
    };
    fetchData();
  }, [merchantId]);

  const handleReviewSubmission = (data) => {
    try {
      if (data) {
        setSubmissionData(data);
      }
      setStep(3);
    } catch (error) {
      console.error("Review submission handling error:", error);
      toast.error("Failed to process submission. Please try again.");
      setLoading(false);
    }
  };

  // Dynamic next step handler based on lucky draw setting
  const handlePostReviewStep = () => {
    try {
      // After review submission (step 3 = RedirectWait), decide where to go
      if (merchantConfig.luckyDrawEnabled) {
        // Verify we have customer ID for lucky draw
        const customerId =
          submissionData?.customer_id ||
          submissionData?.customer?.id ||
          submissionData?.id;

        if (!customerId) {
          console.error("Missing customer ID for lucky draw");
          toast.error("Session error. Redirecting to thank you page.");
          setReward(null); // Clear any reward data
          setStep(6);
          return;
        }
        // Go to Lucky Draw (step 4)
        setStep(4);
      } else {
        // Check if we have reward info from the submission response
        const hasWhatsAppError =
          submissionData?.whatsapp_status === "failed" ||
          submissionData?.whatsapp_error ||
          submissionData?.error === "whatsapp_credit_low" ||
          submissionData?.whatsapp_notification?.credits_insufficient;

        const hasReward =
          submissionData?.coupon ||
          submissionData?.reward ||
          submissionData?.coupon_code;

        // Rollback: Don't set reward if there was a WhatsApp error
        if (hasReward && !hasWhatsAppError) {
          // Use the whole submissionData so we keep whatsapp_status and other flags
          setReward(submissionData);
          setStep(5); // Go to RewardSuccess
        } else if (hasWhatsAppError) {
          // Error occurred, rollback - go to thank you with error data
          console.warn(
            "WhatsApp delivery failed, proceeding without reward display",
          );
          // Pass submissionData to ThankYou so it can display error details
          setReward(submissionData);
          setStep(6);
        } else {
          // Skip Lucky Draw and Rewards, go directly to Thank You (step 6)
          setReward(null);
          setStep(6);
        }
      }
    } catch (error) {
      console.error("Post-review navigation error:", error);
      toast.error("Navigation error occurred. Proceeding to completion.");
      setReward(null); // Clear reward on error
      setStep(6); // Fallback to thank you page
    }
  };

  const nextStep = (flag) => {
    if (flag === "skip") {
      setStep(1);
      setLoading(false);
      setSubmissionData(null);
      setReward(null);
      toast.info("Returning to start. You can submit another review.");
      return;
    }
    if (flag === "error") {
      // Skip RewardSuccess, go directly to ThankYou with error
      setStep(6);
      return;
    }
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    // Always go back to IdentityForm (step 1) and reset state
    setStep(1);
    setLoading(false);
    setSubmissionData(null);
    setReward(null);
    toast.info("Starting over. Please fill in your details again.");
  };

  const resetFlow = () => {
    setValue("text", "");
    setValue("rating", 5);
    setReward(null);
    setSubmissionData(null);
    setLoading(false);
    setStep(1);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Deep Ambient Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-br from-primary/5 to-blue-500/5 rounded-full blur-[140px] animate-pulse-slow"></div>
        </div>

        <div className="flex flex-col items-center gap-12 relative z-10">
          {/* Refined Minimalist Spinner */}
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 border-[3px] border-primary/5 rounded-full shadow-inner"></div>
            <div className="absolute inset-0 border-[3px] border-primary border-t-transparent border-l-transparent rounded-full animate-spin shadow-primary/20"></div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                QR Tenants
              </h1>
              <div className="h-0.5 w-10 bg-primary/30 rounded-full"></div>
            </div>

            <p className="text-zinc-400 font-semibold text-[10px] uppercase animate-pulse">
              Preparing your experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4 pt-8 md:p-8 flex flex-col items-center justify-center font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-linear-to-br from-emerald-500/10 to-primary/5 rounded-full blur-[140px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-linear-to-br from-blue-600/10 to-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[45%] h-[45%] bg-linear-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-[150px] animate-bounce-slow"></div>
      </div>

      <div className="w-full max-w-8xl relative z-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700 ">
        {step === 1 && (
          <IdentityForm
            register={register}
            handleSubmit={handleSubmit}
            nextStep={nextStep}
            setValue={setValue}
            control={control}
            errors={errors}
            merchantConfig={merchantConfig}
          />
        )}
        {step === 2 && (
          <ReviewForm
            merchantConfig={merchantConfig}
            setValue={setValue}
            formValues={watch()}
            register={register}
            control={control}
            nextStep={handleReviewSubmission}
            prevStep={prevStep}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {step === 3 && (
          <RedirectWait
            nextStep={handlePostReviewStep}
            prevStep={prevStep}
            merchantConfig={merchantConfig}
          />
        )}
        {step === 4 && (
          <LuckyDraw
            merchantConfig={merchantConfig}
            nextStep={nextStep}
            prevStep={prevStep}
            setReward={setReward}
            customerId={
              submissionData?.customer_id ||
              submissionData?.customer?.id ||
              submissionData?.id
            }
            merchantId={merchantId}
            formValues={watch()}
          />
        )}
        {step === 5 && (
          <RewardSuccess
            reward={reward}
            merchantConfig={merchantConfig}
            formValues={watch()}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        )}
        {step === 6 && (
          <ThankYou
            resetFlow={resetFlow}
            merchantConfig={merchantConfig}
            prevStep={prevStep}
            reward={reward}
            formValues={watch()}
          />
        )}
      </div>

      {/* Modern Error Handling Dialog */}
      <Dialog
        open={errorDialog.isOpen}
        onOpenChange={(open) =>
          setErrorDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-md border-none shadow-[0_32px_128px_-16px_rgba(239,68,68,0.5)] p-0 overflow-hidden rounded-[2.5rem] bg-white">
          {/* Header with Gradient */}
          <div className="bg-linear-to-br from-red-600 via-red-700 to-red-800 p-8 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            </div>

            {/* Icon */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-2xl animate-pulse">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <DialogTitle className="relative text-3xl font-bold tracking-tight mb-2">
              System Error
            </DialogTitle>
            <div className="flex items-center justify-center gap-2 relative">
              <div className="h-0.5 w-6 bg-white/40 rounded-full"></div>
              <p className="text-red-100 text-xs font-semibold uppercase tracking-widest">
                Action Required
              </p>
              <div className="h-0.5 w-6 bg-white/40 rounded-full"></div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {/* Error Message */}
              <div className="p-6 rounded-2xl bg-linear-to-br from-red-50 via-white to-red-50 border-2 border-red-200/60 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-700 font-bold text-xs uppercase tracking-wide mb-2">
                      Error Message
                    </h4>
                    <p className="text-zinc-800 text-sm font-semibold leading-relaxed">
                      {errorDialog.message}
                    </p>
                  </div>
                </div>
              </div>

              {errorDialog.details && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide px-1 flex items-center gap-2">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Technical Details
                  </p>
                  <div className="p-4 rounded-2xl bg-zinc-50 border-2 border-zinc-200/60 max-h-32 overflow-y-auto">
                    <pre className="text-xs font-mono text-zinc-600 whitespace-pre-wrap">
                      {typeof errorDialog.details === "object"
                        ? JSON.stringify(errorDialog.details, null, 2)
                        : errorDialog.details}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() =>
                setErrorDialog((prev) => ({ ...prev, isOpen: false }))
              }
              className="w-full h-14 rounded-2xl bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 hover:from-zinc-800 hover:via-zinc-700 hover:to-zinc-800 text-white font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
