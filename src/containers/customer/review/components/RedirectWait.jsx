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
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full border-muted/60 shadow-2xl text-center overflow-hidden bg-white/80 backdrop-blur-sm">
        {/* Merchant Branding Banner */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 py-6 px-4 text-center text-white relative">
          <h2 className="text-xl font-bold tracking-tight mb-0.5">
            {merchantConfig.name}
          </h2>
          <p className="text-[10px] opacity-80 uppercase tracking-widest">
            {merchantConfig.address}
          </p>
        </div>

        <CardHeader className="pb-4 pt-8 relative">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="h-8 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors px-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Back
              </span>
            </Button>
          </div>

          <div className="mx-auto w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="transition-all duration-500 transform scale-110">
              {statuses[statusIndex].icon}
            </div>
          </div>

          <CardTitle className="text-xl font-bold tracking-tight text-slate-800 transition-all duration-500">
            {statuses[statusIndex].label}
          </CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500 transition-all duration-500">
            {statuses[statusIndex].sub}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-12">
          <div className="relative px-8">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-primary to-purple-500 transition-all duration-[4.5s] ease-linear"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          <div className="mx-8 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
            <p className="text-[11px] text-blue-600 leading-relaxed font-semibold italic">
              Redirect verification ensures your reward is processed
              successfully. Thank you for your patience!
            </p>
          </div>
        </CardContent>

        {/* Footer branding */}
        <div className="bg-slate-50/80 py-4 text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] border-t border-slate-100">
          Experience by QR Tenants
        </div>
      </Card>
    </div>
  );
};
