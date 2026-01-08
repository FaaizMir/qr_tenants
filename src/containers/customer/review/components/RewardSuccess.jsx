"use client";

import React from "react";
import {
  CheckCircle2,
  MessageSquare,
  Gift,
  QrCode,
  ArrowLeft,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const RewardSuccess = ({
  reward,
  formValues,
  merchantConfig,
  prevStep,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-4xl mx-auto p-2 md:p-4 animate-in fade-in zoom-in-95 duration-700">
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
              {merchantConfig?.name && merchantConfig.name !== "Loading..." ? merchantConfig.name : "Your Reward"}
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

          <div className="mx-auto w-20 h-20 rounded-3xl bg-linear-to-br from-emerald-500/5 to-emerald-500/20 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-inner">
            <Gift className="w-10 h-10 text-emerald-500" />
          </div>

          <CardTitle className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic uppercase">
            CONGRATULATIONS!
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400 font-medium max-w-[280px] mx-auto mt-2 leading-tight">
            You've successfully unlocked an exclusive merchant reward.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-10 pb-12 px-6 md:px-10">
          <div className="relative group max-w-sm mx-auto">
            <div className="absolute -inset-4 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
            <div className="relative bg-zinc-950 dark:bg-zinc-900 dark:border dark:border-zinc-800 rounded-[2rem] p-8 md:p-10 shadow-2xl overflow-hidden border-4 border-zinc-900">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <QrCode className="w-20 h-20 text-white" />
              </div>

              <div className="flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 italic">
                  Voucher Code: <span className="text-white ml-2">#REWARDV2</span>
                </p>

                <h3 className="text-4xl md:text-5xl font-black text-white tracking-widest mb-4 italic uppercase">
                  {reward?.name || "SPECIAL DISCOUNT"}
                </h3>

                <div className="h-1.5 w-12 bg-linear-to-r from-emerald-600 to-teal-500 rounded-full mb-8"></div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Reward
                </div>
              </div>
            </div>
          </div>

          <div className="mx-4 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/10 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-500 italic font-bold">
              Present this screen to the staff or check your email to redeem your benefit.
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
