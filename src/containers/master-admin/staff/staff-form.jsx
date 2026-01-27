"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Loader2,
  User,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowLeft,
  Check,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axios";
import {
  TextField,
  EmailField,
  PhoneField,
  SelectField,
  PasswordField,
  SwitchField,
} from "@/components/form-fields";

const STAFF_ROLES = [
  { value: "support_staff", label: "Support Staff" },
  { value: "ad_approver", label: "Ad Approver" },
  { value: "finance_viewer", label: "Finance Viewer" },
];

export function StaffForm({
  initialData = null,
  isEdit = false,
  staffId = null,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

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
      phone: "",
      password: "",
      role: "support_staff",
      is_active: true,
    },
  });

  const isActiveValue = watch("is_active");

  useEffect(() => {
    if (isEdit && initialData) {
      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || initialData.phone_number || "",
        password: "",
        role: initialData.admin_role || initialData.role || "support_staff",
        is_active: initialData.is_active ?? true,
      });
    }
  }, [isEdit, initialData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        admin_role: data.role,
        is_active: data.is_active,
      };

      if (data.password) payload.password = data.password;

      if (isEdit && staffId) {
        await axiosInstance.patch(`/admins/${staffId}`, payload);
        toast.success("Staff profile updated successfully.");
      } else {
        await axiosInstance.post(`/admins`, payload);
        toast.success("Staff account created successfully.");
      }

      router.push("/master-admin/staff");
    } catch (error) {
      console.error("Staff form error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save staff member.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-5xl mx-auto pb-10"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 shadow-sm border-slate-200"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? "Edit Staff Account" : "Create New Staff Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit
                ? "Modify existing administrative privileges."
                : "Assign new roles and access permissions."}
            </p>
          </div>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b py-5 px-6 ">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Staff Information</CardTitle>
              <CardDescription className="text-xs">
                Essential details and contact info.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
            <TextField
              label="Full Name"
              name="name"
              placeholder="e.g. Robert Fox"
              register={register}
              errors={errors}
              startIcon={<User className="h-4 w-4" />}
              validation={{ required: "Full name is required" }}
            />

            <EmailField
              label="Email Address"
              name="email"
              placeholder="staff@platform.com"
              register={register}
              errors={errors}
              startIcon={<Mail className="h-4 w-4" />}
              validation={{ required: "Email is required" }}
            />

            <PhoneField
              label="Phone Number"
              name="phone"
              control={control}
              errors={errors}
            />

            <SelectField
              label="System Role"
              name="role"
              control={control}
              errors={errors}
              options={STAFF_ROLES}
              validation={{ required: "Role is required" }}
            />

            <div className="md:col-span-2">
              <PasswordField
                label={
                  isEdit ? "Update Password (Optional)" : "Account Password"
                }
                name="password"
                placeholder={isEdit ? "••••••••" : "Enter a secure password"}
                register={register}
                errors={errors}
                validation={{
                  required: !isEdit ? "Password is required" : false,
                  minLength: { value: 8, message: "Min 8 characters required" },
                }}
                startIcon={<KeyRound className="h-4 w-4" />}
              />
              {isEdit && (
                <p className="text-[10px] text-amber-600 mt-1 font-medium italic">
                  * Leave blank to keep the current password.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className=" border-b py-5 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Account Visibility</CardTitle>
              <CardDescription className="text-xs">
                Control if this account is active.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <SwitchField
            label={isActiveValue ? "Account Enabled" : "Account Disabled"}
            description={
              isActiveValue
                ? "Staff can log in and manage the platform."
                : "Staff access is currently revoked."
            }
            name="is_active"
            checked={isActiveValue}
            onCheckedChange={(v) => setValue("is_active", v)}
          />
        </CardContent>

        <CardFooter className="flex justify-between items-center  border-t p-6">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.back()}
            className="hover:bg-slate-200/50 text-slate-600 font-medium rounded-xl h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Changes
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEdit ? "Update Profile" : "Create Account"}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
