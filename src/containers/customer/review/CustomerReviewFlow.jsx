"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

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
      phone: "",
      dob: "",
      rating: 5,
      text: "",
      platform: null,
    },
  });

  // Watch values for UI updates
  const formValues = watch();

  // Configuration (Mock)
  const [merchantConfig] = useState({
    name: "The Gourmet Bistro",
    logo: "/placeholder-logo.png",
    rewardType: "lucky_draw", // options: "none", "coupon", "lucky_draw"
    address: "123 Foodie Lane, Flavor Town",
    mapLink: "https://maps.google.com",
  });

  const nextStep = () => setStep((s) => s + 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-3xl shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-card/95">
        {/* Header Image / Branding */}
        <div className="h-32 bg-linear-to-r from-primary/80 to-purple-600/80 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="z-10 text-center text-white p-4">
            <h1 className="text-2xl font-bold drop-shadow-md">
              {merchantConfig.name}
            </h1>
            <p className="text-sm opacity-90">{merchantConfig.address}</p>
          </div>
        </div>

        <CardContent className="p-6">
          {step === 1 && (
            <IdentityForm
              register={register}
              handleSubmit={handleSubmit}
              nextStep={nextStep}
              control={control}
              errors={errors}
            />
          )}
          {step === 2 && (
            <ReviewForm
              merchantConfig={merchantConfig}
              setValue={setValue}
              formValues={formValues}
              register={register}
              nextStep={nextStep}
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
        </CardContent>

        <CardFooter className="bg-muted/30 p-4 text-center justify-center">
          <p className="text-xs text-muted-foreground">Powered by QR Tenants</p>
        </CardFooter>
      </Card>
    </div>
  );
}
