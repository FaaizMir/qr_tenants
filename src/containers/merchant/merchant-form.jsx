"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/helper/Loader";
import { toast } from "@/lib/toast";
import { useRouter } from "@/i18n/routing";
import { Store, Save } from "lucide-react";
import { createMerchant, updateMerchant } from "@/lib/services/helper";
import { useSession } from "next-auth/react";
import {
  TextField,
  EmailField,
  PhoneField,
  SelectField,
  NumberField,
  PasswordField,
} from "@/components/form-fields";
import AddressAutocomplete from "@/components/address-autocomplete";

const MerchantForm = ({ merchantId, isEdit = false }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
      latitude: null,
      longitude: null,
      mapUrl: "",
      businessName: "",
      businessType: "",
      merchantType: "annual",
      taxId: "",
      city: "",
      countryRegion: "",
    },
  });
  const name = watch("name");

  // subdomain is not collected from the form; backend will generate it if needed

  // If editing, you can fetch merchant data here and call reset(data).
  // Removed static/dummy data to ensure real backend data is used.
  useEffect(() => {
    if (isEdit && merchantId) {
      // TODO: fetch merchant details and call reset(details)
    }
  }, [isEdit, merchantId, reset]);

  const onSubmit = async (data) => {
    setIsFormSubmitting(true);
    try {
      // build explicit payload matching the API contract
      const currentUser = session?.user;
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "merchant",
        address: data.address || "",
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        map_link: data.mapUrl || "",
        business_name: data.businessName,
        business_type: data.businessType,
        merchant_type: data.merchantType,
        tax_id: data.taxId || "",
        country: data.countryRegion,
        city: data.city,
      };

      let resp;
      if (isEdit && merchantId) {
        resp = await updateMerchant(merchantId, payload);
      } else {
        // debug payload
        try {
          console.debug("Creating merchant payload:", payload);
        } catch (e) {}

        resp = await createMerchant(payload);
        try {
          console.debug("Create merchant response:", resp);
        } catch (e) {}
      }

      toast.success(
        isEdit
          ? "Merchant updated successfully"
          : "Merchant created successfully",
        { closeButton: true, duration: false },
      );
      router.push("/agent/merchants");
    } catch (error) {
      console.error("Error saving merchant:", error);
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} merchant`,
        { closeButton: true, duration: false },
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  {isEdit ? "Edit Merchant" : "Create New Merchant"}
                </CardTitle>
                <CardDescription>
                  {isEdit
                    ? "Update merchant information and settings"
                    : "Add a new merchant tenant to the system"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Merchant Name"
                name="name"
                placeholder="John Merchant"
                register={register}
                errors={errors}
                validation={{
                  required: "Merchant name is required",
                  minLength: {
                    value: 3,
                    message: "Name must be at least 3 characters",
                  },
                }}
              />

              <EmailField
                label="Email Address"
                name="email"
                placeholder="merchant1@example.com"
                register={register}
                errors={errors}
                validation={{ required: "Email is required" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordField
                label="Password"
                name="password"
                placeholder="Enter a secure password"
                register={register}
                errors={errors}
                validation={{
                  required: !isEdit
                    ? "Password is required for new merchants"
                    : false,
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
              />
              <AddressAutocomplete
                label="Address"
                name="address"
                placeholder="Start typing an address..."
                value={watch("address")}
                onChange={(locationData) => {
                  // Update all location-related fields
                  setValue("address", locationData.address);
                  setValue("latitude", locationData.latitude);
                  setValue("longitude", locationData.longitude);
                  setValue("mapUrl", locationData.mapUrl);
                }}
                errors={errors}
                required={false}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="City"
                name="city"
                placeholder="City"
                register={register}
                errors={errors}
                validation={{ required: "City name is required" }}
              />
              <TextField
                label="Country / Region"
                name="countryRegion"
                placeholder="Country / Region"
                register={register}
                errors={errors}
                validation={{ required: "Country name is required" }}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Business Name"
                name="businessName"
                placeholder="Business / Trading Name"
                register={register}
                errors={errors}
                validation={{ required: "Business name is required" }}
              />
              <SelectField
                label="Business Type"
                name="businessType"
                options={[
                  { value: "Food & Beverage", label: "Food & Beverage" },
                  { value: "Retail", label: "Retail" },
                  { value: "Services", label: "Services" },
                  { value: "Health", label: "Health" },
                  { value: "Education", label: "Education" },
                  { value: "Technology", label: "Technology" },
                  { value: "Hospitality", label: "Hospitality" },
                ]}
                control={control}
                errors={errors}
                validation={{ required: "Business type is required" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Tax ID"
                name="taxId"
                placeholder="TAX123456"
                register={register}
                errors={errors}
                validation={{ required: false }}
              />
              <SelectField
                label="Merchant Type"
                name="merchantType"
                options={[
                  { value: "annual", label: "Annual" },
                  { value: "temporary", label: "Temporary" },
                  // { value: "pop-up", label: "Pop-up" },
                ]}
                control={control}
                errors={errors}
                validation={{ required: "Merchant type is required" }}
              />
            </div>
          </CardContent>
        </Card>

        {/* <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <Database className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle>Database Configuration</CardTitle>
                  <CardDescription>
                    Optional: Customize database settings. Leave empty to use
                    defaults.
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Hide Advanced
                  </>
                ) : (
                  <>
                    <Info className="h-4 w-4 mr-2" />
                    Show Advanced
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 mb-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> If not specified, the system will
                  auto-generate database settings based on the merchant name and
                  subdomain.
                </p>
              </div>

              <TextField
                label="Database Name"
                name="databaseName"
                placeholder="tenant_techmart_solutions"
                register={register}
                errors={errors}
                validation={{
                  required: false,
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Database Host"
                  name="databaseHost"
                  placeholder="localhost"
                  register={register}
                  errors={errors}
                  validation={{
                    required: false,
                  }}
                />

                <NumberField
                  label="Database Port"
                  name="databasePort"
                  placeholder="5432"
                  register={register}
                  errors={errors}
                  validation={{
                    required: false,
                    min: {
                      value: 1,
                      message: "Port must be greater than 0",
                    },
                    max: {
                      value: 65535,
                      message: "Port must be less than 65535",
                    },
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Database Username"
                  name="databaseUsername"
                  placeholder="postgres"
                  register={register}
                  errors={errors}
                  validation={{
                    required: false,
                  }}
                />

                <PasswordField
                  label="Database Password"
                  name="databasePassword"
                  placeholder="Enter database password"
                  register={register}
                  errors={errors}
                  validation={{
                    required: false,
                  }}
                />
              </div>
            </CardContent>
          )}
        </Card> */}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isFormSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isFormSubmitting}>
            {isFormSubmitting ? (
              <>
                <LoadingSpinner className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Update Merchant" : "Create Merchant"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MerchantForm;
