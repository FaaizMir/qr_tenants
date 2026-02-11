"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Shield,
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
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      sub: "Securing your data...",
    },
    {
      label: "Verifying Redirect",
      icon: ShieldCheck,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
      sub: "Linking your review platform...",
    },
    {
      label: "Almost Ready!",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
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
          // Silent retry
          setTimeout(() => {
            try {
              nextStep();
            } catch (retryError) {
              // Ignore failure
            }
          }, 1000);
        }
      }, 4500);
    } catch (error) {
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
    <div className=" w-full flex items-center justify-center p-4 md:p-6 bg-linear-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-0 items-center">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center p-12 xl:p-16 bg-linear-to-br from-primary via-primary/95 to-primary/80  h-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Processing...
                <br />
                <span className="text-5xl md:text-6xl bg-clip-text text-transparent bg-linear-to-r from-white via-primary-100 to-white animate-shimmer bg-size-[200%_100%]">
                  Please Wait
                </span>
              </h1>

              <div className="flex items-center justify-center gap-2 text-white/80">
                <MapPin className="w-5 h-5" />
                <p className="text-base font-medium">
                  {merchantConfig?.name || "Securing your visit"}
                </p>
              </div>

              <p className="text-base text-white/90 font-medium max-w-sm leading-relaxed mx-auto pt-2">
                We&apos;re finalizing your feedback and preparing your rewards.
                This only takes a few moments.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Progress Content */}
        <div className="bg-white/95 backdrop-blur-3xl p-8 md:p-12 lg:p-14 border border-slate-200/50 h-full flex flex-col relative overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-4 border border-blue-100">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-zinc-900">Finalizing...</h2>
          </div>

          <div className="space-y-12 flex-1 flex flex-col justify-center">
            {/* Status Section */}
            <div className="flex flex-col items-center space-y-8">
              <div
                className={cn(
                  "relative w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 border",
                  statuses[statusIndex].bgColor,
                  statuses[statusIndex].borderColor,
                )}
              >
                <CurrentIcon
                  className={cn(
                    "w-10 h-10 transition-all duration-500",
                    statuses[statusIndex].color,
                  )}
                />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight">
                  {statuses[statusIndex].label}
                </h3>
                <p className="text-sm font-medium text-zinc-500">
                  {statuses[statusIndex].sub}
                </p>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full max-w-md mx-auto space-y-4">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-300 ease-linear shadow-sm"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Secure Data Encryption Active
                </p>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="mt-8 p-4 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
            <p className="text-xs text-zinc-500 italic leading-relaxed">
              &quot;Please do not close this window while we prepare your reward
              details.&quot;
            </p>
          </div>

          <div className="mt-auto pt-8 border-t border-slate-200/50 text-center">
            <p className="text-xs text-zinc-400 font-medium flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Secure Channel • Powered by QR Tenants
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
