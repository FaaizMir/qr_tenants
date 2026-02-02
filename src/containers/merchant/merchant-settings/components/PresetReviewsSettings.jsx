import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquareQuote, Save, Loader2, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";

export default function PresetReviewsSettings() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [presets, setPresets] = useState(Array(10).fill(""));
  const [enablePresetReviews, setEnablePresetReviews] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!merchantId) return;
    try {
      // Fetch the enabled flag
      const settingsRes = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`,
      );
      setEnablePresetReviews(
        settingsRes?.data?.data?.enable_preset_reviews ?? false,
      );

      // Fetch the actual reviews
      const reviewsRes = await axiosInstance.get("/preset-reviews", {
        params: { merchantId },
      });
      const reviews = reviewsRes?.data?.data || [];
      const sorted = reviews
        .filter((r) => r.is_active)
        .sort((a, b) => a.display_order - b.display_order);

      const newPresets = Array(10).fill("");
      sorted.forEach((r, idx) => {
        if (idx < 10) newPresets[idx] = r.review_text;
      });
      setPresets(newPresets);
    } catch (error) {
      console.error("Failed to load preset reviews:", error);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(
    async (isGlobal = false) => {
      if (!merchantId) return;
      if (!isGlobal) setLoading(true);
      try {
        // Save the enabled flag
        await axiosInstance.patch(`/merchant-settings/merchant/${merchantId}`, {
          merchant_id: merchantId,
          enable_preset_reviews: enablePresetReviews,
        });

        // Save the presets
        const payload = {
          reviews: enablePresetReviews
            ? presets
                .map((text, index) => ({
                  id: index + 1,
                  merchant_id: merchantId,
                  reviewText: text.trim(),
                  isActive: true,
                  displayOrder: index + 1,
                }))
                .filter((p) => p.reviewText !== "")
            : [],
        };
        await axiosInstance.patch("/preset-reviews", payload);
        if (!isGlobal) {
          toast.success("Presets Updated", {
            description: "Your quick review options have been saved.",
          });
        }
      } catch (error) {
        console.error("Failed to save preset reviews:", error);
        if (!isGlobal) {
          toast.error("Save Failed", {
            description: "Could not update presets. Please try again.",
          });
        }
        throw error;
      } finally {
        if (!isGlobal) setLoading(false);
      }
    },
    [merchantId, enablePresetReviews, presets],
  );

  useEffect(() => {
    const onSettingsUpdate = (e) => {
      if (e.detail?.enable_preset_reviews !== undefined) {
        setEnablePresetReviews(e.detail.enable_preset_reviews);
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
    return () =>
      window.removeEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
  }, []);

  const handlePresetChange = (index, value) => {
    const newPresets = [...presets];
    newPresets[index] = value;
    setPresets(newPresets);
  };

  return (
    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:shadow-md bg-white rounded-2xl overflow-hidden group">
      <div className="p-4 flex items-center justify-between border-b border-border/40 bg-linear-to-b from-gray-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-100/50 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-gray-900 leading-none">
              Quick Feedback
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Customer presets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${enablePresetReviews ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}
          >
            {enablePresetReviews ? "Active" : "Off"}
          </span>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          enablePresetReviews
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-50 grayscale"
        }`}
      >
        <div className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {presets.map((preset, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-500 group-focus-within:bg-orange-500 group-focus-within:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <Input
                    value={preset}
                    onChange={(e) => handlePresetChange(idx, e.target.value)}
                    className="pl-10 h-8 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-orange-500/50 text-xs font-medium"
                    placeholder="Positive feedback option..."
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={loading}
                size="sm"
                className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-blue-200 transition-all h-8 px-4 text-xs font-semibold rounded-lg w-full"
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <Save className="h-3 w-3 mr-2" />
                )}
                Save Presets
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
