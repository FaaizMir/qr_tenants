"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import axiosInstance from "@/lib/axios";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, User, Mail, Phone, Shield, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function MasterAdminAccountContainer() {
  const t = useTranslations("masterAdminAccount");
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const staffRole = session?.user?.staffRole || "Super Admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "",
  });

  useEffect(() => {
    if (!userId) {
      router.push("/master-admin/dashboard");
      return;
    }

    const fetchAccountData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/users/${userId}`);
        const data = response.data.data || response.data;
        
        setAccountData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
          role: staffRole,
        });
      } catch (error) {
        console.error("Failed to fetch account data:", error);
        
        // Handle fetch errors
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach(field => {
            const messages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
            messages.forEach(msg => {
              toast.error(t("messages.validationError", { field, message: msg }));
            });
          });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(t("messages.fetchError"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [userId, router, staffRole]);

  const handleInputChange = (field, value) => {
    setAccountData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await axiosInstance.patch(`/users/${userId}`, {
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
      });

      // Update session with new data
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: accountData.name,
          email: accountData.email,
        }
      });

      toast.success(t("messages.updateSuccess"));
    } catch (error) {
      console.error("Failed to update account:", error);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        // Display all validation errors
        Object.keys(errors).forEach(field => {
          const messages = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
          messages.forEach(msg => {
            toast.error(t("messages.validationError", { field, message: msg }));
          });
        });
      } else if (error.response?.data?.message) {
        // Display single error message
        toast.error(error.response.data.message);
      } else {
        // Fallback error message
        toast.error(t("messages.updateError"));
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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => router.back()}
          className="rounded-full shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle>{t("profile.title")}</CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={accountData.avatar} alt={accountData.name} />
              <AvatarFallback className="text-2xl">
                {accountData.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">{accountData.name}</h3>
              <p className="text-sm text-muted-foreground">{accountData.email}</p>
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                {accountData.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Form */}
        <Card className="md:col-span-2 border-0 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle>{t("accountDetails.title")}</CardTitle>
            <CardDescription>{t("accountDetails.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="h-4 w-4 inline mr-2" />
                  {t("fields.fullName")}
                </Label>
                <Input
                  id="name"
                  value={accountData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t("placeholders.name")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  {t("fields.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={accountData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder={t("placeholders.email")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  {t("fields.phone")}
                </Label>
                <Input
                  id="phone"
                  value={accountData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder={t("placeholders.phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  <Shield className="h-4 w-4 inline mr-2" />
                  {t("fields.role")}
                </Label>
                <Input
                  id="role"
                  value={accountData.role}
                  disabled
                  className="bg-muted"
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
                    {t("buttons.saving")}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("buttons.saveChanges")}
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
