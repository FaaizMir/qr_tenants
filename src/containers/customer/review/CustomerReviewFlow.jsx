"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";

import { IdentityForm } from "./components/IdentityForm";
import { ReviewForm } from "./components/ReviewForm";
import { RedirectWait } from "./components/RedirectWait";
import { LuckyDraw } from "./components/LuckyDraw";
import { RewardSuccess } from "./components/RewardSuccess";
import { ThankYou } from "./components/ThankYou";

export function CustomerReviewFlow() {
  const [step, setStep] = useState(1); // 1: Identity, 2: Review, 3: Redirect, 4: Lucky/Reward
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
    name: "Loading...",
    logo: "/placeholder-logo.png",
    rewardType: "lucky_draw",
    address: "",
    mapLink: "https://maps.google.com",
    enablePresetReviews: true,
    enableGoogle: false,
    enableFacebook: false,
    enableInstagram: false,
    enableRed: false,
    googleReviewLink: "",
    facebookReviewLink: "",
    instagramReviewLink: "",
    redReviewLink: "",
  });

  const [initializing, setInitializing] = useState(true);
  const id = 1;
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Settings
        const settingsRes = await axiosInstance.get(
          `/merchant-settings/merchant/${id}`
        );
        const settings = settingsRes.data?.data;

        // Fetch Merchant Details (for Name)
        const merchantRes = await axiosInstance.get(`/merchants/${id}`);
        const merchant = merchantRes.data?.data;

        if (settings) {
          setMerchantConfig((prev) => ({
            ...prev,
            name: merchant?.name || "The Gourmet Bistro",
            address: merchant?.address || prev.address,
            enablePresetReviews: settings.enable_preset_reviews,
            enableGoogle: settings.enable_google_reviews,
            enableFacebook: settings.enable_facebook_reviews,
            enableInstagram: settings.enable_instagram_reviews,
            enableRed: settings.enable_xiaohongshu_reviews,
            googleReviewLink: settings.google_review_url,
            facebookReviewLink: settings.facebook_page_url,
            instagramReviewLink: settings.instagram_url,
            redReviewLink: settings.xiaohongshu_url,
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setInitializing(false);
      }
    };
    fetchData();
  }, []);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest animate-pulse">
            Initialising...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-background p-4 flex flex-col items-center justify-center font-sans tracking-tight">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10 transition-all duration-500">
        {step === 1 && (
          <IdentityForm
            register={register}
            handleSubmit={handleSubmit}
            nextStep={nextStep}
            setValue={setValue}
            control={control}
            errors={errors}
            watch={watch}
          />
        )}
        {step === 2 && (
          <ReviewForm
            merchantConfig={merchantConfig}
            setValue={setValue}
            formValues={formValues}
            register={register}
            nextStep={nextStep}
            prevStep={prevStep}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {step === 3 && <RedirectWait nextStep={nextStep} />}
        {step === 4 &&
          (merchantConfig.rewardType === "lucky_draw" ? (
            <LuckyDraw nextStep={nextStep} setReward={setReward} />
          ) : merchantConfig.rewardType === "coupon" ? (
            <RewardSuccess reward={reward} formValues={formValues} />
          ) : (
            <ThankYou merchantConfig={merchantConfig} />
          ))}
        {step === 5 && (
          <RewardSuccess reward={reward} formValues={formValues} />
        )}
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-6 left-0 w-full text-center pointer-events-none">
        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">
          Experience by QR Tenants
        </p>
      </div>
    </main>
  );
}
