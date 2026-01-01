"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  MapPin,
  Gift,
  CheckCircle2,
  Share2,
  Smartphone,
  Calendar,
  User,
  ArrowRight,
  Loader2,
  Trophy,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// --- Mock Data ---
const PRESET_REVIEWS = [
  "Delicious food and great service! ⭐",
  "Loved the atmosphere! 🍷",
  "Staff was super friendly and helpful. 😊",
  "Hidden gem! Highly recommend. 💎",
  "Best experience I've had in a while! 🚀",
  "Quality products and fast delivery. 📦",
  "Will definitely come back again! 🔄",
  "Great value for money. 💰",
  "Professional and attentive service. 👔",
  "Simply amazing! 😍",
];

const PLATFORMS = [
  {
    id: "google",
    name: "Google Reviews",
    icon: "G",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "I",
    color: "bg-pink-600 hover:bg-pink-700",
  },
  {
    id: "red",
    name: "XiaoHongShu",
    icon: "RED",
    color: "bg-red-500 hover:bg-red-600",
  },
];

const PRIZES = [
  { id: 1, name: "10% OFF", probability: 0.4 },
  { id: 2, name: "Free Drink", probability: 0.3 },
  { id: 3, name: "Buy 1 Get 1", probability: 0.2 },
  { id: 4, name: "Mystery Gift", probability: 0.1 },
];

// --- Main Component ---

