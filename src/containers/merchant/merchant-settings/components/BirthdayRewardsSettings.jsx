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
  Cake,
  Save,
  Loader2,
  Sparkles,
  Gift,
  CalendarDays,
} from "lucide-react";
import BatchSelector from "./BatchSelector";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export default function BirthdayRewardsSettings() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [state, setState] = useState({
    enabled: false,
    daysBefore: 3,
    daysAfter: 0,
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
          enabled: data.birthday_message_enabled ?? false,
          daysBefore: data.days_before_birthday ?? 3,
          daysAfter: data.days_after_birthday ?? 0,
          batchId: data.birthday_coupon_batch_id || null,
        });
      }
    } catch (error) {
      console.error("Failed to load birthday settings:", error);
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
          toast.error("Action Required: Birthday Club", {
            description:
              "Please select a coupon batch to reward your customers on their birthday.",
          });
        }
        return;
      }
      if (!isGlobal) setSaving(true);
      try {
        const payload = {
          merchant_id: merchantId,
          birthday_message_enabled: state.enabled,
          days_before_birthday: Number(state.daysBefore),
          days_after_birthday: Number(state.daysAfter),
          birthday_coupon_batch_id: state.enabled ? state.batchId : null,
        };
        await axiosInstance.patch(
          `/merchant-settings/merchant/${merchantId}`,
          payload,
        );
        if (!isGlobal) {
          toast.success("Birthday Club Updated", {
            description: "Your birthday automation settings have been saved.",
          });
        }
      } catch (error) {
        console.error("Failed to save birthday settings:", error);
        if (!isGlobal) {
          toast.error("Save Failed", {
            description:
              "Could not update birthday settings. Please try again.",
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
      if (e.detail?.birthday_message_enabled !== undefined) {
        setState((p) => ({ ...p, enabled: e.detail.birthday_message_enabled }));
      }
    };
    window.addEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
    return () =>
      window.removeEventListener("MERCHANT_SETTINGS_UPDATED", onSettingsUpdate);
  }, []);

  return (
    <Card className="border-border/40 shadow-sm transition-all duration-300 hover:shadow-lg bg-white rounded-3xl overflow-hidden group">
      <div className="p-5 flex items-center justify-between border-b border-border/40 bg-linear-to-br from-pink-50/80 via-white to-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-100/50 text-pink-600 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-pink-100 transition-all duration-500">
            <Cake className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-base text-gray-900 tracking-tight">
              Birthday Club
            </h3>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-pink-500 animate-pulse" />
              <p className="text-[11px] text-muted-foreground font-medium">
                Automatic customer treats
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
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider ml-1">
                  Days Before
                </Label>
                <div className="relative group/input">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-medium text-gray-900 rounded-xl pl-10 pr-16"
                    value={state.daysBefore}
                    onChange={(e) =>
                      setState((p) => ({
                        ...p,
                        daysBefore: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400 opacity-50 transition-opacity group-focus-within/input:opacity-100" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium pointer-events-none uppercase">
                    Days
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider ml-1">
                  Days After
                </Label>
                <div className="relative group/input">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500/50 transition-all font-medium text-gray-900 rounded-xl pl-10 pr-16"
                    value={state.daysAfter}
                    onChange={(e) =>
                      setState((p) => ({
                        ...p,
                        daysAfter: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400 opacity-50 transition-opacity group-focus-within/input:opacity-100" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium pointer-events-none uppercase">
                    Days
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Birthday Reward
                </Label>
                {state.batchId && (
                  <span className="text-[10px] text-pink-600 font-semibold bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 flex items-center gap-1">
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
                placeholder="Select a reward batch..."
                className="h-12 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground text-center mt-2 italic px-4">
                Customers will receive a message with this reward on their
                special day.
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
                    <span>Save Birthday Settings</span>
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
            Enable Birthday Club to automate your rewards
          </p>
        </div>
      )}
    </Card>
  );
}
