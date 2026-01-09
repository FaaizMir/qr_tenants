"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Trophy,
  Gift,
  ArrowRight,
  RotateCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export const LuckyDraw = ({
  merchantConfig,
  nextStep,
  prevStep,
  setReward,
  customerId,
  merchantId,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  const handleSpin = async () => {
    if (isSpinning || hasSpun) return;

    // Validate IDs
    const safeMerchantId = parseInt(merchantId);
    const safeCustomerId = parseInt(customerId);

    if (isNaN(safeMerchantId) || isNaN(safeCustomerId)) {
      console.error("Missing valid IDs for spin:", { merchantId, customerId });
      toast.error("Error: Session data missing. Please try refreshing.");
      return;
    }

    setIsSpinning(true);

    // Smooth spin animation: at least 4 full rotations + random angle
    const extraDegrees = Math.floor(Math.random() * 360);
    const newRotation = rotation + 360 * 5 + extraDegrees;
    setRotation(newRotation);

    try {
      // API call to spin as per requested payload structure
      const response = await axiosInstance.post("/lucky-draw/spin", {
        customer_id: safeCustomerId,
        merchant_id: safeMerchantId,
      });

      const prizeData = response.data?.data;

      // Sync animation with result display
      // The CSS transition is set to 3 seconds in the style
      setTimeout(() => {
        setIsSpinning(false);
        setHasSpun(true);
        setResult(prizeData);
        setReward(prizeData);
        toast.success(response.data?.message || "Success! You won a prize!");
      }, 3000);
    } catch (error) {
      console.error("Lucky Draw Error:", error);
      setIsSpinning(false);

      const errorMsg =
        error.response?.data?.message ||
        "Failed to spin. Please contact staff.";
      toast.error(errorMsg);

      // If they already spun or there's a limit issue, we might want to skip or show current status
      if (
        error.response?.status === 400 &&
        errorMsg.toLowerCase().includes("already")
      ) {
        // If already spun, maybe the backend can provide the prize they won?
        // For now just allow them to continue if they already have a reward
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-2 md:p-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full border-white/20 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden rounded-4xl border-none">
        {/* Decorative Header */}
        <div className="relative h-40 md:h-48 overflow-hidden bg-linear-to-br from-zinc-950 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.3),rgba(16,185,129,0))]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-2xl animate-bounce-slow">
              <Trophy className="w-7 h-7 text-yellow-500" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] italic uppercase">
              LUCKY DRAW
            </h2>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
              Your Feedback Earned You A Spin
            </p>
          </div>
        </div>

        <CardContent className="pb-14 pt-10 flex flex-col items-center gap-12">
          {/* Enhanced Wheel Component */}
          <div className="relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-8 bg-linear-to-r from-primary/30 via-purple-500/20 to-blue-500/30 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse-slow"></div>

            {/* The Wheel */}
            <div
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-10 border-zinc-900 dark:border-zinc-100 shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-3000 cubic-bezier(0.15, 0, 0.15, 1) flex items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-800/50"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Segments Visualization */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{ transform: `rotate(${i * 30}deg)` }}
                >
                  <div
                    className={cn(
                      "absolute top-0 left-1/2 -ml-px w-0.5 h-1/2 origin-bottom opacity-20",
                      i % 2 === 0 ? "bg-primary" : "bg-purple-500"
                    )}
                  ></div>
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-40">
                    {i % 3 === 0 ? (
                      <Gift className="w-5 h-5 text-primary" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>
              ))}

              {/* Center Pivot */}
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-100 shadow-2xl z-20 flex items-center justify-center border-4 border-zinc-800 dark:border-zinc-200">
                <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-pulse"></div>
              </div>
            </div>

            {/* Top Indicator / Needle */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 z-30 flex items-center justify-center drop-shadow-xl">
              <div className="w-0 h-0 border-l-15 border-l-transparent border-r-15 border-r-transparent border-t-25 border-t-zinc-900 dark:border-t-zinc-100 filter drop-shadow-lg"></div>
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

                <div className="flex flex-col items-center gap-1.5 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Sent to WhatsApp
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    Code: {result?.coupon?.coupon_code || "Processing"}
                  </p>
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

        <div className="bg-zinc-50 dark:bg-zinc-800/10 py-6 text-center border-t border-zinc-100 dark:border-zinc-800/50">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">
            Verified Secure • Powered by QR Tenants
          </p>
        </div>
      </Card>
    </div>
  );
};
