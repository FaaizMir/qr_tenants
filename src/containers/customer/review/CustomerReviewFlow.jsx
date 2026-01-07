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
        ]);

        const settings = settingsRes?.data?.data;
        const merchant = merchantRes?.data?.data;

        if (settings || merchant) {
          setMerchantConfig((prev) => ({
            ...prev,
            name: merchant?.name || merchant?.business_name || prev.name,
            address: merchant?.address || prev.address,
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
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setInitializing(false);
      }
    };
    fetchData();
  }, [merchantId]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);
  const resetFlow = () => {
    setValue("text", "");
    setValue("rating", 5);
    setReward(null);
    setStep(1);
  };

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
            merchantConfig={merchantConfig}
          />
        )}
        {step === 2 && (
          <ReviewForm
            merchantConfig={merchantConfig}
            register={register}
            setValue={setValue}
            formValues={formValues}
            nextStep={nextStep}
            prevStep={prevStep}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        {step === 3 && (
          <RedirectWait
            nextStep={nextStep}
            prevStep={prevStep}
            merchantConfig={merchantConfig}
          />
        )}
        {step === 4 &&
          (merchantConfig.rewardType === "lucky_draw" ? (
            <LuckyDraw
              nextStep={nextStep}
              prevStep={prevStep}
              setReward={setReward}
              merchantConfig={merchantConfig}
            />
          ) : (
            <RewardSuccess
              reward={reward}
              formValues={formValues}
              merchantConfig={merchantConfig}
              prevStep={prevStep}
            />
          ))}
        {step === 5 && (
          <RewardSuccess
            reward={reward}
            formValues={formValues}
            merchantConfig={merchantConfig}
            prevStep={prevStep}
          />
        )}
        {(step === 6 ||
          (step === 5 && merchantConfig.rewardType !== "lucky_draw")) && (
            <ThankYou
              resetFlow={resetFlow}
              merchantConfig={merchantConfig}
              prevStep={prevStep}
            />
          )}
      </div>

      {/* Footer Branding - Global but subtle */}
      <div className="fixed bottom-6 left-0 w-full text-center pointer-events-none z-0">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
          Powered by QR Tenants Experience
        </p>
      </div>
    </main>
  );
}
