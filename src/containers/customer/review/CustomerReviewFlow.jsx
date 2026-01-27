"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import axiosInstance from "@/lib/axios";

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
        console.error("Error fetching data:", error);
        const responseData = error.response?.data;
        triggerError(
          "Connection Error",
          "We couldn't load the merchant configuration. Please check your internet connection or scan the QR code again.",
          responseData || error.message,
        );
      } finally {
        setInitializing(false);
      }
    };
    fetchData();
  }, [merchantId]);

  const handleReviewSubmission = (data) => {
    if (data) {
      setSubmissionData(data);
    }
    setStep(3);
  };

  // Dynamic next step handler based on lucky draw setting
  const handlePostReviewStep = () => {
    // After review submission (step 3 = RedirectWait), decide where to go
    if (merchantConfig.luckyDrawEnabled) {
      // Go to Lucky Draw (step 4)
      setStep(4);
    } else {
      // Check if we have reward info from the submission response
      const hasReward =
        submissionData?.coupon ||
        submissionData?.reward ||
        submissionData?.coupon_code;
      if (hasReward) {
        // Use the whole submissionData so we keep whatsapp_status and other flags
        setReward(submissionData);
        setStep(5); // Go to RewardSuccess
      } else {
        // Skip Lucky Draw and Rewards, go directly to Thank You (step 6)
        setStep(6);
      }
    }
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);
  const resetFlow = () => {
    setValue("text", "");
    setValue("rating", 5);
    setReward(null);
    setSubmissionData(null);
    setStep(1);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] dark:bg-zinc-950">
        {/* Deep Ambient Glow */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>

        <div className="flex flex-col items-center gap-12 relative z-10">
          {/* Refined Minimalist Spinner */}
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 border-[3px] border-primary/5 rounded-full shadow-inner"></div>
            <div className="absolute inset-0 border-[3px] border-primary border-t-transparent border-l-transparent rounded-full animate-spin shadow-primary/20"></div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.3em] ml-[0.3em]">
                QR Tenants
              </h1>
              <div className="h-0.5 w-10 bg-primary/30 rounded-full"></div>
            </div>

            <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.4em] ml-[0.4em] animate-pulse">
              Preparing your experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-4 pt-8 md:p-8 flex flex-col items-center justify-center font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[130px] animate-bounce-slow"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700 ">
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
        <DialogContent className="sm:max-w-md border-none shadow-[0_32px_128px_-16px_rgba(239,68,68,0.4)] p-0 overflow-hidden rounded-[2.5rem] bg-white">
          <div className="bg-linear-to-br from-red-600 to-red-800 p-8 text-center text-white relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles className="w-20 h-20" />
            </div>

            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl">
              <Star className="w-8 h-8 text-white fill-white animate-pulse" />
            </div>

            <DialogTitle className="text-2xl font-black tracking-tighter mb-1 uppercase italic">
              System Error
            </DialogTitle>
            <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">
              Action Required
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-red-50 border border-red-100 dark:bg-red-500/5 dark:border-red-500/10">
                <h4 className="text-red-600 font-black text-[11px] uppercase tracking-wider mb-2">
                  Message from Server
                </h4>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm font-semibold leading-relaxed italic">
                  &quot;{errorDialog.message}&quot;
                </p>
              </div>

              {errorDialog.details && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">
                    Technical Details
                  </p>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 max-h-32 overflow-y-auto">
                    <pre className="text-[10px] font-mono text-zinc-500 whitespace-pre-wrap">
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
              className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
