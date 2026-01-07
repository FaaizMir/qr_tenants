"use client";

import React from "react";
import { Heart, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export const ThankYou = ({ resetFlow, merchantConfig, prevStep }) => {
  return (
    <div className="w-full">
      <Card className="w-full border-muted/60 shadow-lg text-center overflow-hidden">
        {/* Merchant Branding Banner */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 py-8 px-4 text-center text-white">
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            {merchantConfig.name}
          </h2>
          <p className="text-xs opacity-90">{merchantConfig.address}</p>
        </div>

        <CardHeader className="pb-4 pt-10 relative">
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors pr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Back
              </span>
            </Button>
          </div>
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Thank You!
          </CardTitle>
          <CardDescription className="text-sm">
            We hope to see you again soon at {merchantConfig.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-12">
          <div className="bg-muted/30 p-6 rounded-2xl border border-muted/60">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your feedback helps us grow and provide better service to all our
              customers. We truly appreciate your time!
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={resetFlow}
              className="w-full h-12 text-base font-bold shadow-md transition-all active:scale-95 bg-blue-700 hover:bg-blue-800"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Submit Another Review
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
            QR Tenants Platform
          </p>
        </CardContent>

        {/* Footer branding */}
        <div className="bg-muted/30 py-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest border-t">
          Powered by QR Tenants
        </div>
      </Card>
    </div>
  );
};
