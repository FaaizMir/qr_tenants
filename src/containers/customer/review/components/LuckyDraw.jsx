"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Trophy,
  Gift,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Star,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import axios from "axios";
import { toast } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const LuckyDraw = ({
  merchantConfig,
  nextStep,
  prevStep,
  setReward,
  customerId,
  merchantId,
  formValues,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(true);

  const triggerError = (title, message, details = null) => {
    toast.error(`${title}: ${message}`);
    if (details) console.error("Error details:", details);
  };

  useEffect(() => {
    const fetchPrizes = async () => {
      if (!merchantId) return;
      try {
        const apiBase = axiosInstance.defaults.baseURL || "";
        const prizesUrl = apiBase.endsWith("/")
          ? `${apiBase}lucky-draw/prizes/merchant/${merchantId}`
          : `${apiBase}/lucky-draw/prizes/merchant/${merchantId}`;

        const response = await axios.get(prizesUrl);
        const prizeData = response.data?.data || response.data || [];
        setPrizes(Array.isArray(prizeData) ? prizeData : []);
      } catch (error) {
        console.error("Failed to fetch prizes:", error);
      } finally {
        setIsLoadingPrizes(false);
      }
    };

    fetchPrizes();
  }, [merchantId]);

  const handleSpin = async () => {
    if (isSpinning || hasSpun) return;

    // Validate IDs
    const safeMerchantId = parseInt(merchantId);
    const safeCustomerId = parseInt(customerId);

    if (isNaN(safeMerchantId) || isNaN(safeCustomerId)) {
      triggerError(
        "Session Expired",
        "Required IDs are missing. Please refresh and try again.",
      );
      return;
    }

    setIsSpinning(true);

    // Smooth slower spin animation (increased rotations and duration)
    // 6 seconds duration for better suspense
    const extraDegrees = Math.floor(Math.random() * 360);
    // Use 10 full rotations for more "spin" time
    const newRotation = rotation + 360 * 8 + extraDegrees;
    setRotation(newRotation);

    try {
      const payload = {
        customer_id: safeCustomerId,
        merchant_id: safeMerchantId,
      };

      const apiBase = axiosInstance.defaults.baseURL || "";
      const spinUrl = apiBase.endsWith("/")
        ? `${apiBase}lucky-draw/spin`
        : `${apiBase}/lucky-draw/spin`;

      const response = await axios({
        method: "post",
        url: spinUrl,
        data: payload,
        headers: { "Content-Type": "application/json" },
      });

      const prizeData = response.data?.data;

      // Sync animation with result display
      // Increased to 6000ms to match the new duration
      setTimeout(() => {
        setIsSpinning(false);
        setHasSpun(true);
        setResult(prizeData);
        setReward(prizeData);
        toast.success(
          `Magnificent! You won ${prizeData?.prize?.prize_name || "a prize"}!`,
        );
      }, 6000);
    } catch (error) {
      console.error("Lucky Draw Error:", error);
      setIsSpinning(false);

      const responseData = error.response?.data;
      const status = error.response?.status;
      const errorCode = responseData?.statusCode || status;
      const errorMsg =
        responseData?.message ||
        "Failed to process your spin. Please contact merchant staff.";

      triggerError(
        `Spin Failure (${errorCode})`,
        errorMsg,
        responseData?.errors || responseData?.error || null,
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <Card className="w-full border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[20px] overflow-hidden bg-white ">
        <CardHeader className="flex flex-col items-center text-center pb-8 border-b border-zinc-100/50 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={isSpinning || hasSpun}
            className="absolute left-6 top-8 h-8 rounded-full gap-2 text-zinc-400 hover:text-primary transition-colors disabled:opacity-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">
              Back
            </span>
          </Button>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 text-primary mb-4 shadow-sm">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 w-full max-w-lg">
            <CardTitle className="text-3xl font-black tracking-tight">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Lucky Draw"}
            </CardTitle>
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
            <CardDescription className="text-base font-medium pt-1">
              A gift for your valuable feedback.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-12 px-8 md:px-20 flex flex-col items-center">
          {/* Enhanced Wheel Component */}
          <div className="relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-8 bg-linear-to-r from-primary/30 via-purple-500/20 to-blue-500/30 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>

            {/* The Wheel */}
            <div
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-10 border-zinc-900 dark:border-zinc-100 shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-6000 cubic-bezier(0.1, 0, 0.1, 1) flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800/50"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Segments Visualization */}
              {(prizes.length > 0 ? prizes : [...Array(10)]).map((prize, i) => {
                const totalSegments = prizes.length > 0 ? prizes.length : 10;
                const angle = 360 / totalSegments;
                return (
                  <div
                    key={i}
                    className="absolute w-full h-full"
                    style={{ transform: `rotate(${i * angle}deg)` }}
                  >
                    {/* Segment Line */}
                    <div
                      className={cn(
                        "absolute top-0 left-1/2 -ml-px w-0.5 h-1/2 origin-bottom opacity-20",
                        i % 2 === 0 ? "bg-primary" : "bg-purple-500",
                      )}
                    ></div>

                    {/* Prize Label - Positioned radially */}
                    <div
                      className="absolute top-4 left-1/2 -translate-x-1/2 h-1/2 flex flex-col items-center pt-4 md:pt-8"
                      style={{
                        transform: `rotate(${angle / 2}deg)`,
                        transformOrigin: "center bottom",
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-zinc-700 dark:text-zinc-200 text-center max-w-[60px] md:max-w-20 wrap-break-word line-clamp-2"
                          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                        >
                          {prizes.length > 0
                            ? prize.prize_name
                            : i % 2 === 0
                              ? "Free Gift"
                              : "Mystery Box"}
                        </span>
                        {i % 3 === 0 ? (
                          <Gift className="w-4 h-4 text-primary/40" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-zinc-400/40" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Center Pivot */}
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 shadow-2xl z-20 flex items-center justify-center border-4 border-zinc-800 dark:border-zinc-200">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-pulse"></div>
              </div>
            </div>

            {/* Top Indicator / Needle */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 z-30 flex items-center justify-center drop-shadow-xl">
              <div className="w-0 h-0 border-l-12 border-l-transparent border-r-12 border-r-transparent border-t-20 border-t-zinc-900 dark:border-t-zinc-100 drop-shadow-lg"></div>
            </div>
          </div>

          {!hasSpun ? (
            <div className="text-center space-y-8 w-full max-w-sm px-4">
              <div className="space-y-3">
                <h3 className="text-2xl font-black italic tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                  UNLEASH YOUR LUCK
                </h3>
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-wider">
                  Tap below to spin. Every spin is a guaranteed win for our
                  valued reviewers!
                </p>
              </div>

              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] hover:shadow-[0_24px_48px_-12px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-none group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-white/10 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                {isSpinning ? (
                  <div className="flex items-center gap-3">
                    <RotateCw className="w-6 h-6 animate-spin" />
                    Calculating...
                  </div>
                ) : (
                  <>
                    Spin the Wheel
                    <Sparkles className="ml-3 w-6 h-6 text-yellow-400 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-8 w-full px-4">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center mb-2 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>

                <h3 className="text-3xl font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100 uppercase">
                  MAGNIFICENT!
                </h3>

                <div className="w-full py-8 px-6 rounded-[2.5rem] bg-linear-to-br from-zinc-900 to-zinc-800 text-white shadow-2xl relative overflow-hidden border border-white/5">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400 mb-2 italic">
                    Official Prize
                  </p>
                  <p className="text-4xl md:text-5xl font-black tracking-tighter mb-2 italic uppercase">
                    {result?.prize?.prize_name || "Special Reward"}
                  </p>
                  {result?.prize?.prize_description && (
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                      {result.prize.prize_description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 mt-4">
                  {result?.whatsapp_status === "failed" ||
                    result?.whatsapp_error ||
                    result?.error === "whatsapp_credit_low" ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest leading-none">
                        WhatsApp Error:{" "}
                        {result?.whatsapp_error ||
                          result?.error_message ||
                          (result?.error === "whatsapp_credit_low"
                            ? "Credit Exhausted"
                            : "Delivery Failed")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                        Sent to WhatsApp
                      </span>
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Code:{" "}
                    {result?.coupon?.coupon_code ||
                      result?.coupon_code ||
                      "Processing"}
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-700/50 max-w-sm mt-4">
                  {result?.whatsapp_status === "failed" ||
                    result?.whatsapp_error ||
                    result?.error === "whatsapp_credit_low" ? (
                    <p className="text-[11px] font-bold text-red-500 dark:text-red-400 leading-relaxed uppercase tracking-wide italic px-4">
                      &quot;We couldn&quot;t send the reward to your WhatsApp
                      due to a technical error. <br />
                      <span className="text-zinc-900 dark:text-zinc-100 font-black not-italic mt-2 block">
                        PLEASE TAKE A SCREENSHOT OF THIS SCREEN AND SHOW IT TO
                        OUR STAFF TO CLAIM YOUR BENEFIT.
                      </span>
                      &quot;
                    </p>
                  ) : (
                    <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-wide italic px-4">
                      &quot;Reward sent to your WhatsApp with the number{" "}
                      <span className="text-zinc-900 dark:text-zinc-100 font-black not-italic">
                        {formValues?.phone || "you provided"}
                      </span>{" "}
                      you entered while submitting the review form.&quot;
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={nextStep}
                className="w-full h-16 rounded-2xl text-xl font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_20px_40px_-12px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] group"
              >
                Claim My Reward
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800 py-4 flex justify-center mt-6">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            Verified Secure Experience{" "}
            <Sparkles className="w-3 h-3 text-primary animate-pulse" /> Powered
            by QR Tenants
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
