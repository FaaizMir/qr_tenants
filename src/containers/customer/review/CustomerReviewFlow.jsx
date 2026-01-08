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
    name: "",
    logo: null,
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
          axiosInstance
            .get(`/merchants/${merchantId}`)
            .catch(() => null),
        ]);

        const settings = settingsRes?.data?.data;
        const merchant = merchantRes?.data?.data;

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-6 relative">
          <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse-slow font-sans tracking-tight"></div>
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center gap-2 relative">
            <p className="text-zinc-900 dark:text-zinc-100 font-black text-sm uppercase tracking-[0.3em]">
              QR Tenants
            </p>
            <div className="h-0.5 w-12 bg-linear-to-r from-transparent via-primary to-transparent"></div>
            <p className="text-zinc-400 font-medium text-[10px] uppercase tracking-widest animate-pulse">
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

      <div className="w-full max-w-4xl relative z-10 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 duration-700">
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
        {step === 4 && (
          <LuckyDraw
            merchantConfig={merchantConfig}
            nextStep={nextStep}
            prevStep={prevStep}
            setReward={setReward}
          />
        )}
        {step === 5 && (
          <RewardSuccess
            reward={reward}
            merchantConfig={merchantConfig}
            formValues={watch()}
            prevStep={prevStep}
          />
        )}
        {step === 6 && (
          <ThankYou
            resetFlow={resetFlow}
            merchantConfig={merchantConfig}
            prevStep={prevStep}
          />
        )}
      </div>
    </main>
  );
}
