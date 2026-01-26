"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Loader2, Store, User, CreditCard, Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { createMerchant, updateMerchant } from "@/lib/services/helper";
import AddressAutocomplete from "@/components/address-autocomplete";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "merchant",
    business_name: "",
    business_type: "",
    merchant_type: "annual",
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
          initialData.merchant_type || initialData.merchantType || "annual",
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
        toast.success("Merchant updated successfully.");
      } else {
        console.debug("Creating merchant payload:", payload);
        await createMerchant(payload);
        toast.success("Merchant account created successfully.");
      }

      router.push("/agent/merchants");
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} merchant:`,
        error,
      );
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} merchant`,
      );
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
            <CardTitle>Account Credentials</CardTitle>
          </div>
          <CardDescription>
            {isEdit
              ? "Update merchant administrator details."
              : "Login details for the merchant administrator."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Merchant Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="merchant@business.com"
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              {isEdit
                ? "New Password (leave blank to keep current)"
                : "Initial Password"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required={!isEdit}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={isEdit ? "••••••••" : ""}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
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
            <Label htmlFor="role">Role</Label>
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
            <CardTitle>Business Profile</CardTitle>
          </div>
          <CardDescription>
            Primary business details displayed to customers.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              placeholder="e.g. Acme Café"
              required
              value={formData.business_name}
              onChange={(e) => handleChange("business_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Business Type</Label>
            <Select
              value={formData.business_type}
              onValueChange={(v) => handleChange("business_type", v)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Health">Health</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Hospitality">Hospitality</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID</Label>
            <Input
              id="tax_id"
              placeholder="e.g. TX123456"
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
            <CardTitle>Location Details</CardTitle>
          </div>
          <CardDescription>
            Search for the business address to auto-fill details.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Search Address</Label>
            <AddressAutocomplete
              label="Address"
              name="address"
              placeholder="123 Main St, City, Country"
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
                toast.success("Location updated");
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              required
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Country"
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
            <CardTitle>Merchant Type</CardTitle>
          </div>
          <CardDescription>Select the merchant type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label>Merchant Type</Label>
              <Select
                value={formData.merchant_type}
                onValueChange={(v) => handleChange("merchant_type", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="space-y-0.5">
              <Label className="text-base">Account Status</Label>
              <CardDescription>
                Enable or disable this merchant's access to the platform.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-medium",
                  formData.is_active ? "text-emerald-600" : "text-zinc-500",
                )}
              >
                {formData.is_active ? "Active" : "Inactive"}
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
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Merchant"
                : "Create Merchant"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
