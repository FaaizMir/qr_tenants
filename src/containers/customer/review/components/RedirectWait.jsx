"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

export const RedirectWait = ({ nextStep, prevStep, merchantConfig }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const statuses = [
    {
      label: "Submitting Feedback",
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      sub: "Securing your data...",
    },
    {
      label: "Verifying Redirect",
      icon: ShieldCheck,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      sub: "Linking your review platform...",
    },
    {
      label: "Almost Ready!",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      sub: "Preparing your reward...",
    },
  ];

  useEffect(() => {
    let statusTimer, progressTimer, mainTimer;

    try {
      statusTimer = setInterval(() => {
        setStatusIndex((prev) =>
          prev < statuses.length - 1 ? prev + 1 : prev,
        );
      }, 1500);

      progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 2 : 100));
      }, 90);

      mainTimer = setTimeout(() => {
        try {
          nextStep();
        } catch (error) {
          console.error("Error advancing to next step:", error);
          toast.error("Navigation error. Please wait...");
          // Retry after 1 second
          setTimeout(() => {
            try {
              nextStep();
            } catch (retryError) {
              console.error("Retry failed:", retryError);
              toast.error("Please refresh the page if stuck.");
            }
          }, 1000);
        }
      }, 4500);
    } catch (error) {
      console.error("RedirectWait initialization error:", error);
      toast.error("Loading error. Proceeding...");
      setTimeout(() => nextStep(), 1000);
    }

    return () => {
      clearInterval(statusTimer);
      clearInterval(progressTimer);
      clearTimeout(mainTimer);
    };
  }, [nextStep, statuses.length]);

  const CurrentIcon = statuses[statusIndex].icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-slate-50 animate-in fade-in duration-700">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 animate-in slide-in-from-top duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-600 mb-6 shadow-2xl shadow-blue-500/30 relative">
            <div className="absolute inset-0 rounded-3xl bg-white/20 animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 animate-shimmer bg-size-[200%_100%]">
              Processing...
            </span>
          </h1>

          <p className="text-lg text-zinc-600 font-medium max-w-md mx-auto">
            {merchantConfig?.name || "We're"} finalizing your feedback
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-zinc-500">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>{merchantConfig?.address || "Store Location"}</span>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-slate-200/50 shadow-2xl mb-8 animate-in slide-in-from-bottom duration-700 delay-200">
          {/* Animated Status Icon */}
          <div className="flex flex-col items-center space-y-6">
            <div
              className={cn(
                "relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
                statuses[statusIndex].bgColor,
                `border-4 ${statuses[statusIndex].borderColor}`,
              )}
            >
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>

              {/* Status Icon */}
              <CurrentIcon
                className={cn(
                  "w-14 h-14 transition-all duration-500",
                  statuses[statusIndex].color,
                )}
              />

              {/* Pulsing rings */}
              <div className="absolute -inset-4 rounded-full border-2 border-blue-500/20 animate-ping opacity-20"></div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">
                {statuses[statusIndex].label}
              </h3>
              <p className="text-sm font-medium text-zinc-500">
                {statuses[statusIndex].sub}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-3">
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  System Encryption Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg text-center animate-in slide-in-from-bottom duration-700 delay-300">
          <p className="text-sm text-zinc-600 font-medium leading-relaxed italic">
            &quot;We are finalizing your feedback and preparing your reward
            tokens. Please do not close this window.&quot;
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Secure Redirection Active • Powered by QR Tenants
          </p>
        </div>
      </div>
    </div>
  );
};
