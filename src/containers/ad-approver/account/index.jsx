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
import { Loader2, Save, User, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AdApproverAccountContainer() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "ad_approver",
  });

  useEffect(() => {
    if (!userId) {
      router.push("/");
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
          role: data.role || "ad_approver",
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
  }, [userId, router]);

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
                <Badge variant="secondary" className="capitalize">
                  Ad Approver
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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

              <div className="space-y-2 md:col-span-2">
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
