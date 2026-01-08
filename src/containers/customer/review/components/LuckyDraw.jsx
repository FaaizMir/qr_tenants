"use client";

import React, { useState } from "react";
import { Trophy, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PRIZES = [
  { id: 1, name: "10% OFF", probability: 0.4 },
  { id: 2, name: "Free Drink", probability: 0.3 },
  { id: 3, name: "Buy 1 Get 1", probability: 0.2 },
  { id: 4, name: "Mystery Gift", probability: 0.1 },
];

export const LuckyDraw = ({
  nextStep,
  prevStep,
  setReward,
  merchantConfig,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  const handleSpin = () => {
    setSpinning(true);
    // Simulate spin delay
    setTimeout(() => {
      const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
      setResult(prize);
      setSpinning(false);
      setReward(prize);
      // Delay to show success
      setTimeout(() => nextStep(), 2000);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-2 md:p-4">
      <Card className="w-full border-white/20 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden rounded-4xl text-center">
        {/* Merchant Branding Banner */}
        <div className="relative h-32 md:h-44 overflow-hidden bg-linear-to-br from-zinc-950 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.3),rgba(16,185,129,0))]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl scale-150"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl scale-150"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            {merchantConfig?.logo && (
              <div className="mb-3 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 overflow-hidden shadow-2xl">
                <img
                  src={merchantConfig.logo}
                  alt="Merchant Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {merchantConfig?.name && merchantConfig.name !== "Loading..."
                ? merchantConfig.name
                : "Win Special Rewards"}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {merchantConfig?.address || "Premium Location"}
            </div>
          </div>
        </div>

        <CardHeader className="pb-8 pt-12 relative px-6 md:px-10">
          {!spinning && !result && (
            <div className="absolute top-4 left-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-bold text-[10px] uppercase tracking-wider gap-1.5 transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            </div>
          )}

          <div className="mx-auto w-20 h-20 rounded-3xl bg-linear-to-br from-primary/5 to-primary/20 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
            <Trophy
              className={cn(
                "w-10 h-10 text-primary transition-all duration-700",
                result ? "scale-125 rotate-0" : "animate-pulse"
              )}
            />
          </div>

          <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic">
            {result ? "VICTORY IS YOURS!" : "LUCKY DRAW"}
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto mt-2 leading-tight">
            {result
              ? "A special reward has been unlocked for you."
              : "Spin the master wheel to reveal your exclusive merchant reward."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10 pb-12 px-6 md:px-10">
          {!result ? (
            <div className="flex flex-col items-center gap-10">
              <div className="relative group">
                {/* Decorative Outer Ring */}
                <div className="absolute -inset-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-full animate-spin-slow"></div>

                <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto p-4 bg-white dark:bg-zinc-800 rounded-full shadow-2xl border-8 border-zinc-50 dark:border-zinc-900 overflow-hidden">
                  <div
                    className={cn(
                      "w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4s] cubic-bezier(0.15, 0, 0.15, 1) shadow-inner border-4 border-zinc-100 dark:border-zinc-700",
                      spinning && "rotate-1440"
                    )}
                    style={{
                      background:
                        "conic-gradient(from 0deg, #3b82f6 0deg 90deg, #8b5cf6 90deg 180deg, #ec4899 180deg 270deg, #f59e0b 270deg 360deg)",
                    }}
                  >
                    {/* Inner Spokes/Lines */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <div className="h-full w-px bg-white/50 rotate-0"></div>
                      <div className="h-full w-px bg-white/50 rotate-45"></div>
                      <div className="h-full w-px bg-white/50 rotate-90"></div>
                      <div className="h-full w-px bg-white/50 rotate-135"></div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white dark:bg-zinc-900 shadow-2xl z-20 border-4 border-zinc-50 dark:border-zinc-800 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                      </div>
                    </div>
                  </div>

                  {/* Indicator Triangle */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-8 z-30 drop-shadow-lg">
                    <div className="w-0 h-0 border-l-12 border-l-transparent border-t-20 border-t-zinc-900 dark:border-t-white border-r-12 border-r-transparent"></div>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleSpin}
                disabled={spinning}
                className="w-full h-15 rounded-2xl text-lg font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-12px_rgba(59,130,246,0.3)] hover:shadow-[0_24px_48px_-12px_rgba(59,130,246,0.4)] transition-all active:scale-[0.98] bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-none animate-in fade-in zoom-in duration-500 delay-300 group"
              >
                {spinning ? (
                  <div className="flex items-center gap-3">
                    <span className="animate-pulse">SPINNING...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    TAP TO SPIN!
                    <Trophy className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </div>
                )}
              </Button>
            </div>
          ) : (
            <div className="py-8 animate-in zoom-in-95 fade-in duration-1000 cubic-bezier(0.15, 0, 0.15, 1)">
              <div className="relative group p-1">
                <div className="absolute -inset-2 bg-linear-to-r from-primary via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white dark:bg-zinc-900 rounded-4xl p-10 border-2 border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 bg-primary rounded-full -mr-8 -mt-8 w-32 h-32 scale-150"></div>

                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-6 relative">
                    Your Exclusive Reward
                  </p>
                  <h3 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter mb-4 italic">
                    {result.name}
                  </h3>
                  <div className="h-1.5 w-16 bg-linear-to-r from-primary to-purple-500 mx-auto rounded-full mb-8"></div>

                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                    Generating your digital voucher...
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer branding */}
        <div className="bg-zinc-50 dark:bg-zinc-800/20 py-5 text-center border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-700"></div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
              Powered by QR Tenants
            </p>
            <div className="h-px w-8 bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};
