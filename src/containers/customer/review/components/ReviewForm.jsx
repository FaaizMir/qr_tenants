import React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import StarRatingInput from "@/components/form-fields/star-rating-input";
import { TextareaField } from "@/components/form-fields/textarea-field";

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

export const ReviewForm = ({
  merchantConfig,
  setValue,
  formValues,
  register,
  nextStep,
  loading,
  setLoading,
}) => {
  const handlePresetClick = (text) => {
    setValue("text", text);
  };

  const handlePlatformSelect = async (platformId) => {
    setValue("platform", platformId);
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
        <StarRatingInput
          label=""
          name="rating"
          register={register}
          setValue={setValue}
          value={formValues.rating}
        />
      </div>

      {/* Preset Sentences */}
      <div className="space-y-3 flex flex-col justify-center items-center">
        <Label>Quick Review (Select one)</Label>
        <div className="flex flex-wrap gap-2 justify-center items-center">
          {PRESET_REVIEWS.map((text, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePresetClick(text)}
              className={cn(
                "px-3 py-2 rounded-full text-sm border transition-all text-left",
                formValues.text === text
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
        <TextareaField
          label="Or write your own"
          name="text"
          placeholder="Tell us more..."
          register={register}
          errors={{}} // Pass errors if needed
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Platform Select */}
      <div className="pt-4 space-y-3">
        <p className="font-medium text-center">Post to receive your reward:</p>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => (
            <Button
              key={platform.id}
              variant="outline"
              className={cn(
                "h-12 relative overflow-hidden group border-2",
                formValues.platform === platform.id
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
