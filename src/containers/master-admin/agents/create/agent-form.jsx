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
  User,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/lib/toast";
import AddressAutocomplete from "@/components/address-autocomplete";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";

/**
 * AgentForm - Create or Edit Agent
 * @param {Object} props
 * @param {Object} props.initialData - Data to pre-fill for edit mode (optional)
 * @param {boolean} props.isEdit - Whether this is edit mode (default: false)
 * @param {string|number} props.agentId - The ID of the agent being edited (required for edit)
 */
export function AgentForm({
  initialData = null,
  isEdit = false,
  agentId = null,
}) {
  const t = useTranslations("masterAdminAgents");
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [maskedStripeKey, setMaskedStripeKey] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    stripe_secret_key: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    is_active: true,
  });

  // Fetch data if in edit mode and no initialData provided
  useEffect(() => {
    const fetchAgent = async () => {
      if (isEdit && !initialData && agentId) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/admins/${agentId}`);
          // Extract the agent data (handle API response wrapping)
          const data = response.data;
          const agent = data?.data || data;

          if (!agent) {
            console.error("No agent data found in response:", data);
            toast.error(t("messages.fetchError"));
            return;
          }

          console.debug("Fetched agent data for edit:", agent);

          const user = agent.user || {};

          // Set masked Stripe key if available
          if (agent.stripe_key_masked) {
            setMaskedStripeKey(agent.stripe_key_masked);
          }

          setFormData({
            name: user.name || agent.name || "",
            email: user.email || agent.email || "",
            phone: user.phone || agent.phone || agent.phone_number || "",
            password: "",
            stripe_secret_key: "", // Don't pre-fill for security
            address: agent.address || "",
            city: agent.city || "",
            country: agent.country || "",
            latitude: agent.latitude || agent.lat || "",
            longitude: agent.longitude || agent.lng || "",
            is_active:
              agent.is_active ??
              user.is_active ??
              agent.isActive ??
              user.isActive ??
              true,
          });
        } catch (error) {
          console.error("Failed to fetch agent details:", error);
          toast.error(t("messages.fetchError"));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAgent();
  }, [isEdit, initialData, agentId, t]);

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isEdit && initialData) {
      console.debug("Prefilling form with initialData:", initialData);

      // Handle nested user object if present
      const userData = initialData.user || {};

      // Set masked Stripe key if available
      if (initialData.stripe_key_masked) {
        setMaskedStripeKey(initialData.stripe_key_masked);
      }

      setFormData({
        name: userData.name || initialData.name || "",
        email: userData.email || initialData.email || "",
        phone: userData.phone || initialData.phone || "",
        password: "", // Don't pre-fill password for security
        stripe_secret_key: "", // Don't pre-fill Stripe key for security
        address: initialData.address || "",
        city: initialData.city || "",
        country: initialData.country || "",
        latitude: initialData.latitude || "",
        longitude: initialData.longitude || "",
        is_active:
          userData.is_active ??
          initialData.is_active ??
          initialData.isActive ??
          true,
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        is_active: formData.is_active,
        country: formData.country,
        city: formData.city,
      };

      // Only include password if it's provided (for create or password change)
      if (formData.password) {
        payload.password = formData.password;
      }

      // Only include Stripe key if it's provided (optional configuration)
      if (formData.stripe_secret_key) {
        payload.stripe_secret_key = formData.stripe_secret_key;
      }

      if (isEdit && agentId) {
        console.debug("Updating agent payload:", payload);
        await axiosInstance.patch(`/admins/${agentId}`, payload);
        toast.success(t("messages.updateSuccess"));
      } else {
        console.debug("Creating agent payload:", payload);
        await axiosInstance.post(`/admins`, payload);
        toast.success(t("messages.createSuccess"));
      }

      router.push("/master-admin/agents");
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} agent:`, error);

      // Extract error details from response
      const errorData = error?.response?.data;

      // Handle validation errors (field-specific errors)
      if (errorData?.errors && typeof errorData.errors === "object") {
        const errorMessages = Object.entries(errorData.errors).map(
          ([field, messages]) => {
            const fieldName = field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase());
            const errorList = Array.isArray(messages) ? messages : [messages];
            return t("messages.validationError", {
              field: fieldName,
              message: errorList.join(", "),
            });
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
          isEdit ? t("messages.updateError") : t("messages.createError"),
          {
            description: t("messages.checkInput"),
          },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 w-full max-w-5xl mx-auto"
    >
      {/* Account Info */}
      <Card className="border-l-4 border-l-primary shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <User className="h-4 w-4" />
            </div>
            <CardTitle>{t("form.agentDetails.title")}</CardTitle>
          </div>
          <CardDescription>
            {isEdit
              ? t("form.agentDetails.descriptionEdit")
              : t("form.agentDetails.descriptionCreate")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("form.fields.fullName")}{" "}
              <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <Input
              id="name"
              placeholder={t("form.placeholders.name")}
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              {t("form.fields.emailAddress")}{" "}
              <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("form.placeholders.email")}
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t("form.fields.phoneNumber")}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder={t("form.placeholders.phone")}
                className="pl-9"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>
          {/* Password */}
          <div className="space-y-2 ">
            <Label htmlFor="password">
              {isEdit
                ? t("form.fields.newPassword")
                : t("form.fields.password")}{" "}
              <span className="text-red-500">{t("form.required")}</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required={!isEdit}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={
                  isEdit
                    ? t("form.placeholders.passwordEdit")
                    : t("form.placeholders.passwordCreate")
                }
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={
                  showPassword
                    ? t("form.buttons.hidePassword")
                    : t("form.buttons.showPassword")
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {!isEdit && (
              <p className="text-xs text-muted-foreground">
                {t("form.hints.passwordRequirements")}
              </p>
            )}
          </div>

          {/* Stripe Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="stripe_key">
              {t("form.fields.stripeSecretKey")}
            </Label>
            <div className="relative">
              <Input
                id="stripe_key"
                type={showStripeKey ? "text" : "password"}
                value={formData.stripe_secret_key}
                onChange={(e) =>
                  handleChange("stripe_secret_key", e.target.value)
                }
                placeholder={
                  isEdit && maskedStripeKey
                    ? t("form.placeholders.stripeKeyExisting", {
                        maskedKey: maskedStripeKey,
                      })
                    : isEdit
                      ? t("form.placeholders.stripeKeyExistingGeneric")
                      : t("form.placeholders.stripeKeyNew")
                }
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowStripeKey(!showStripeKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={
                  showStripeKey
                    ? t("form.buttons.hideKey")
                    : t("form.buttons.showKey")
                }
              >
                {showStripeKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? t("form.hints.stripeKeyEdit")
                : t("form.hints.stripeKeyCreate")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-orange-500/10 rounded-full text-orange-600">
              <MapPin className="h-4 w-4" />
            </div>
            <CardTitle>{t("form.locationDetails.title")}</CardTitle>
          </div>
          <CardDescription>
            {t("form.locationDetails.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <AddressAutocomplete
              label={t("form.fields.searchAddress")}
              name="address"
              placeholder={t("form.placeholders.address")}
              value={formData.address}
              onChange={(locationData) => {
                setFormData((prev) => ({
                  ...prev,
                  address: locationData.address,
                  latitude: locationData.latitude,
                  longitude: locationData.longitude,
                  city: locationData.city || prev.city,
                  country: locationData.country || prev.country,
                }));
                toast.success(t("messages.addressSelected"));
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">{t("form.fields.city")}</Label>
            <Input
              id="city"
              placeholder={t("form.placeholders.city")}
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">{t("form.fields.country")}</Label>
            <Input
              id="country"
              placeholder={t("form.placeholders.country")}
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>

          {/* Hidden Lat/Lng */}
          <input type="hidden" name="latitude" value={formData.latitude} />
          <input type="hidden" name="longitude" value={formData.longitude} />
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <CardTitle>{t("form.accountStatus.title")}</CardTitle>
          </div>
          <CardDescription>
            {t("form.accountStatus.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="space-y-0.5">
              <Label className="text-base">
                {t("form.accountStatus.activeLabel")}
              </Label>
              <CardDescription>
                {t("form.accountStatus.activeDescription")}
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
                  ? t("form.accountStatus.active")
                  : t("form.accountStatus.inactive")}
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
            {t("form.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? isEdit
                ? t("form.buttons.updating")
                : t("form.buttons.creating")
              : isEdit
                ? t("form.buttons.updateAgent")
                : t("form.buttons.createAgent")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