export function CustomerReviewFlow() {
  const [step, setStep] = useState(1); // 1: Identity, 2: Review, 3: Redirect, 4: Lucky/Reward
  const [loading, setLoading] = useState(false);

  // Data State
  const [customer, setCustomer] = useState({ name: "", phone: "", dob: "" });
  const [review, setReview] = useState({ rating: 5, text: "", platform: null });
  const [reward, setReward] = useState(null);

  // Configuration (Mock)
  const [merchantConfig] = useState({
    name: "The Gourmet Bistro",
    logo: "/placeholder-logo.png",
    rewardType: "lucky_draw", // options: "none", "coupon", "lucky_draw"
    address: "123 Foodie Lane, Flavor Town",
    mapLink: "https://maps.google.com",
  });

  const nextStep = () => setStep((s) => s + 1);

  // --- Sub-Components (Inline for comprehensive file) ---

  const IdentityForm = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!customer.name || !customer.phone || !customer.dob) {
        toast.error("Please fill in all details");
        return;
      }
      // Simple validation mock
      if (customer.phone.length < 8) {
        toast.error("Please enter a valid phone number");
        return;
      }
      nextStep();
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome!</h2>
          <p className="text-muted-foreground">
            Please tell us about yourself to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 890"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="dob"
                type="date"
                value={customer.dob}
                onChange={(e) =>
                  setCustomer({ ...customer, dob: e.target.value })
                }
                className="pl-10 h-12 text-lg block w-full"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-medium mt-6 bg-linear-to-r from-primary to-primary-hover hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            Continue <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>
      </div>
    );
  };

  const ReviewForm = () => {
    const handlePresetClick = (text) => {
      setReview({ ...review, text });
    };

    const handlePlatformSelect = async (platformId) => {
      setReview({ ...review, platform: platformId });
      setLoading(true);

      // Simulate API call to register intent
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoading(false);

      // In reality, this would open a new tab to the review URL
      // window.open(platform.url, '_blank');

      nextStep(); // Move to redirect/verification step
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Rate Your Experience
          </h2>
          <p className="text-muted-foreground">
            How was your visit to {merchantConfig.name}?
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex justify-center space-x-2 py-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setReview({ ...review, rating: star })}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "w-10 h-10 transition-colors",
                  star <= review.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>

        {/* Preset Sentences */}
        <div className="space-y-3">
          <Label>Quick Review (Select one)</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_REVIEWS.map((text, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePresetClick(text)}
                className={cn(
                  "px-3 py-2 rounded-full text-sm border transition-all text-left",
                  review.text === text
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-background hover:bg-muted"
                )}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Text */}
        <div className="space-y-2">
          <Label>Or write your own</Label>
          <Textarea
            placeholder="Tell us more..."
            value={review.text}
            onChange={(e) => setReview({ ...review, text: e.target.value })}
            className="resize-none"
            rows={3}
          />
        </div>

        {/* Platform Select */}
        <div className="pt-4 space-y-3">
          <p className="font-medium text-center">
            Post to receive your reward:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PLATFORMS.map((platform) => (
              <Button
                key={platform.id}
                variant="outline"
                className={cn(
                  "h-12 relative overflow-hidden group border-2",
                  review.platform === platform.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
                onClick={() => handlePlatformSelect(platform.id)}
                disabled={loading}
              >
                <span
                  className={cn(
                    "mr-2 font-bold",
                    platform.id === "google"
                      ? "text-blue-500"
                      : platform.id === "facebook"
                      ? "text-blue-600"
                      : platform.id === "instagram"
                      ? "text-pink-600"
                      : "text-red-500"
                  )}
                >
                  {platform.icon}
                </span>
                {platform.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const RedirectWait = () => {
    useEffect(() => {
      // Simulate user returning from review
      const timer = setTimeout(() => {
        nextStep();
      }, 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Checking your review...</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your submission.
          </p>
        </div>
      </div>
    );
  };

  const LuckyDraw = () => {
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
        setTimeout(() => nextStep(), 1500);
      }, 3000);
    };

    if (result) {
      return (
        <div className="text-center space-y-6 py-10 animate-in zoom-in duration-500">
          <div className="mb-6 relative">
            <Trophy className="w-24 h-24 mx-auto text-yellow-500 animate-bounce" />
            <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
          </div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-500 to-orange-500">
            YOU WON!
          </h2>
          <p className="text-2xl font-bold text-foreground">{result.name}</p>
        </div>
      );
    }

    return (
      <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600">
            Lucky Draw
          </h2>
          <p className="text-muted-foreground">
            Spin the wheel to win a prize!
          </p>
        </div>

        <div className="relative w-64 h-64 mx-auto my-8">
          {/* Simple CSS Wheel Visualization */}
          <div
            className={cn(
              "w-full h-full rounded-full border-8 border-primary/20 relative overflow-hidden transition-transform duration-3000 ease-out",
              spinning && "rotate-1080"
            )}
            style={{
              background:
                "conic-gradient(from 0deg, #ff8b8b 0deg 90deg, #8ba8ff 90deg 180deg, #8bffc5 180deg 270deg, #fff78b 270deg 360deg)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white shadow-lg z-10"></div>
            </div>
          </div>
          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20">
            <div className="w-0 h-0 border-l-10 border-l-transparent border-t-20 border-t-primary border-r-10 border-r-transparent"></div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleSpin}
          disabled={spinning}
          className="w-full h-14 text-xl font-bold bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-xl"
        >
          {spinning ? "Spinning..." : "SPIN NOW!"}
        </Button>
      </div>
    );
  };

  const RewardSuccess = () => {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-green-700">
              Sent to WhatsApp!
            </h2>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <MessageSquare className="w-3 h-3 mr-1" /> Check your phone
            </Badge>
          </div>
          <p className="text-muted-foreground px-4">
            We have sent your <b>{reward?.name || "Discount Code"}</b> directly
            to:
            <span className="font-semibold block text-foreground mt-1 text-lg">
              {customer.phone}
            </span>
          </p>
        </div>

        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            <Gift className="w-12 h-12 text-primary" />
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Your Reward
              </p>
              <h3 className="text-2xl font-bold text-primary">
                {reward?.name || "Special Offer"}
              </h3>
            </div>
            <div className="w-full h-px bg-border"></div>
            <div className="flex items-center gap-3 text-sm text-left text-muted-foreground w-full bg-white p-3 rounded border">
              <QrCode className="w-8 h-8 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  Strictly No Copying
                </p>
                <p className="text-xs">
                  Your unique redemption QR code is waiting in your WhatsApp
                  chat.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted p-4 rounded-lg flex items-start gap-3 text-sm">
          <div className="mt-0.5">ℹ️</div>
          <p>
            Simply show the WhatsApp message to our staff to redeem your reward.
            No need to copy codes!
          </p>
        </div>
      </div>
    );
  };

  const ThankYou = () => {
    return (
      <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-blue-900">
            Thanks for Reviewing!
          </h2>
          <p className="text-muted-foreground">
            Your feedback helps us serve you better. We hope to see you again
            soon at <b>{merchantConfig.name}</b>.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Submit Another Review
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-zinc-950 p-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-card/95">
        {/* Header Image / Branding */}
        <div className="h-32 bg-linear-to-r from-primary/80 to-purple-600/80 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="z-10 text-center text-white p-4">
            <h1 className="text-2xl font-bold drop-shadow-md">
              {merchantConfig.name}
            </h1>
            <p className="text-sm opacity-90">{merchantConfig.address}</p>
          </div>
        </div>

        <CardContent className="p-6">
          {step === 1 && <IdentityForm />}
          {step === 2 && <ReviewForm />}
          {step === 3 && <RedirectWait />}
          {step === 4 &&
            (merchantConfig.rewardType === "lucky_draw" ? (
              <LuckyDraw />
            ) : merchantConfig.rewardType === "coupon" ? (
              <RewardSuccess />
            ) : (
              <ThankYou />
            ))}
          {step === 5 && <RewardSuccess />}
        </CardContent>

        <CardFooter className="bg-muted/30 p-4 text-center justify-center">
          <p className="text-xs text-muted-foreground">Powered by QR Tenants</p>
        </CardFooter>
      </Card>
    </div>
  );
}
