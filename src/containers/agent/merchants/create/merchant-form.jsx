"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Store,
  User,
  CreditCard,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { createMerchant, updateMerchant } from "@/lib/services/helper";
import AddressAutocomplete from "@/components/address-autocomplete";
import { cn } from "@/lib/utils";
import { AgentBalanceAlert } from "@/components/wallet/agent-balance-alert";
import axiosInstance from "@/lib/axios";

/**
 * MerchantForm - Create or Edit Merchant
 * @param {Object} props
 * @param {Object} props.initialData - Data to pre-fill for edit mode (optional)
 * @param {boolean} props.isEdit - Whether this is edit mode (default: false)
 * @param {string|number} props.merchantId - The ID of the merchant being edited (required for edit)
 */
export function MerchantForm({
  initialData = null,
  isEdit = false,
  merchantId = null,
}) {
  const t = useTranslations("agentMerchants.create");
  const tEdit = useTranslations("agentMerchants.edit");
  const tValidation = useTranslations(
    isEdit
      ? "agentMerchants.edit.validation"
      : "agentMerchants.create.validation",
  );
  const tCommon = useTranslations("agentMerchants.common");
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Wallet balance and platform cost
  const [walletBalance, setWalletBalance] = useState(0);
  const [platformCost, setPlatformCost] = useState(299); // Default
  const [annualFee, setAnnualFee] = useState(299); // Default
  const [loadingWallet, setLoadingWallet] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "merchant",
    business_name: "",
    business_type: "",
    merchant_type: "temporary",
    address: "",
    city: "",
    country: "",
    map_link: "",
    latitude: "",
    longitude: "",
    tax_id: "",
    is_active: true,
  });

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isEdit && initialData) {
      console.debug("Prefilling form with initialData:", initialData);

      // Handle nested user object if present
      const userData = initialData.user || {};

      setFormData({
        name: userData.name || initialData.name || "",
        email: userData.email || initialData.email || "",
        password: "", // Don't pre-fill password for security
        role: initialData.role || "merchant",
        business_name:
          initialData.business_name || initialData.businessName || "",
        business_type:
          initialData.business_type || initialData.businessType || "",
        merchant_type:
          initialData.merchant_type || initialData.merchantType || "temporary",
        address: initialData.address || "",
        city: initialData.city || "",
        country: initialData.country || "",
        map_link: initialData.map_link || initialData.mapLink || "",
        latitude: initialData.latitude || "",
        longitude: initialData.longitude || "",
        tax_id: initialData.tax_id || initialData.taxId || "",
        is_active:
          userData.is_active ??
          initialData.is_active ??
          initialData.isActive ??
          true,
      });
    }
  }, [isEdit, initialData]);

  // Fetch agent wallet balance and platform cost settings
  useEffect(() => {
    const fetchWalletAndSettings = async () => {
      if (!session?.user?.adminId) return;

      try {
        setLoadingWallet(true);

        // Fetch agent wallet
        const walletRes = await axiosInstance.get(
          `/wallets/admin/${session.user.adminId}`,
        );
        const balance = Number(walletRes.data?.balance || 0);
        setWalletBalance(balance);

        // Fetch platform cost settings
        const settingsRes = await axiosInstance.get(
          "/super-admin-settings/platform-cost-settings",
        );
        const settings = settingsRes.data?.data || {};

        setPlatformCost(Number(settings.merchantAnnualPlatformCost || 299));
        setAnnualFee(Number(settings.merchantAnnualFee || 299));
      } catch (error) {
        console.error("Error fetching wallet or settings:", error);
        // Use defaults if fetch fails
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchWalletAndSettings();
  }, [session?.user?.adminId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        admin_id: session?.user?.adminId,
        name: formData.name,
        email: formData.email,
        role: "merchant",
        business_name: formData.business_name,
        business_type: formData.business_type,
        merchant_type: formData.merchant_type,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        map_link: formData.map_link,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        tax_id: formData.tax_id,
        is_active: formData.is_active,
      };

      // Only include password if it's provided (for create or password change)
      if (formData.password) {
        payload.password = formData.password;
      }

      if (isEdit && merchantId) {
        console.debug("Updating merchant payload:", payload);
        await updateMerchant(merchantId, payload);
        toast.success(tEdit("messages.updateSuccess"));
      } else {
        console.debug("Creating merchant payload:", payload);
        await createMerchant(payload);
        toast.success(t("messages.createSuccess"));
      }

      router.push("/agent/merchants");
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} merchant:`,
        error,
      );

      const errorData = error?.response?.data;

      // Handle validation errors (field-specific errors)
      if (errorData?.errors && typeof errorData.errors === "object") {
        const errorMessages = Object.entries(errorData.errors).map(
          ([field, messages]) => {
            // Try to get translated field name, fallback to formatted field name
            const fieldName = tValidation.has(`fields.${field}`)
              ? tValidation(`fields.${field}`)
              : field
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

            const errorList = Array.isArray(messages) ? messages : [messages];

            // Translate common error patterns
            const translatedErrors = errorList.map((msg) => {
              const msgLower = String(msg).toLowerCase();

              if (
                msgLower.includes("should not be empty") ||
                msgLower.includes("is required")
              ) {
                return tValidation("fieldEmpty", { field: fieldName });
              } else if (
                msgLower.includes("invalid") ||
                msgLower.includes("must be")
              ) {
                return tValidation("fieldInvalid", { field: fieldName });
              } else if (msgLower.includes("email")) {
                return tValidation("emailInvalid");
              } else if (
                msgLower.includes("password") &&
                msgLower.includes("characters")
              ) {
                return tValidation("passwordTooShort");
              }

              // Return original message if no pattern matches
              return `${fieldName}: ${msg}`;
            });

            return translatedErrors.join(", ");
          },
        );

        // Display first error with details
        toast.error(errorMessages[0], {
          description: errorMessages.slice(1, 3).join("\n") || undefined,
        });

        // Log all errors for debugging
        console.error("Validation errors:", errorMessages);
      }
      // Handle error array
      else if (Array.isArray(errorData?.errors)) {
        const firstError = errorData.errors[0];
        toast.error(
          firstError?.message || firstError || t("messages.validationFailed"),
          {
            description:
              errorData.errors
                .slice(1, 2)
                .map((e) => e?.message || e)
                .join("\n") || undefined,
          },
        );
      }
      // Handle single error message
      else if (errorData?.message || errorData?.error) {
        toast.error(errorData.message || errorData.error);
      }
      // Fallback error
      else {
        toast.error(
          isEdit ? tEdit("messages.updateError") : t("messages.createError"),
          {
            description: t("messages.createErrorDescription"),
          },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user has sufficient balance for annual merchant
  const isAnnualMerchant = formData.merchant_type === "annual";
  const hasInsufficientBalance =
    isAnnualMerchant && !loadingWallet && walletBalance < platformCost;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 w-full max-w-5xl mx-auto"
    >
      {/* Show wallet balance alert for annual merchants */}
      {!isEdit && isAnnualMerchant && !loadingWallet && (
        <AgentBalanceAlert
          balance={walletBalance}
          requiredBalance={platformCost}
          platformCost={platformCost}
          merchantPayment={annualFee}
          currency="USD"
          operationType="merchant_creation"
        />
      )}

      {/* Account Info */}
      <Card className="border-l-4 border-l-primary shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full text-primary">
                <User className="h-4 w-4" />
              </div>
              <CardTitle>{t("accountCredentials.title")}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => router.back()}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {isEdit ? tEdit("actions.back") : t("actions.back")}
            </Button>
          </div>
          <CardDescription>
            {isEdit
              ? tEdit("accountCredentials.description")
              : t("accountCredentials.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("accountCredentials.merchantName")}</Label>
            <Input
              id="name"
              placeholder={t("accountCredentials.merchantNamePlaceholder")}
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              {t("accountCredentials.emailAddress")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("accountCredentials.emailPlaceholder")}
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEdit
                ? tEdit("accountCredentials.newPassword")
                : t("accountCredentials.initialPassword")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required={!isEdit}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={
                  isEdit ? tEdit("accountCredentials.passwordPlaceholder") : ""
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={
                  showPassword
                    ? t("accountCredentials.hidePassword")
                    : t("accountCredentials.showPassword")
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t("accountCredentials.role")}</Label>
            <Input id="role" disabled value={formData.role} />
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-600">
              <Store className="h-4 w-4" />
            </div>
            <CardTitle>{t("businessProfile.title")}</CardTitle>
          </div>
          <CardDescription>{t("businessProfile.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_name">
              {t("businessProfile.businessName")}
            </Label>
            <Input
              id="business_name"
              placeholder={t("businessProfile.businessNamePlaceholder")}
              required
              value={formData.business_name}
              onChange={(e) => handleChange("business_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("businessProfile.businessType")}</Label>
            <Select
              value={formData.business_type}
              onValueChange={(v) => handleChange("business_type", v)}
              required
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("businessProfile.businessTypePlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food & Beverage">
                  {t("businessProfile.businessTypes.foodBeverage")}
                </SelectItem>
                <SelectItem value="Retail">
                  {t("businessProfile.businessTypes.retail")}
                </SelectItem>
                <SelectItem value="Services">
                  {t("businessProfile.businessTypes.services")}
                </SelectItem>
                <SelectItem value="Health">
                  {t("businessProfile.businessTypes.health")}
                </SelectItem>
                <SelectItem value="Education">
                  {t("businessProfile.businessTypes.education")}
                </SelectItem>
                <SelectItem value="Technology">
                  {t("businessProfile.businessTypes.technology")}
                </SelectItem>
                <SelectItem value="Hospitality">
                  {t("businessProfile.businessTypes.hospitality")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">{t("businessProfile.taxId")}</Label>
            <Input
              id="tax_id"
              placeholder={t("businessProfile.taxIdPlaceholder")}
              value={formData.tax_id}
              onChange={(e) => handleChange("tax_id", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-full text-orange-600">
              <Store className="h-4 w-4" />
            </div>
            <CardTitle>{t("locationDetails.title")}</CardTitle>
          </div>
          <CardDescription>{t("locationDetails.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <AddressAutocomplete
              label="Address"
              name="address"
              placeholder={t("locationDetails.addressPlaceholder")}
              value={formData.address}
              onChange={(locationData) => {
                setFormData((prev) => ({
                  ...prev,
                  address: locationData.address,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  map_link: locationData.mapUrl,
                  city: locationData.city || prev.city,
                  country: locationData.country || prev.country,
                }));
                toast.success(t("locationDetails.locationUpdated"));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t("locationDetails.city")}</Label>
            <Input
              id="city"
              placeholder={t("locationDetails.cityPlaceholder")}
              required
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">{t("locationDetails.country")}</Label>
            <Input
              id="country"
              placeholder={t("locationDetails.countryPlaceholder")}
              required
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>

          {/* Hidden Lat/Lng for form submission */}
          <input type="hidden" name="latitude" value={formData.latitude} />
          <input type="hidden" name="longitude" value={formData.longitude} />
        </CardContent>
      </Card>

      {/* Merchant Type */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600">
              <CreditCard className="h-4 w-4" />
            </div>
            <CardTitle>{t("merchantType.title")}</CardTitle>
          </div>
          <CardDescription>{t("merchantType.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label>{t("merchantType.label")}</Label>
              <Select
                value={formData.merchant_type}
                onValueChange={(v) => handleChange("merchant_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">
                    {t("merchantType.temporary")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="space-y-0.5">
              <Label className="text-base">
                {t("merchantType.accountStatus")}
              </Label>
              <CardDescription>
                {t("merchantType.accountStatusDescription")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-medium",
                  formData.is_active ? "text-emerald-600" : "text-zinc-500",
                )}
              >
                {formData.is_active
                  ? t("merchantType.active")
                  : t("merchantType.inactive")}
              </span>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  handleChange("is_active", checked)
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/10 border-t px-6 py-4 flex justify-between items-center">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading || hasInsufficientBalance}
            className="min-w-[140px]"
            title={
              hasInsufficientBalance
                ? t("actions.insufficientBalanceTooltip")
                : ""
            }
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? isEdit
                ? tEdit("actions.updating")
                : t("actions.creating")
              : isEdit
                ? tEdit("actions.updateMerchant")
                : t("actions.createMerchant")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
