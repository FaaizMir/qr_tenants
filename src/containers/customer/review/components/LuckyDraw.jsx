"use client";

import React, { useState } from "react";
import { Trophy, ArrowLeft } from "lucide-react";
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
          {!spinning && !result && (
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
          )}
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Trophy
              className={cn("w-8 h-8 text-primary", result && "animate-bounce")}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {result ? "CONGRATULATIONS!" : "Lucky Draw"}
          </CardTitle>
          <CardDescription className="text-sm">
            {result
              ? "You've won a special prize!"
              : "Spin the wheel to win an exclusive reward!"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pb-10">
          {!result ? (
            <>
              <div className="relative w-48 h-48 mx-auto">
                <div
                  className={cn(
                    "w-full h-full rounded-full border-4 border-muted/40 relative overflow-hidden transition-transform duration-[3s] ease-out shadow-inner",
                    spinning && "rotate-1080"
                  )}
                  style={{
                    background:
                      "conic-gradient(from 0deg, #fef3c7 0deg 90deg, #dcfce7 90deg 180deg, #dbeafe 180deg 270deg, #f3e8ff 270deg 360deg)",
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white shadow-md z-10 border-2 border-primary/20"></div>
                  </div>
                  <div className="absolute inset-0 border-r border-muted/20 rotate-45"></div>
                  <div className="absolute inset-0 border-r border-muted/20 rotate-135"></div>
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-6 z-20">
                  <div className="w-0 h-0 border-l-10 border-l-transparent border-t-16 border-t-primary border-r-10 border-r-transparent shadow-sm"></div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleSpin}
                disabled={spinning}
                className="w-full h-12 text-base font-bold shadow-md transition-all active:scale-95 mt-4 bg-blue-700 hover:bg-blue-800"
              >
                {spinning ? "SPINNING..." : "TAP TO SPIN!"}
              </Button>
            </>
          ) : (
            <div className="py-6 animate-in zoom-in duration-500">
              <div className="bg-primary/5 rounded-2xl p-8 border-2 border-dashed border-primary/30 inline-block w-full">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">
                  You Won
                </p>
                <h3 className="text-4xl font-black text-primary tracking-tight">
                  {result.name}
                </h3>
              </div>
              <p className="mt-6 text-muted-foreground text-[10px] font-bold uppercase tracking-tighter animate-pulse">
                Processing reward...
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer branding */}
        <div className="bg-muted/30 py-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest border-t">
          Powered by QR Tenants
        </div>
      </Card>
    </div>
  );
};
