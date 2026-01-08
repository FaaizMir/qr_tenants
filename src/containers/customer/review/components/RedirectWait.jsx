"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Zap,
  SquareCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const RedirectWait = ({ nextStep, prevStep, merchantConfig }) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    {
      label: "Submitting Feedback",
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      sub: "Securing your data...",
    },
    {
      label: "Verifying Redirect",
      icon: <ShieldCheck className="w-8 h-8 text-amber-500" />,
      sub: "Linking your review platform...",
    },
    {
      label: "Almost Ready!",
      icon: <SquareCheck className="w-8 h-8 text-green-500" />,
      sub: "Preparing your reward...",
    },
  ];

  useEffect(() => {
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 1500);

    const mainTimer = setTimeout(() => {
      nextStep();
    }, 4500);

    return () => {
      clearInterval(statusTimer);
      clearTimeout(mainTimer);
    };
  }, [nextStep, statuses.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto p-2 md:p-4">
      <Card className="w-full border-white/20 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden rounded-[2rem] text-center">
        {/* Merchant Branding Banner */}
        <div className="relative h-32 md:h-44 overflow-hidden bg-linear-to-br from-zinc-950 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.3),rgba(16,185,129,0))]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl scale-150"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl scale-150"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white">
            {merchantConfig?.logo && (
              <div className="mb-3 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 overflow-hidden shadow-2xl">
                <img src={merchantConfig.logo} alt="Merchant Logo" className="w-full h-full object-contain" />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {merchantConfig?.name && merchantConfig.name !== "Loading..." ? merchantConfig.name : "System Sync"}
            </h2>
          </div>
        </div>

        <CardHeader className="pb-8 pt-12 relative px-6 md:px-10">
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

          <div className="mx-auto w-24 h-24 rounded-full bg-linear-to-br from-emerald-500/5 to-emerald-500/20 flex items-center justify-center mb-8 relative group">
            <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-emerald-500/30 animate-spin-slow"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin group-hover:duration-500"></div>
            <div className="relative z-10 transition-all duration-700 transform scale-125 group-hover:rotate-12">
              {statusIndex === 0 && <Zap className="w-8 h-8 text-emerald-500" />}
              {statusIndex === 1 && <ShieldCheck className="w-8 h-8 text-blue-500" />}
              {statusIndex === 2 && <SquareCheck className="w-8 h-8 text-emerald-400 animate-bounce" />}
            </div>
          </div>

          <CardTitle className="text-2xl md:text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic uppercase">
            {statuses[statusIndex].label}
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto mt-2 leading-tight">
            {statuses[statusIndex].sub}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10 pb-12 px-6 md:px-10">
          <div className="relative px-4">
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner">
              <div
                className="h-full bg-linear-to-r from-emerald-600 via-emerald-400 to-emerald-600 transition-all duration-[4.5s] ease-linear rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          <div className="mx-4 p-6 rounded-3xl bg-zinc-950 dark:bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <p className="relative z-10 text-[11px] text-zinc-400 leading-relaxed font-black uppercase tracking-[0.2em] italic">
              "System encryption active. Ensuring your reward token is generated with 100% integrity."
            </p>
          </div>
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
