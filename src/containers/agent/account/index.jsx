"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User, Mail, Phone, MapPin, Building2, Key } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddressAutocomplete } from "@/components/common/address-autocomplete";

export default function AgentAccountContainer() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const adminId = session?.user?.adminId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maskedStripeKey, setMaskedStripeKey] = useState("");
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    mapUrl: "",
    avatar: "",
    hasStripeKey: false,
    stripeSecretKey: "",
  });

  useEffect(() => {
    if (!adminId) {
      router.push("/agent/dashboard");
      return;
    }

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/admins/${adminId}`);
        const data = response.data.data;
        
        // Set masked Stripe key if available
        if (data.stripe_key_masked) {
          setMaskedStripeKey(data.stripe_key_masked);
        }
        
        setAccountData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.user?.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          latitude: "",
          longitude: "",
          mapUrl: "",
          avatar: data.user?.avatar || "",
          hasStripeKey: data.has_stripe_key || false,
          stripeSecretKey: data.stripe_key_masked || "",
        });
      } catch (error) {
        console.error("Failed to fetch account data:", error);
        
        // Handle fetch errors
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach(field => {
            const messages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
            messages.forEach(msg => {
              toast.error(`${field}: ${msg}`);
            });
          });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to load account information");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [adminId, router]);

  const handleInputChange = (field, value) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (locationData) => {
    setAccountData(prev => ({
      ...prev,
      address: locationData.address,
      city: locationData.city || prev.city,
      country: locationData.country || prev.country,
      latitude: locationData.latitude?.toString() || "",
      longitude: locationData.longitude?.toString() || "",
      mapUrl: locationData.mapUrl || "",
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare payload
      const payload = {
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        address: accountData.address,
        city: accountData.city,
        country: accountData.country,
      };

      // Only include stripe_secret_key if it's been changed (not the masked value)
      if (accountData.stripeSecretKey && accountData.stripeSecretKey !== maskedStripeKey) {
        payload.stripe_secret_key = accountData.stripeSecretKey;
      }
      
      await axiosInstance.patch(`/admins/${adminId}`, payload);

      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: accountData.name,
          email: accountData.email,
        }
      });

      toast.success("Account updated successfully");
    } catch (error) {
      console.error("Failed to update account:", error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        // Display all validation errors
        Object.keys(errors).forEach(field => {
          const messages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
          messages.forEach(msg => {
            toast.error(`${field}: ${msg}`);
          });
        });
      } else if (error.response?.data?.message) {
        // Display single error message
        toast.error(error.response.data.message);
      } else {
        // Fallback error message
        toast.error("Failed to update account");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={accountData.avatar} alt={accountData.name} />
              <AvatarFallback className="text-2xl">
                {accountData.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{accountData.name}</h3>
              <p className="text-sm text-muted-foreground">{accountData.email}</p>
              <div className="mt-2">
                <Badge variant={accountData.hasStripeKey ? "default" : "secondary"}>
                  {accountData.hasStripeKey ? "Stripe Connected" : "No Stripe Key"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Form */}
        <Card className="md:col-span-2 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="h-4 w-4 inline mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={accountData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={accountData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={accountData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  City
                </Label>
                <Input
                  id="city"
                  value={accountData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Country
                </Label>
                <Input
                  id="country"
                  value={accountData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter your country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">
                  <Key className="h-4 w-4 inline mr-2" />
                  Stripe Secret Key
                </Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  value={accountData.stripeSecretKey}
                  onChange={(e) => handleInputChange("stripeSecretKey", e.target.value)}
                  placeholder={
                    maskedStripeKey
                      ? `${maskedStripeKey} (leave blank to keep current)`
                      : "sk_test_... or sk_live_..."
                  }
                />
                {accountData.hasStripeKey && (
                  <p className="text-xs text-muted-foreground">
                    Current key is masked for security. Enter a new key to update.
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <AddressAutocomplete
                  label="Address"
                  name="address"
                  value={accountData.address}
                  onChange={handleAddressChange}
                  placeholder="Start typing an address..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
