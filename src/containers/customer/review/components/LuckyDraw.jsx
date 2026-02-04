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

  // Generic prize segments for wheel display
  const prizes = [
    { id: 1, prize_name: "Gift" },
    { id: 2, prize_name: "Prize" },
    { id: 3, prize_name: "Reward" },
    { id: 4, prize_name: "Bonus" },
    { id: 5, prize_name: "Special" },
    { id: 6, prize_name: "Gift" },
    { id: 7, prize_name: "Prize" },
    { id: 8, prize_name: "Reward" },
    { id: 9, prize_name: "Bonus" },
    { id: 10, prize_name: "Special" },
  ];

  const triggerError = (title, message, details = null) => {
    toast.error(`${title}: ${message}`);
    if (details) console.error("Error details:", details);
  };

  const handleSpin = async () => {
    if (isSpinning || hasSpun) return;

    // Validate IDs
    const safeMerchantId = parseInt(merchantId);
    const safeCustomerId = parseInt(customerId);

    if (isNaN(safeMerchantId) || isNaN(safeCustomerId)) {
      toast.error(
        "Session error: Missing required information. Please try skipping or go back.",
      );
      console.error("Missing IDs:", { merchantId, customerId });
      return;
    }

    setIsSpinning(true);

    // Smooth slower spin animation (increased rotations and duration)
    // 8 seconds duration for better suspense and engagement
    const extraDegrees = Math.floor(Math.random() * 360);
    // Use 10 full rotations for more "spin" time
    const newRotation = rotation + 360 * 10 + extraDegrees;
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
      // Increased to 8000ms to match the new duration for better engagement
      setTimeout(() => {
        setIsSpinning(false);
        setHasSpun(true);
        setResult(prizeData);
        setReward(prizeData);
        toast.success(
          `Magnificent! You won ${prizeData?.prize?.prize_name || "a prize"}!`,
        );

        const whatsappStatus = prizeData?.whatsapp_notification;
        if (whatsappStatus?.credits_insufficient && !whatsappStatus?.sent) {
          toast.error(
            `Notice: WhatsApp credits are insufficient (Available: ${whatsappStatus?.available_credits ?? 0}) to send the voucher.`,
          );
        } else if (
          whatsappStatus?.sent &&
          !whatsappStatus?.credits_insufficient
        ) {
          toast.success("Success: Reward details sent to your WhatsApp!");
        }
      }, 8000);
    } catch (error) {
      console.error("Lucky Draw Error:", error);

      // Stop the wheel animation immediately
      setIsSpinning(false);
      setRotation(rotation); // Reset to current position

      const responseData = error.response?.data;
      const status = error.response?.status;
      const errorCode = responseData?.statusCode || status;
      const errorMsg =
        responseData?.message ||
        "Failed to process your spin. Please try again or contact merchant staff.";

      // Show user-frienhidden lg:flex flex-col flex-col items-center text-center justify-center bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 p-12 relative overflow-hidden min-h-[700px]
      toast.error(`Spin Error: ${errorMsg}`);

      // Log detailed error for debugging
      console.error("Spin error details:", {
        code: errorCode,
        message: errorMsg,
        details: responseData?.errors || responseData?.error,
      });

      // Allow user to try spinning again
      // Don't set hasSpun to true so they can retry
    }
  };
  // Validate customer ID on mount - show warning if missing
  useEffect(() => {
    if (!customerId || isNaN(parseInt(customerId))) {
      console.warn("Lucky Draw: Missing or invalid customer ID", customerId);
      toast.warning("Session warning: You can skip lucky draw if needed.", {
        duration: 5000,
      });
    }
  }, [customerId]);

  return (
    <div className=" w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50 animate-in fade-in duration-700 overflow-hidden">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 overflow-hidden border border-slate-200/50">
        {/* Left Panel - Brand Experience */}
        <div className="hidden lg:flex flex-col items-center text-center justify-center bg-linear-to-br from-primary via-primary/95 to-primary/80 p-12 relative overflow-hidden h-full">
          {/* Animated Background Orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-slower"></div>

          {/* Back Button - Desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevStep}
            disabled={isSpinning || hasSpun}
            className="absolute top-8 left-8 h-10 px-4 rounded-full gap-2 text-white/80 hover:text-white hover:bg-white/10 transition-all z-10 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Back
            </span>
          </Button>

          <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
                Test Your
                <br />
                <span className="text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-primary-100 to-white animate-shimmer bg-size-[200%_100%]">
                  Luck
                </span>
              </h1>
              <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
                Every spin is a guaranteed win! Your feedback deserves a reward.
              </p>

              <div className="flex items-center justify-center gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {prizes.length || 10}+
                  </div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                    Prizes
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/70 font-semibold uppercase tracking-wide">
                    Win Rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Wheel */}
        <div className="bg-white/80 backdrop-blur-2xl  p-8 md:p-12 border border-amber-200/50 shadow-2xl min-h-[700px] flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={isSpinning || hasSpun}
              className="absolute left-0 top-0 h-10 px-3 rounded-full text-zinc-400 hover:text-amber-600 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 mb-4">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">
              {merchantConfig?.name || "Lucky Draw"}
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 mt-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>{merchantConfig?.address || "Store Location"}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 ">
            {/* Wheel Container */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-12 bg-linear-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>

              {/* The Wheel */}
              <div
                className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border-16 border-zinc-900 shadow-[0_0_80px_rgba(0,0,0,0.3)] transition-transform duration-8000 ease-[cubic-bezier(0.1,0,0.1,1)] flex items-center justify-center overflow-hidden bg-linear-to-br from-white via-amber-50 to-white"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Segments */}
                {(prizes.length > 0 ? prizes : [...Array(10)]).map(
                  (prize, i) => {
                    const totalSegments =
                      prizes.length > 0 ? prizes.length : 10;
                    const angle = 360 / totalSegments;
                    const isEven = i % 2 === 0;

                    return (
                      <div
                        key={i}
                        className="absolute w-full h-full"
                        style={{ transform: `rotate(${i * angle}deg)` }}
                      >
                        {/* Segment Background */}
                        <div
                          className={cn(
                            "absolute top-0 left-1/2 -ml-px w-full h-1/2 origin-bottom",
                            isEven ? "bg-amber-100/80" : "bg-yellow-100/80",
                          )}
                          style={{
                            clipPath: `polygon(50% 100%, ${50 - 50 * Math.tan((angle * Math.PI) / 360)}% 0%, ${50 + 50 * Math.tan((angle * Math.PI) / 360)}% 0%)`,
                          }}
                        ></div>

                        {/* Prize Label */}
                        <div
                          className="absolute top-6 left-1/2 -translate-x-1/2 h-1/2 flex flex-col items-center pt-4"
                          style={{
                            transform: `rotate(${angle / 2}deg)`,
                            transformOrigin: "center bottom",
                          }}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            {i % 3 === 0 ? (
                              <Gift className="w-6 h-6 text-amber-700 drop-shadow-sm" />
                            ) : (
                              <Sparkles className="w-5 h-5 text-yellow-700 drop-shadow-sm" />
                            )}
                            <span className="text-[11px] md:text-[13px] font-bold uppercase tracking-tight text-zinc-900 text-center max-w-[60px] md:max-w-[70px] leading-tight line-clamp-2 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                              {prizes.length > 0
                                ? prize.prize_name
                                : i % 2 === 0
                                  ? "Gift"
                                  : "Prize"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}

                {/* Center Pivot */}
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-zinc-900 shadow-2xl z-20 flex items-center justify-center border-4 border-amber-400">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-amber-500 to-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse"></div>
                </div>
              </div>

              {/* Top Indicator / Needle */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 z-30 flex items-center justify-center drop-shadow-2xl">
                <div className="w-0 h-0 border-l-16 border-l-transparent border-r-16 border-r-transparent border-t-24 border-t-zinc-900 drop-shadow-lg"></div>
              </div>
            </div>

            {/* Action Area */}
            {!hasSpun ? (
              <div className="text-center space-y-6 w-full max-w-md px-4">
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 uppercase tracking-tight">
                    Ready to Win?
                  </h3>
                  <p className="text-sm font-semibold text-zinc-600 leading-relaxed uppercase tracking-wide">
                    Every spin is a guaranteed prize!
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="w-full h-16 rounded-2xl text-lg font-bold uppercase tracking-wide bg-linear-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white shadow-xl shadow-zinc-900/30 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 group relative overflow-hidden disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isSpinning ? (
                      <span className="relative flex items-center justify-center gap-3">
                        <RotateCw className="w-6 h-6 animate-spin" />
                        Spinning...
                      </span>
                    ) : (
                      <span className="relative flex items-center justify-center gap-3">
                        Spin the Wheel
                        <Sparkles className="w-6 h-6 text-yellow-400 group-hover:scale-125 group-hover:rotate-12 transition-transform" />
                      </span>
                    )}
                  </Button>

                  {/* Skip button for error fallback */}
                  <button
                    onClick={() => {
                      toast.info(
                        "Skipping lucky draw. Redirecting back to start...",
                      );
                      nextStep("skip");
                    }}
                    disabled={isSpinning}
                    className="text-xs text-zinc-400 hover:text-zinc-600 font-semibold uppercase tracking-wide transition-colors disabled:opacity-30"
                  >
                    Skip Lucky Draw →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 w-full max-w-md px-4">
                {/* Success Icon */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-zinc-900 uppercase">
                    You Won!
                  </h3>
                </div>

                {/* Prize Card */}
                <div className="w-full py-5 px-5 rounded-2xl bg-zinc-900 text-white shadow-lg">
                  <div className="space-y-2.5">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 inline-flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                        Official Prize
                      </span>
                    </div>

                    <p className="text-2xl font-bold uppercase">
                      {result?.prize?.prize_name || "Special Reward"}
                    </p>

                    {result?.prize?.prize_description && (
                      <p className="text-sm font-semibold text-zinc-300 leading-relaxed mt-2">
                        {result.prize.prize_description}
                      </p>
                    )}

                    <div className="pt-3">
                      <p className="text-xs text-zinc-400">
                        Your reward details have been sent to your WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Status */}
                {result?.whatsapp_status === "failed" ||
                result?.whatsapp_error ||
                result?.error === "whatsapp_credit_low" ||
                result?.whatsapp_notification?.credits_insufficient ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                      {result?.whatsapp_notification?.credits_insufficient
                        ? `WhatsApp Error (${result?.whatsapp_notification?.available_credits ?? 0} credits left)`
                        : "WhatsApp Delivery Failed"}
                    </span>
                  </div>
                ) : null}

                {/* Instructions */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                  {result?.whatsapp_status === "failed" ||
                  result?.whatsapp_error ||
                  result?.error === "whatsapp_credit_low" ||
                  result?.whatsapp_notification?.credits_insufficient ? (
                    <p className="text-xs font-semibold text-red-600 leading-relaxed">
                      We couldn&apos;t send to WhatsApp. Please screenshot this
                      screen to claim your reward.
                    </p>
                  ) : (
                    <p className="text-xs font-medium text-zinc-600 leading-relaxed">
                      Reward sent to{" "}
                      <span className="text-zinc-900 font-bold">
                        {formValues?.phone || "your number"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <div className="pt-2">
                  <Button
                    onClick={nextStep}
                    className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all active:scale-95"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Claim My Reward
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 text-center">
            <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Secured by QR Tenants • All data encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
