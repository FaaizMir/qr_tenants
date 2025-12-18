"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoadingSpinner } from "@/helper/Loader";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { Store, Database, Info, Save, X } from "lucide-react";
import {
  TextField,
  EmailField,
  PhoneField,
  SelectField,
  NumberField,
  PasswordField,
} from "@/components/form-fields";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const MerchantForm = ({ merchantId, isEdit = false }) => {
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      subdomain: "",
      email: "",
      phone: "",
      status: "active",
      // Advanced/Database fields
      databaseName: "",
      databaseHost: "localhost",
      databasePort: 5432,
      databaseUsername: "postgres",
      databasePassword: "",
    },
  });

  const name = watch("name");

  // Auto-generate subdomain from name
  useEffect(() => {
    if (!isEdit && name) {
      const subdomain = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .substring(0, 50);
      reset({ ...watch(), subdomain });
    }
  }, [name, isEdit]);

  useEffect(() => {
    if (isEdit && merchantId) {
      // In real implementation, fetch merchant data here
      // For now, we'll use dummy data
      const dummyMerchant = {
        name: "TechMart Solutions",
        subdomain: "techmart-solutions",
        email: "contact@techmart.com",
        phone: "+1-555-0123",
        status: "active",
        databaseName: "tenant_techmart_solutions",
        databaseHost: "localhost",
        databasePort: 5432,
        databaseUsername: "postgres",
        databasePassword: "",
      };
      reset(dummyMerchant);
    }
  }, [isEdit, merchantId, reset]);

  const onSubmit = async (data) => {
    setIsFormSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In real implementation, make API call here:
      // const endpoint = isEdit ? `/tenants/${merchantId}` : "/tenants";
      // const method = isEdit ? "PATCH" : "POST";
      // await axiosInstance[method.toLowerCase()](endpoint, data);

      toast.success(
        isEdit
          ? "Merchant updated successfully"
          : "Merchant created successfully"
      );
      router.push("/merchants");
    } catch (error) {
      console.error("Error saving merchant:", error);
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} merchant`
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
                placeholder="TechMart Solutions"
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

              <TextField
                label="Subdomain"
                name="subdomain"
                placeholder="techmart-solutions"
                register={register}
                errors={errors}
                validation={{
                  required: "Subdomain is required",
                  minLength: {
                    value: 3,
                    message: "Subdomain must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message:
                      "Subdomain can only contain lowercase letters, numbers, and hyphens",
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EmailField
                label="Email Address"
                name="email"
                placeholder="contact@techmart.com"
                register={register}
                errors={errors}
                validation={{
                  required: false,
                }}
              />

              <PhoneField
                label="Phone Number"
                name="phone"
                placeholder="+1-555-0123"
                control={control}
                errors={errors}
                validation={{
                  required: false,
                }}
              />
            </div>

            <SelectField
              label="Status"
              name="status"
              options={statusOptions}
              control={control}
              errors={errors}
              placeholder="Select status"
              validation={{
                required: false,
              }}
            />
          </CardContent>
        </Card>

        {/* Advanced Database Configuration */}
        <Card className="mb-6">
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
        </Card>

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

