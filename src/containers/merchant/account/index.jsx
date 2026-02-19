"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Store,
  FileText,
  QrCode,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AddressAutocomplete } from "@/components/common/address-autocomplete";

export default function MerchantAccountContainer() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const merchantId = session?.user?.merchantId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    merchantType: "",
    taxId: "",
    address: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    mapUrl: "",
    avatar: "",
    qrCodeImage: "",
    qrCodeUrl: "",
  });

  useEffect(() => {
    if (!merchantId) {
      router.push("/merchant/dashboard");
      return;
    }

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/merchants/${merchantId}`);
        const data = response.data.data || response.data;

        // Try to get phone from user object first, then from merchant object
        const phone = data.user?.phone || data.phone || "";

        setAccountData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: phone,
          businessName: data.business_name || "",
          businessType: data.business_type || "",
          merchantType: data.merchant_type || "",
          taxId: data.tax_id || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          latitude: data.latitude || "",
          longitude: data.longitude || "",
          mapUrl: data.map_link || "",
          avatar: data.user?.avatar || "",
          qrCodeImage: data.qr_code_image || "",
          qrCodeUrl: data.qr_code_url || "",
        });
      } catch (error) {
        console.error("Failed to fetch account data:", error);
        toast.error("Failed to load account information");
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [merchantId, router]);

  const handleInputChange = (field, value) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
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

      await axiosInstance.patch(`/merchants/${merchantId}`, {
        name: accountData.name,
        email: accountData.email,
        // phone: accountData.phone,
        business_name: accountData.businessName,
        business_type: accountData.businessType,
        tax_id: accountData.taxId,
        address: accountData.address,
        city: accountData.city,
        country: accountData.country,
      });

      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: accountData.name,
          email: accountData.email,
        },
      });

      toast.success("Account updated successfully");
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error(error.response?.data?.message || "Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadQR = () => {
    if (!accountData.qrCodeImage) return;

    const link = document.createElement("a");
    link.href = accountData.qrCodeImage;
    link.download = `${accountData.businessName || "merchant"}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                {accountData.businessName?.charAt(0) ||
                  accountData.name?.charAt(0) ||
                  "M"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">
                {accountData.businessName || accountData.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {accountData.email}
              </p>
              <div className="flex flex-col gap-2">
                <Badge variant="secondary" className="capitalize">
                  {accountData.merchantType}
                </Badge>
                {accountData.businessType && (
                  <Badge variant="outline">{accountData.businessType}</Badge>
                )}
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
                <Label htmlFor="businessName">
                  <Store className="h-4 w-4 inline mr-2" />
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  value={accountData.businessName}
                  onChange={(e) =>
                    handleInputChange("businessName", e.target.value)
                  }
                  placeholder="Enter business name"
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
                <Label htmlFor="businessType">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  Business Type
                </Label>
                <Input
                  id="businessType"
                  value={accountData.businessType}
                  onChange={(e) =>
                    handleInputChange("businessType", e.target.value)
                  }
                  placeholder="Enter business type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Tax ID
                </Label>
                <Input
                  id="taxId"
                  value={accountData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  placeholder="Enter tax ID"
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
              <Button onClick={handleSave} disabled={saving} className="gap-2">
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

      {/* QR Code Section */}
      {accountData.qrCodeImage && (
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Your QR Code
            </CardTitle>
            <CardDescription>
              Share this QR code with customers to collect reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="shrink-0">
                <div className="p-4 bg-white rounded-lg border-2 border-muted">
                  <Image
                    src={accountData.qrCodeImage}
                    alt="Merchant QR Code"
                    width={200}
                    height={200}
                    className="rounded"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label className="text-sm font-medium">QR Code URL</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm break-all">
                    {accountData.qrCodeUrl}
                  </div>
                </div>
                <Button
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
