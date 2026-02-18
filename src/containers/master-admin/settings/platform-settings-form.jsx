"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  DollarSign,
  Users,
  MessageSquare,
  Ticket,
  Save,
  RefreshCw,
  Settings2,
  TrendingUp,
  Globe,
} from "lucide-react";
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import { Separator } from "@/components/ui/separator";

export function PlatformSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    admin_annual_subscription_fee: "",
    merchant_annual_fee: "",
    merchant_annual_platform_cost: "",
    whatsapp_bi_platform_cost: "",
    whatsapp_ui_annual_platform_cost: "",
    whatsapp_ui_temporary_platform_cost: "",
    coupon_annual_platform_cost: "",
    coupon_temporary_platform_cost: "",
    currency: "MYR",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/super-admin-settings");
      const data = response.data?.data || response.data;
      setSettings({
        admin_annual_subscription_fee: data.admin_annual_subscription_fee || "",
        merchant_annual_fee: data.merchant_annual_fee || "",
        merchant_annual_platform_cost: data.merchant_annual_platform_cost || "",
        whatsapp_bi_platform_cost: data.whatsapp_bi_platform_cost || "",
        whatsapp_ui_annual_platform_cost: data.whatsapp_ui_annual_platform_cost || "",
        whatsapp_ui_temporary_platform_cost: data.whatsapp_ui_temporary_platform_cost || "",
        coupon_annual_platform_cost: data.coupon_annual_platform_cost || "",
        coupon_temporary_platform_cost: data.coupon_temporary_platform_cost || "",
        currency: data.currency || "MYR",
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const numericFields = [
      'admin_annual_subscription_fee',
      'merchant_annual_fee',
      'merchant_annual_platform_cost',
      'whatsapp_bi_platform_cost',
      'whatsapp_ui_annual_platform_cost',
      'whatsapp_ui_temporary_platform_cost',
      'coupon_annual_platform_cost',
      'coupon_temporary_platform_cost',
    ];

    for (const field of numericFields) {
      if (settings[field] && isNaN(Number(settings[field]))) {
        toast.error(`${field.replace(/_/g, ' ')} must be a valid number`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        admin_annual_subscription_fee: Number(settings.admin_annual_subscription_fee),
        merchant_annual_fee: Number(settings.merchant_annual_fee),
        merchant_annual_platform_cost: Number(settings.merchant_annual_platform_cost),
        whatsapp_bi_platform_cost: Number(settings.whatsapp_bi_platform_cost),
        whatsapp_ui_annual_platform_cost: Number(settings.whatsapp_ui_annual_platform_cost),
        whatsapp_ui_temporary_platform_cost: Number(settings.whatsapp_ui_temporary_platform_cost),
        coupon_annual_platform_cost: Number(settings.coupon_annual_platform_cost),
        coupon_temporary_platform_cost: Number(settings.coupon_temporary_platform_cost),
        currency: settings.currency,
      };

      await axiosInstance.patch("/super-admin-settings", payload);
      toast.success("Platform settings updated successfully");
      fetchSettings(); // Refresh to get latest data
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subscription Fees */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-full text-blue-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Subscription Fees</CardTitle>
              <CardDescription className="mt-1">
                Annual subscription pricing for agents and merchants
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin_fee">
                Agent Annual Subscription Fee
                <Badge variant="secondary" className="ml-2">Required</Badge>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {settings.currency}
                </span>
                <Input
                  id="admin_fee"
                  type="number"
                  step="0.01"
                  placeholder="1499.00"
                  value={settings.admin_annual_subscription_fee}
                  onChange={(e) =>
                    handleChange("admin_annual_subscription_fee", e.target.value)
                  }
                  className="pl-14"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                What agents pay for annual platform access
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant_fee">
                Merchant Annual Subscription Fee
                <Badge variant="secondary" className="ml-2">Required</Badge>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {settings.currency}
                </span>
                <Input
                  id="merchant_fee"
                  type="number"
                  step="0.01"
                  placeholder="1499.00"
                  value={settings.merchant_annual_fee}
                  onChange={(e) =>
                    handleChange("merchant_annual_fee", e.target.value)
                  }
                  className="pl-14"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                What merchants pay for annual subscription
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Costs - Prepaid Wallet Deductions */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-full text-purple-600">
              <Settings2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Platform Costs (Prepaid Wallet Model)</CardTitle>
              <CardDescription className="mt-1">
                Costs automatically deducted from agent's prepaid wallet per operation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Merchant Activation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Merchant Activation</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant_platform_cost">
                Annual Merchant Platform Cost
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {settings.currency}
                </span>
                <Input
                  id="merchant_platform_cost"
                  type="number"
                  step="0.01"
                  placeholder="299.00"
                  value={settings.merchant_annual_platform_cost}
                  onChange={(e) =>
                    handleChange("merchant_annual_platform_cost", e.target.value)
                  }
                  className="pl-14"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Deducted when agent activates an annual merchant subscription
              </p>
            </div>
          </div>

          <Separator />

          {/* WhatsApp Costs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">WhatsApp Messaging</h4>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_bi">WhatsApp BI Cost</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="whatsapp_bi"
                    type="number"
                    step="0.0001"
                    placeholder="0.45"
                    value={settings.whatsapp_bi_platform_cost}
                    onChange={(e) =>
                      handleChange("whatsapp_bi_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Per BI message</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_ui_annual">
                  WhatsApp UI (Annual)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="whatsapp_ui_annual"
                    type="number"
                    step="0.0001"
                    placeholder="0.12"
                    value={settings.whatsapp_ui_annual_platform_cost}
                    onChange={(e) =>
                      handleChange("whatsapp_ui_annual_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Per UI (annual)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_ui_temp">
                  WhatsApp UI (Temporary)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="whatsapp_ui_temp"
                    type="number"
                    step="0.0001"
                    placeholder="0.12"
                    value={settings.whatsapp_ui_temporary_platform_cost}
                    onChange={(e) =>
                      handleChange("whatsapp_ui_temporary_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Per UI (temp)</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Coupon Costs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Coupon Generation</h4>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon_annual">Coupon Cost (Annual)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="coupon_annual"
                    type="number"
                    step="0.0001"
                    placeholder="0.05"
                    value={settings.coupon_annual_platform_cost}
                    onChange={(e) =>
                      handleChange("coupon_annual_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Per coupon for annual merchants
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon_temp">Coupon Cost (Temporary)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="coupon_temp"
                    type="number"
                    step="0.0001"
                    placeholder="0.05"
                    value={settings.coupon_temporary_platform_cost}
                    onChange={(e) =>
                      handleChange("coupon_temporary_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Per coupon for temporary merchants
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500/10 rounded-full text-green-600">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <CardTitle>Currency Configuration</CardTitle>
              <CardDescription className="mt-1">
                Platform currency for all transactions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="currency">Platform Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleChange("currency", value)}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MYR">MYR (Malaysian Ringgit)</SelectItem>
                <SelectItem value="USD">USD (US Dollar)</SelectItem>
                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All amounts are displayed in this currency
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Model Explanation */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <TrendingUp className="h-4 w-4" />
            </div>
            <CardTitle className="text-base">Prepaid Wallet Business Model</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              1
            </div>
            <p>
              <strong className="text-foreground">Merchant Payment:</strong> 100% goes to agent's Stripe account
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              2
            </div>
            <p>
              <strong className="text-foreground">Platform Deduction:</strong> Costs automatically deducted from agent's prepaid wallet
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              3
            </div>
            <p>
              <strong className="text-foreground">Agent Profit:</strong> Merchant payment - Platform cost = Agent's earnings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={fetchSettings}
          disabled={saving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
