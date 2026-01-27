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
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
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
            toast.error("Failed to load agent details");
            return;
          }

          console.debug("Fetched agent data for edit:", agent);

          const user = agent.user || {};

          setFormData({
            name: user.name || agent.name || "",
            email: user.email || agent.email || "",
            phone: user.phone || agent.phone || agent.phone_number || "",
            password: "",
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
          toast.error("Failed to load agent details");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAgent();
  }, [isEdit, initialData, agentId]);

  // Populate form when initialData is provided (edit mode)
  useEffect(() => {
    if (isEdit && initialData) {
      console.debug("Prefilling form with initialData:", initialData);

      // Handle nested user object if present
      const userData = initialData.user || {};

      setFormData({
        name: userData.name || initialData.name || "",
        email: userData.email || initialData.email || "",
        phone: userData.phone || initialData.phone || "",
        password: "", // Don't pre-fill password for security
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

      if (isEdit && agentId) {
        console.debug("Updating agent payload:", payload);
        await axiosInstance.patch(`/admins/${agentId}`, payload);
        toast.success("Agent profile updated successfully.");
      } else {
        console.debug("Creating agent payload:", payload);
        await axiosInstance.post(`/admins`, payload);
        toast.success("Agent account created successfully.");
      }

      router.push("/master-admin/agents");
    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} agent:`, error);
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} agent. Please try again.`,
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
            <CardTitle>Agent Details</CardTitle>
          </div>
          <CardDescription>
            {isEdit
              ? "Update agent personal and login information."
              : "Enter the personal details for the new agent."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="agent@example.com"
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="+1 234 567 890"
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
                ? "New Password (leave blank to keep current)"
                : "Password"}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required={!isEdit}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={isEdit ? "••••••••" : "Enter a secure password"}
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
            {!isEdit && (
              <p className="text-xs text-muted-foreground">
                Min. 8 characters, alphanumeric.
              </p>
            )}
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
            <CardTitle>Location Details</CardTitle>
          </div>
          <CardDescription>Address information for the agent.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Search Address</Label>
            <AddressAutocomplete
              label="Address"
              name="address"
              placeholder="123 Agent St, City, Country"
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
                toast.success("Address selected");
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="Country"
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
            <CardTitle>Account Status</CardTitle>
          </div>
          <CardDescription>
            Control the agent&apos;s access to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-zinc-50/50 dark:bg-zinc-800/30">
            <div className="space-y-0.5">
              <Label className="text-base">Active Status</Label>
              <CardDescription>
                When disabled, the agent cannot log in or manage merchants.
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
                ? "Update Agent"
                : "Create Agent"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
