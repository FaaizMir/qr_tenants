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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  RotateCw,
  Calendar,
  Save,
  Loader2,
  Sparkles,
  Gift,
  ArrowRightLeft,
  UserCheck,
} from "lucide-react";
import BatchSelector from "./BatchSelector";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export default function InactiveRecallSettings() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [state, setState] = useState({
    enabled: false,
    days: 30,
    batchId: null,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!merchantId) return;
    try {
      const res = await axiosInstance.get(
        `/merchant-settings/merchant/${merchantId}`,
      );
      const data = res?.data?.data;
      if (data) {
        setState({
          enabled: data.inactive_recall_enabled ?? false,
          days: data.inactive_recall_days ?? 30,
          batchId: data.inactive_recall_coupon_batch_id || null,
        });
      }
    } catch (error) {
      console.error("Failed to load inactive recall settings:", error);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(
    async (isGlobal = false) => {
      if (!merchantId) return;
      if (state.enabled && !state.batchId) {
        if (!isGlobal) {
          toast.error("Action Required: Inactive Recall", {
            description:
              "Please select an incentive coupon to win back inactive customers.",
          });
        }
        return;
      }
      if (!isGlobal) setSaving(true);
      try {
        const payload = {
          merchant_id: merchantId,
          inactive_recall_enabled: state.enabled,
          inactive_recall_days: Number(state.days),
          inactive_recall_coupon_batch_id: state.enabled ? state.batchId : null,
        };
        await axiosInstance.patch(
          `/merchant-settings/merchant/${merchantId}`,
          payload,
        );
        if (!isGlobal) {
          toast.success("Inactive Recall Updated", {
            description: "Your win-back automation settings have been saved.",
          });
        }
      } catch (error) {
        console.error("Failed to save inactive recall settings:", error);
        if (!isGlobal) {
          toast.error("Save Failed", {
            description: "Could not update recall settings. Please try again.",
          });
        }
        throw error;
      } finally {
        if (!isGlobal) setSaving(false);
      }
    },
    [merchantId, state],
  );

  useEffect(() => {
    const onSettingsUpdate = (e) => {
      if (e.detail?.inactive_recall_enabled !== undefined) {
        setState((p) => ({ ...p, enabled: e.detail.inactive_recall_enabled }));
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
    return () =>
      window.removeEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
  }, []);

  return (
    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:shadow-lg bg-white rounded-3xl overflow-hidden group">
      <div className="p-5 flex items-center justify-between border-b border-border/40 bg-linear-to-br from-blue-50/80 via-white to-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-100/50 text-blue-600 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-500">
            <RotateCw className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-base text-gray-900 tracking-tight">
              Win-Back Club
            </h3>
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3 w-3 text-blue-500 animate-pulse" />
              <p className="text-[11px] text-muted-foreground font-medium">
                Reactivate sleeping customers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,filter] duration-500 ease-in-out ${
          state.enabled
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-40 grayscale-[0.5]"
        }`}
      >
        <div className="overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2.5">
              <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider ml-1">
                Recall After
              </Label>
              <div className="relative group/input">
                <Input
                  type="number"
                  value={state.days}
                  onChange={(e) =>
                    setState((p) => ({
                      ...p,
                      days: e.target.value,
                    }))
                  }
                  placeholder="30"
                  className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600/50 transition-all pl-11 pr-32 font-medium text-gray-900 rounded-xl"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/40 transition-colors group-focus-within/input:text-blue-600" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium pointer-events-none uppercase">
                  Days of inactivity
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Incentive Reward
                </Label>
                {state.batchId && (
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                    <Gift className="h-2.5 w-2.5" /> Selected
                  </span>
                )}
              </div>
              <BatchSelector
                selectedId={state.batchId}
                merchantId={merchantId}
                isOpen={dropdownOpen}
                setIsOpen={setDropdownOpen}
                onSelect={(id) => setState((p) => ({ ...p, batchId: id }))}
                placeholder="Choose recall reward..."
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground text-center mt-2 italic px-4">
                Customers who haven&apos;t visited in a while will get this
                treat.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all h-11 px-6 text-xs font-semibold rounded-xl w-full flex items-center justify-center gap-2 group/btn"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    <span>Save Win-Back Settings</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
      {!state.enabled && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
          <p className="text-[11px] text-gray-400 font-medium italic">
            Enable Win-Back Club to reactivate lapsed customers
          </p>
        </div>
      )}
    </Card>
  );
}
