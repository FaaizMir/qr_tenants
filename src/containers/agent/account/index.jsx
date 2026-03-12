"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  Key,
  ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AddressAutocomplete } from "@/components/common/address-autocomplete";

export default function AgentAccountContainer() {
  const t = useTranslations("agentAccount");
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
    company_name: "",
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
          company_name: data.company_name || "",
        });
      } catch (error) {
        console.error("Failed to fetch account data:", error);

        // Handle fetch errors
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;

          const translateErrorMessage = (field, message) => {
            if (!message || typeof message !== 'string') {
              return message;
            }

            // Enhanced pattern matching for common validation errors
            const patterns = {
              "should not be empty": "empty",
              "cannot be empty": "empty",
              "is required": "required",
              "required": "required",
              "must be a valid email": "email",
              "invalid email": "email",
              "email is invalid": "email",
              "already exists": "unique",
              "already registered": "unique",
              "already in use": "unique",
              "is invalid": "invalid",
              "invalid": "invalid",
              "cannot be blank": "cannotBeBlank",
              "is too short": "tooShort",
              "too short": "tooShort",
              "is too long": "tooLong",
              "too long": "tooLong",
              "must be a number": "mustBeNumber",
              "must be a string": "mustBeString",
              "invalid format": "invalidFormat",
              "invalid characters": "invalidCharacters",
              "must be at least": "tooShort",
              "cannot exceed": "tooLong",
              "must not exceed": "tooLong"
            };

            // Check for exact field-specific patterns first
            const lowerMessage = message.toLowerCase();
            for (const [pattern, key] of Object.entries(patterns)) {
              if (lowerMessage.includes(pattern.toLowerCase())) {
                // Try field-specific translation first with safe fallback
                try {
                  const fieldSpecificTranslation = t(`errors.validation.${field}.${key}`, { defaultValue: null });
                  if (fieldSpecificTranslation) {
                    return fieldSpecificTranslation;
                  }
                } catch (e) {
                  // Continue to general validation message
                }
                
                // Fall back to general validation message with safe fallback
                try {
                  const generalTranslation = t(`validation.messages.${key}`, { defaultValue: null });
                  if (generalTranslation) {
                    return generalTranslation;
                  }
                } catch (e) {
                  // Continue to return original message
                }
              }
            }

            return message;
          };

          Object.keys(errors).forEach((field) => {
            const messages = Array.isArray(errors[field])
              ? errors[field]
              : [errors[field]];
            
            let fieldName;
            try {
              fieldName = t(`validation.fieldNames.${field}`) || field;
            } catch (e) {
              fieldName = field;
            }
            
            messages.forEach((msg) => {
              if (msg && typeof msg === "string") {
                const translatedMessage = translateErrorMessage(field, msg);
                try {
                  toast.error(
                    t("messages.validationError", {
                      field: fieldName,
                      message: translatedMessage,
                    }),
                  );
                } catch (e) {
                  // Fallback to simple error message
                  toast.error(`${fieldName}: ${translatedMessage}`);
                }
              }
            });
          });
        } else if (error.response?.data?.message) {
          // Handle business logic errors
          const errorMessage = error.response.data.message;
          const statusCode = error.response?.status;
          
          // Try to translate common business errors with safe fallback
          try {
            const businessErrorKey = `errors.business.${errorMessage.toLowerCase().replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`;
            const businessTranslation = t(businessErrorKey, { defaultValue: null });
            
            if (businessTranslation) {
              toast.error(businessTranslation);
              return;
            }
          } catch (e) {
            // Continue to network error handling
          }

          // Try network error translations based on status code
          let networkErrorKey = null;
          switch (statusCode) {
            case 400:
              networkErrorKey = "errors.network.badRequest";
              break;
            case 401:
              networkErrorKey = "errors.network.unauthorized";
              break;
            case 403:
              networkErrorKey = "errors.network.forbidden";
              break;
            case 404:
              networkErrorKey = "errors.network.notFound";
              break;
            case 409:
              networkErrorKey = "errors.network.conflict";
              break;
            case 429:
              networkErrorKey = "errors.network.tooManyRequests";
              break;
            case 500:
              networkErrorKey = "errors.network.internalServerError";
              break;
            case 502:
              networkErrorKey = "errors.network.badGateway";
              break;
            case 503:
              networkErrorKey = "errors.network.serviceUnavailable";
              break;
            case 504:
              networkErrorKey = "errors.network.gatewayTimeout";
              break;
            default:
              networkErrorKey = "errors.network.serverError";
          }
          
          try {
            if (networkErrorKey) {
              toast.error(t(networkErrorKey));
            } else {
              toast.error(errorMessage);
            }
          } catch (e) {
            toast.error(errorMessage);
          }
        } else {
          // Handle network errors
          if (error.code === 'ECONNABORTED') {
            try {
              toast.error(t("errors.network.timeout"));
            } catch (e) {
              toast.error("Request timed out. Please try again.");
            }
          } else if (error.message === 'Network Error') {
            try {
              toast.error(t("errors.network.connectionFailed"));
            } catch (e) {
              toast.error("Connection failed. Please check your internet connection.");
            }
          } else {
            try {
              toast.error(t("messages.fetchError"));
            } catch (e) {
              toast.error("Failed to load account information");
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [adminId, router]);

  const handleInputChange = (field, value) => {
    setAccountData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (locationData) => {
    setAccountData((prev) => ({
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
        company_name: accountData.company_name,
      };

      // Only include stripe_secret_key if it's been changed (not the masked value)
      if (
        accountData.stripeSecretKey &&
        accountData.stripeSecretKey !== maskedStripeKey
      ) {
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
        },
      });

      try {
        toast.success(t("messages.updateSuccess"));
      } catch (e) {
        toast.success("Account updated successfully");
      }
    } catch (error) {
      console.error("Failed to update account:", error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        const translateErrorMessage = (field, message) => {
          if (!message || typeof message !== 'string') {
            return message;
          }

          // Enhanced pattern matching for common validation errors
          const patterns = {
            "should not be empty": "empty",
            "cannot be empty": "empty",
            "is required": "required",
            "required": "required",
            "must be a valid email": "email",
            "invalid email": "email",
            "email is invalid": "email",
            "already exists": "unique",
            "already registered": "unique",
            "already in use": "unique",
            "is invalid": "invalid",
            "invalid": "invalid",
            "cannot be blank": "cannotBeBlank",
            "is too short": "tooShort",
            "too short": "tooShort",
            "is too long": "tooLong",
            "too long": "tooLong",
            "must be a number": "mustBeNumber",
            "must be a string": "mustBeString",
            "invalid format": "invalidFormat",
            "invalid characters": "invalidCharacters",
            "must be at least": "tooShort",
            "cannot exceed": "tooLong",
            "must not exceed": "tooLong"
          };

          // Check for exact field-specific patterns first
          const lowerMessage = message.toLowerCase();
          for (const [pattern, key] of Object.entries(patterns)) {
            if (lowerMessage.includes(pattern.toLowerCase())) {
              // Try field-specific translation first with safe fallback
              try {
                const fieldSpecificTranslation = t(`errors.validation.${field}.${key}`, { defaultValue: null });
                if (fieldSpecificTranslation) {
                  return fieldSpecificTranslation;
                }
              } catch (e) {
                // Continue to general validation message
              }
              
              // Fall back to general validation message with safe fallback
              try {
                const generalTranslation = t(`validation.messages.${key}`, { defaultValue: null });
                if (generalTranslation) {
                  return generalTranslation;
                }
              } catch (e) {
                // Continue to return original message
              }
            }
          }

          return message;
        };

        // Display all validation errors
        Object.keys(errors).forEach((field) => {
          const messages = Array.isArray(errors[field])
            ? errors[field]
            : [errors[field]];
          
          let fieldName;
          try {
            fieldName = t(`validation.fieldNames.${field}`) || field;
          } catch (e) {
            fieldName = field;
          }
          
          messages.forEach((msg) => {
            if (msg && typeof msg === "string") {
              const translatedMessage = translateErrorMessage(field, msg);
              try {
                toast.error(
                  t("messages.validationError", {
                    field: fieldName,
                    message: translatedMessage,
                  }),
                );
              } catch (e) {
                // Fallback to simple error message
                toast.error(`${fieldName}: ${translatedMessage}`);
              }
            }
          });
        });
      } else if (error.response?.data?.message) {
        // Handle business logic errors
        const errorMessage = error.response.data.message;
        const statusCode = error.response?.status;
        
        // Try to translate common business errors with predefined patterns
        const businessErrorPatterns = {
          "account not found": "accountNotFound",
          "account suspended": "accountSuspended", 
          "account inactive": "accountInactive",
          "admin not found": "adminNotFound",
          "insufficient permissions": "insufficientPermissions",
          "session expired": "sessionExpired",
          "stripe key invalid": "stripeKeyInvalid",
          "invalid stripe key": "stripeKeyInvalid",
          "stripe key test in production": "stripeKeyTestInProduction",
          "stripe key live in development": "stripeKeyLiveInDevelopment",
          "key must start with sk_test_": "stripeKeyInvalid",
          "key must start with sk_live_": "stripeKeyInvalid",
          "must start with sk_": "stripeKeyInvalid",
          "invalid stripe secret key format": "stripeKeyInvalid",
          "email already verified": "emailAlreadyVerified",
          "email not verified": "emailNotVerified",
          "phone already verified": "phoneAlreadyVerified",
          "phone not verified": "phoneNotVerified",
          "account locked": "accountLocked",
          "maintenance mode": "maintenanceMode",
          "quota exceeded": "quotaExceeded",
          "invalid credentials": "invalidCredentials",
          "token expired": "tokenExpired",
          "duplicate entry": "duplicateEntry",
          "resource not found": "resourceNotFound",
          "operation not allowed": "operationNotAllowed",
          "data integrity error": "dataIntegrityError"
        };

        let businessTranslated = false;
        const lowerErrorMessage = errorMessage.toLowerCase();
        
        for (const [pattern, key] of Object.entries(businessErrorPatterns)) {
          if (lowerErrorMessage.includes(pattern)) {
            try {
              const businessTranslation = t(`errors.business.${key}`, { defaultValue: null });
              if (businessTranslation) {
                toast.error(businessTranslation);
                businessTranslated = true;
                break;
              }
            } catch (e) {
              // Continue to next pattern
            }
          }
        }
        
        if (businessTranslated) {
          return;
        }
        
        // Try network error translations based on status code
        let networkErrorKey = null;
        switch (statusCode) {
          case 400:
            networkErrorKey = "errors.network.badRequest";
            break;
          case 401:
            networkErrorKey = "errors.network.unauthorized";
            break;
          case 403:
            networkErrorKey = "errors.network.forbidden";
            break;
          case 404:
            networkErrorKey = "errors.network.notFound";
            break;
          case 409:
            networkErrorKey = "errors.network.conflict";
            break;
          case 429:
            networkErrorKey = "errors.network.tooManyRequests";
            break;
          case 500:
            networkErrorKey = "errors.network.internalServerError";
            break;
          case 502:
            networkErrorKey = "errors.network.badGateway";
            break;
          case 503:
            networkErrorKey = "errors.network.serviceUnavailable";
            break;
          case 504:
            networkErrorKey = "errors.network.gatewayTimeout";
            break;
          default:
            networkErrorKey = "errors.network.serverError";
        }
        
        try {
          if (networkErrorKey) {
            toast.error(t(networkErrorKey));
          } else {
            toast.error(errorMessage);
          }
        } catch (e) {
          toast.error(errorMessage);
        }
      } else {
        // Handle network errors
        if (error.code === 'ECONNABORTED') {
          try {
            toast.error(t("errors.network.timeout"));
          } catch (e) {
            toast.error("Request timed out. Please try again.");
          }
        } else if (error.message === 'Network Error') {
          try {
            toast.error(t("errors.network.connectionFailed"));
          } catch (e) {
            toast.error("Connection failed. Please check your internet connection.");
          }
        } else {
          try {
            toast.error(t("messages.updateError"));
          } catch (e) {
            toast.error("Failed to update account");
          }
        }
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
            <div className="text-center">
              <h3 className="font-semibold text-lg">{accountData.name}</h3>
              <p className="text-sm text-muted-foreground">
                {accountData.email}
              </p>
              <div className="mt-2">
                <Badge
                  variant={accountData.hasStripeKey ? "default" : "secondary"}
                >
                  {accountData.hasStripeKey
                    ? t("profile.stripeConnected")
                    : t("profile.noStripeKey")}
                </Badge>
              </div>
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
                <Label htmlFor="company_name">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  {t("fields.companyName")}
                </Label>
                <Input
                  id="company_name"
                  value={accountData.company_name}
                  onChange={(e) =>
                    handleInputChange("company_name", e.target.value)
                  }
                  placeholder={t("placeholders.companyName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  {t("fields.city")}
                </Label>
                <Input
                  id="city"
                  value={accountData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={t("placeholders.city")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  {t("fields.country")}
                </Label>
                <Input
                  id="country"
                  value={accountData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder={t("placeholders.country")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stripeSecretKey">
                  <Key className="h-4 w-4 inline mr-2" />
                  {t("fields.stripeSecretKey")}
                </Label>
                <Input
                  id="stripeSecretKey"
                  type="password"
                  value={accountData.stripeSecretKey}
                  onChange={(e) =>
                    handleInputChange("stripeSecretKey", e.target.value)
                  }
                  placeholder={
                    maskedStripeKey
                      ? t("placeholders.stripeKeyExisting", {
                          maskedKey: maskedStripeKey,
                        })
                      : t("placeholders.stripeKeyNew")
                  }
                />
                {accountData.hasStripeKey && (
                  <p className="text-xs text-muted-foreground">
                    {t("hints.stripeKeyMasked")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  <MapPin className="h-4 w-4 inline mr-2" />
                  {t("fields.address")}
                </Label>
                <AddressAutocomplete
                  label={t("fields.address")}
                  name="address"
                  value={accountData.address}
                  onChange={handleAddressChange}
                  placeholder={t("placeholders.address")}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
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
