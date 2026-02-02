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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  CalendarClock,
  Megaphone,
  Users,
  Ticket,
  Save,
  Loader2,
  Sparkles,
  Send,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BatchSelector from "./BatchSelector";
import axiosInstance from "@/lib/axios";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export default function ScheduledCampaignSettings() {
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;

  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState({
    name: "",
    message: "",
    date: "",
    audience: "all",
    sendCoupons: true,
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
        setEnabled(data.scheduled_campaign_enabled ?? false);

        if (data.scheduled_campaign_enabled) {
          try {
            const schedRes = await axiosInstance.get(
              `/scheduled-campaigns?merchant_id=${merchantId}&status=scheduled`,
            );
            const schedData = schedRes?.data?.data?.[0] || schedRes?.data?.[0];
            if (schedData) {
              setState({
                name: schedData.campaign_name || "",
                message: schedData.campaign_message || "",
                date: schedData.scheduled_date
                  ? new Date(schedData.scheduled_date)
                    .toISOString()
                    .slice(0, 16)
                  : "",
                audience: schedData.target_audience || "all",
                sendCoupons: schedData.send_coupons ?? true,
                batchId: schedData.coupon_batch_id || null,
              });
            }
          } catch (campError) {
            console.warn(
              "Could not fetch scheduled campaigns details:",
              campError,
            );
            // 403 is expected if user has no campaigns or strictly forbidden, don't crash the UI
          }
        }
      }
    } catch (error) {
      console.error("Failed to load scheduled campaign settings:", error);
    }
  }, [merchantId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(
    async (isGlobal = false) => {
      if (!merchantId) return;
      if (enabled) {
        if (state.sendCoupons && !state.batchId) {
          if (!isGlobal) {
            toast.error("Action Required: Scheduled Campaign", {
              description:
                "Please select a coupon batch to include in your blast.",
            });
          }
          return;
        }
        if (!state.name || !state.message || !state.date) {
          if (!isGlobal) {
            toast.error("Incomplete Campaign Details", {
              description:
                "Please provide a name, message, and date for your broadcast.",
            });
          }
          return;
        }
      }

      if (!isGlobal) setSaving(true);
      try {
        // 1. Save toggle
        await axiosInstance.patch(`/merchant-settings/merchant/${merchantId}`, {
          merchant_id: merchantId,
          scheduled_campaign_enabled: enabled,
        });

        // 2. Save details
        if (enabled) {
          const payload = {
            merchant_id: merchantId,
            campaign_name: state.name,
            campaign_message: state.message,
            scheduled_date: new Date(state.date).toISOString(),
            target_audience: state.audience,
            send_coupons: state.sendCoupons,
            coupon_batch_id: state.sendCoupons ? state.batchId : null,
          };
          await axiosInstance.post("/scheduled-campaigns", payload);
        }

        if (!isGlobal) {
          toast.success("Campaign Scheduled", {
            description: "Your marketing blast has been queued for delivery.",
          });
        }
      } catch (error) {
        console.error("Failed to save scheduled campaign settings:", error);
        if (!isGlobal) {
          toast.error("Save Failed", {
            description: "Could not schedule campaign. Please try again.",
          });
        }
        throw error;
      } finally {
        if (!isGlobal) setSaving(false);
      }
    },
    [merchantId, enabled, state],
  );

  useEffect(() => {
    const onSettingsUpdate = (e) => {
      if (e.detail?.scheduled_campaign_enabled !== undefined) {
        setEnabled(e.detail.scheduled_campaign_enabled);
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
          <div className="h-10 w-10 rounded-xl bg-orange-100/50 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-gray-900 leading-none">
              Campaigns
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Schedule blasts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${enabled ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}
          >
            {enabled ? "Active" : "Off"}
          </span>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${enabled
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-50 grayscale"
          }`}
      >
        <div className="overflow-hidden">
          <CardContent className="px-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 ml-1">
                Campaign Name
              </Label>
              <Input
                placeholder="Ex: Halloween Sale"
                value={state.name}
                onChange={(e) =>
                  setState((p) => ({ ...p, name: e.target.value }))
                }
                className="h-9 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-orange-500/50 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 ml-1">
                  Launch Date
                </Label>
                <div className="relative">
                  <Input
                    type="datetime-local"
                    value={state.date}
                    onChange={(e) =>
                      setState((p) => ({ ...p, date: e.target.value }))
                    }
                    className="h-9 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-orange-500/50 text-[11px] px-2 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 ml-1">
                  Audience
                </Label>
                <div className="relative">
                  <Select
                    value={state.audience}
                    onValueChange={(val) =>
                      setState((p) => ({ ...p, audience: val }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-gray-50/50 border-gray-200 focus:border-orange-500/50 pl-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="first_time">First-time</SelectItem>
                      <SelectItem value="returning">Returning</SelectItem>
                    </SelectContent>
                  </Select>
                  <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-500/50 pointer-events-none z-10" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700 ml-1">
                Message
              </Label>
              <Textarea
                placeholder="Hi {name}, ..."
                value={state.message}
                onChange={(e) =>
                  setState((p) => ({ ...p, message: e.target.value }))
                }
                className="min-h-20 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-orange-500/50 text-sm resize-none"
              />
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 text-orange-500" />
                  Attach Coupon
                </Label>
                <Switch
                  checked={state.sendCoupons}
                  onCheckedChange={(c) =>
                    setState((p) => ({ ...p, sendCoupons: c }))
                  }
                  className="scale-75 data-[state=checked]:bg-orange-500"
                />
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${state.sendCoupons ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <BatchSelector
                  selectedId={state.batchId}
                  merchantId={merchantId}
                  isOpen={dropdownOpen}
                  setIsOpen={setDropdownOpen}
                  onSelect={(id) => setState((p) => ({ ...p, batchId: id }))}
                  placeholder="Select campaign reward..."
                  className="h-9 text-sm"
                />
              </div>
            </div>

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
                  <Send className="h-3 w-3 mr-2" />
                )}
                Schedule Campaign
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
