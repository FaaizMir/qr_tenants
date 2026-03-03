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
import { useTranslations } from "next-intl";

export function PlatformSettingsForm() {
  const t = useTranslations("masterAdminSettings");
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
      toast.error(t("messages.loadError"));
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
        const fieldName = field.replace(/_/g, ' ');
        toast.error(t("messages.validationError", { field: fieldName }));
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
      toast.success(t("messages.updateSuccess"));
      fetchSettings(); // Refresh to get latest data
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error(
        error?.response?.data?.message || t("messages.updateError")
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
              <CardTitle>{t("subscriptionFees.title")}</CardTitle>
              <CardDescription className="mt-1">
                {t("subscriptionFees.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin_fee">
                {t("subscriptionFees.agentFee.label")}
                <Badge variant="secondary" className="ml-2">{t("subscriptionFees.required")}</Badge>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {settings.currency}
                </span>
                <Input
                  id="admin_fee"
                  type="number"
                  step="0.01"
                  placeholder={t("subscriptionFees.agentFee.placeholder")}
                  value={settings.admin_annual_subscription_fee}
                  onChange={(e) =>
                    handleChange("admin_annual_subscription_fee", e.target.value)
                  }
                  className="pl-14"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("subscriptionFees.agentFee.description")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant_fee">
                {t("subscriptionFees.merchantFee.label")}
                <Badge variant="secondary" className="ml-2">{t("subscriptionFees.required")}</Badge>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {settings.currency}
                </span>
                <Input
                  id="merchant_fee"
                  type="number"
                  step="0.01"
                  placeholder={t("subscriptionFees.merchantFee.placeholder")}
                  value={settings.merchant_annual_fee}
                  onChange={(e) =>
                    handleChange("merchant_annual_fee", e.target.value)
                  }
                  className="pl-14"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("subscriptionFees.merchantFee.description")}
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
              <CardTitle>{t("platformCosts.title")}</CardTitle>
              <CardDescription className="mt-1">
                {t("platformCosts.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Merchant Activation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">{t("platformCosts.merchantActivation.title")}</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant_platform_cost">
                {t("platformCosts.merchantActivation.annualCost.label")}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {settings.currency}
                </span>
                <Input
                  id="merchant_platform_cost"
                  type="number"
                  step="0.01"
                  placeholder={t("platformCosts.merchantActivation.annualCost.placeholder")}
                  value={settings.merchant_annual_platform_cost}
                  onChange={(e) =>
                    handleChange("merchant_annual_platform_cost", e.target.value)
                  }
                  className="pl-14"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("platformCosts.merchantActivation.annualCost.description")}
              </p>
            </div>
          </div>

          <Separator />

          {/* WhatsApp Costs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">{t("platformCosts.whatsapp.title")}</h4>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_bi">{t("platformCosts.whatsapp.biCost.label")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="whatsapp_bi"
                    type="number"
                    step="0.0001"
                    placeholder={t("platformCosts.whatsapp.biCost.placeholder")}
                    value={settings.whatsapp_bi_platform_cost}
                    onChange={(e) =>
                      handleChange("whatsapp_bi_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("platformCosts.whatsapp.biCost.description")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_ui_annual">
                  {t("platformCosts.whatsapp.uiAnnual.label")}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="whatsapp_ui_annual"
                    type="number"
                    step="0.0001"
                    placeholder={t("platformCosts.whatsapp.uiAnnual.placeholder")}
                    value={settings.whatsapp_ui_annual_platform_cost}
                    onChange={(e) =>
                      handleChange("whatsapp_ui_annual_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("platformCosts.whatsapp.uiAnnual.description")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_ui_temp">
                  {t("platformCosts.whatsapp.uiTemporary.label")}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="whatsapp_ui_temp"
                    type="number"
                    step="0.0001"
                    placeholder={t("platformCosts.whatsapp.uiTemporary.placeholder")}
                    value={settings.whatsapp_ui_temporary_platform_cost}
                    onChange={(e) =>
                      handleChange("whatsapp_ui_temporary_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("platformCosts.whatsapp.uiTemporary.description")}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Coupon Costs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">{t("platformCosts.coupon.title")}</h4>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon_annual">{t("platformCosts.coupon.annual.label")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="coupon_annual"
                    type="number"
                    step="0.0001"
                    placeholder={t("platformCosts.coupon.annual.placeholder")}
                    value={settings.coupon_annual_platform_cost}
                    onChange={(e) =>
                      handleChange("coupon_annual_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("platformCosts.coupon.annual.description")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon_temp">{t("platformCosts.coupon.temporary.label")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {settings.currency}
                  </span>
                  <Input
                    id="coupon_temp"
                    type="number"
                    step="0.0001"
                    placeholder={t("platformCosts.coupon.temporary.placeholder")}
                    value={settings.coupon_temporary_platform_cost}
                    onChange={(e) =>
                      handleChange("coupon_temporary_platform_cost", e.target.value)
                    }
                    className="pl-14"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("platformCosts.coupon.temporary.description")}
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
              <CardTitle>{t("currency.title")}</CardTitle>
              <CardDescription className="mt-1">
                {t("currency.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="currency">{t("currency.label")}</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleChange("currency", value)}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MYR">{t("currency.options.myr")}</SelectItem>
                <SelectItem value="USD">{t("currency.options.usd")}</SelectItem>
                <SelectItem value="EUR">{t("currency.options.eur")}</SelectItem>
                <SelectItem value="GBP">{t("currency.options.gbp")}</SelectItem>
                <SelectItem value="SGD">{t("currency.options.sgd")}</SelectItem>
                <SelectItem value="AUD">{t("currency.options.aud")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("currency.description2")}
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
            <CardTitle className="text-base">{t("businessModel.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              1
            </div>
            <p>
              <strong className="text-foreground">{t("businessModel.steps.merchantPayment.title")}</strong> {t("businessModel.steps.merchantPayment.description")}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              2
            </div>
            <p>
              <strong className="text-foreground">{t("businessModel.steps.platformDeduction.title")}</strong> {t("businessModel.steps.platformDeduction.description")}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
              3
            </div>
            <p>
              <strong className="text-foreground">{t("businessModel.steps.agentProfit.title")}</strong> {t("businessModel.steps.agentProfit.description")}
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
          {t("actions.reset")}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("actions.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("actions.saveSettings")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
