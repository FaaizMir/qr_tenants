import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Ribbon, Sparkles, Ticket, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import BatchSelector from "./BatchSelector";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export default function RewardStrategySettings() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [luckyDrawEnabled, setLuckyDrawEnabled] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!merchantId) return;
    try {
      const res = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`,
      );
      const data = res?.data?.data;
      if (data) {
        setLuckyDrawEnabled(data.luckydraw_enabled ?? false);
        setSelectedBatchId(data.whatsapp_enabled_for_batch_id || null);
      }
    } catch (error) {
      console.error("Failed to load reward strategy:", error);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(
    async (isGlobal = false) => {
      if (!merchantId) return;

      if (!luckyDrawEnabled && !selectedBatchId) {
        if (!isGlobal) {
          toast.error("Please select a Coupon Batch for Direct Rewards.");
        }
        return;
      }

      if (!isGlobal) setSaving(true);
      try {
        const payload = {
          merchant_id: merchantId,
          luckydraw_enabled: luckyDrawEnabled,
          whatsapp_enabled_for_batch_id: luckyDrawEnabled
            ? null
            : selectedBatchId,
        };
        await axiosInstance.patch(
          `/merchant-settings/merchant/${merchantId}`,
          payload,
        );
        if (!isGlobal) {
          toast.success("Reward Strategy Updated", {
            description: "Your primary reward configuration has been saved.",
          });
        }
      } catch (error) {
        console.error("Failed to save reward strategy:", error);
        if (!isGlobal) {
          toast.error("Save Failed", {
            description: "Could not update reward strategy. Please try again.",
          });
        }
        throw error;
      } finally {
        if (!isGlobal) setSaving(false);
      }
    },
    [merchantId, luckyDrawEnabled, selectedBatchId],
  );

  useEffect(() => {
    const onSettingsUpdate = (e) => {
      if (e.detail?.luckydraw_enabled !== undefined) {
        setLuckyDrawEnabled(e.detail.luckydraw_enabled);
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
    return () =>
      window.removeEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
  }, []);

  return (
    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:shadow-md bg-white rounded-2xl overflow-hidden group">
      <div className="p-4 flex items-center justify-between border-b border-border/40 bg-linear-to-b from-gray-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100/50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Ribbon className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-gray-900 leading-none">
              Incentive Engine
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Primary reward
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <CardContent className="px-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 opacity-90">
            {/* Lucky Draw Option - Now Read Only */}
            <div
              className={`relative p-3 rounded-xl border-2 transition-all cursor-default flex flex-col items-center text-center gap-2 ${luckyDrawEnabled
                ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                : "border-gray-100 grayscale-[0.8]"
                }`}
            >
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${luckyDrawEnabled
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
                  }`}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-xs leading-tight">
                  Lucky Draw
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Gamified Prizes
                </p>
              </div>
              {luckyDrawEnabled && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>

            {/* Direct Coupon Option - Now Read Only */}
            <div
              className={`relative p-3 rounded-xl border-2 transition-all cursor-default flex flex-col items-center text-center gap-2 ${!luckyDrawEnabled
                ? "border-emerald-500 bg-emerald-50/20 shadow-xs"
                : "border-gray-100 grayscale-[0.8]"
                }`}
            >
              <div
                className={`p-2 rounded-lg transition-all duration-300 ${!luckyDrawEnabled
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500"
                  }`}
              >
                <Ticket className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-xs leading-tight">
                  Direct Coupon
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  Instant Access
                </p>
              </div>
              {!luckyDrawEnabled && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
          </div>

          <div className="px-1 text-[9px] text-muted-foreground font-medium flex items-center gap-1.5 opacity-80 bg-gray-50/50 p-2 rounded-lg border border-dashed border-gray-200">
            <span className="text-xs">⚙️</span>
            <span>Selection is managed via <strong>Feature Switchboard</strong></span>
          </div>

          {!luckyDrawEnabled ? (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 ml-1">
                Select Reward
              </Label>
              <BatchSelector
                selectedId={selectedBatchId}
                merchantId={merchantId}
                isOpen={batchDropdownOpen}
                setIsOpen={setBatchDropdownOpen}
                onSelect={(id) => setSelectedBatchId(id)}
                placeholder="Choose regular reward..."
                className="h-9 text-sm"
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] text-emerald-800 bg-emerald-50/80 px-3 py-2 rounded-lg border border-emerald-100 flex items-center gap-2">
                <span className="text-xs">💡</span>
                <span>
                  Configure prizes in the{" "}
                  <Link
                    href="/merchant/lucky-draw"
                    className="font-bold underline hover:text-emerald-950"
                  >
                    Lucky Draw
                  </Link>{" "}
                  tab
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={() => handleSave(false)}
              disabled={saving}
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white shadow-sm hover:shadow-blue-200 transition-all h-8 px-4 text-xs font-semibold rounded-lg w-full"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
              ) : (
                <Save className="h-3 w-3 mr-2" />
              )}
              Save Strategy
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
