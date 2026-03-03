"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
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

export function StaffForm({
  initialData = null,
  isEdit = false,
  role: initialRole = "support_staff",
  // staffId is passed from parent now, but was in props before
  staffId = null,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations("masterAdminStaff");
  const [loading, setLoading] = useState(false);
  const { id: paramId } = useParams();

  // Use passed staffId or paramId
  const finalStaffId = staffId || paramId;

  const STAFF_ROLES = [
    { value: "support_staff", label: t("roles.supportStaff") },
    { value: "ad_approver", label: t("roles.adApprover") },
    { value: "finance_viewer", label: t("roles.financeViewer") },
  ];

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
      role: initialRole,
      is_active: true,
    },
  });

  const isActiveValue = watch("is_active");
  const currentRole = watch("role");

  // Determine endpoint based on role
  const getEndpoint = (role) => {
    switch (role) {
      case "finance_viewer": return "/finance-viewers";
      case "ad_approver": return "/ad-approvers";
      case "support_staff": return "/support-staff";
      default: return "/support-staff";
    }
  };

  useEffect(() => {
    const fetchStaffData = async () => {
      if (isEdit && finalStaffId && !initialData) {
        setLoading(true);
        try {
          const endpoint = getEndpoint(initialRole);
          const response = await axiosInstance.get(`${endpoint}/${finalStaffId}`);

          // Data structure: { data: { ...entity, user: { ... } } }
          const result = response.data?.data || response.data;
          const userData = result.user || {};

          reset({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            password: "",
            role: initialRole, // Keep the role from params
            is_active: userData.is_active ?? true,
            // Add specific fields if needed
          });
        } catch (error) {
          console.error("Failed to fetch staff data:", error);
          toast.error(t("messages.fetchError"));
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStaffData();
  }, [isEdit, finalStaffId, initialData, reset, initialRole]);

  useEffect(() => {
    if (isEdit && initialData) {
      // ... (existing logic for initialData if used)
    }
  }, [isEdit, initialData, reset]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        // role is implied by endpoint
        is_active: data.is_active,
      };

      if (data.password) payload.password = data.password;

      const endpoint = getEndpoint(data.role);

      if (isEdit && finalStaffId) {
        await axiosInstance.patch(`${endpoint}/${finalStaffId}`, payload);
        toast.success(t("messages.updateSuccess"));
      } else {
        await axiosInstance.post(endpoint, payload);
        toast.success(t("messages.createSuccess"));
      }

      router.push("/master-admin/staff");
      router.refresh();
    } catch (error) {
      console.error("Staff form error:", error);
      toast.error(
        error?.response?.data?.message || t("messages.createError"),
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
              {isEdit ? t("form.editTitle") : t("form.createTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? t("form.editSubtitle") : t("form.createSubtitle")}
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
              <CardTitle className="text-lg">{t("form.staffInformation.title")}</CardTitle>
              <CardDescription className="text-xs">
                {t("form.staffInformation.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
            <TextField
              label={t("form.fields.fullName")}
              name="name"
              placeholder={t("form.placeholders.name")}
              register={register}
              errors={errors}
              startIcon={<User className="h-4 w-4" />}
              validation={{ required: t("form.validation.nameRequired") }}
            />

            <EmailField
              label={t("form.fields.emailAddress")}
              name="email"
              placeholder={t("form.placeholders.email")}
              register={register}
              errors={errors}
              startIcon={<Mail className="h-4 w-4" />}
              validation={{ required: t("form.validation.emailRequired") }}
            />

            <PhoneField
              label={t("form.fields.phoneNumber")}
              name="phone"
              control={control}
              errors={errors}
              validation={{ required: t("form.validation.phoneRequired") }}
            />

            <SelectField
              label={t("form.fields.systemRole")}
              name="role"
              control={control}
              errors={errors}
              options={STAFF_ROLES}
              validation={{ required: t("form.validation.roleRequired") }}
            />

            <div className="md:col-span-2">
              <PasswordField
                label={
                  isEdit ? t("form.fields.updatePassword") : t("form.fields.accountPassword")
                }
                name="password"
                placeholder={isEdit ? t("form.placeholders.passwordEdit") : t("form.placeholders.passwordCreate")}
                register={register}
                errors={errors}
                validation={{
                  required: !isEdit ? t("form.validation.passwordRequired") : false,
                  minLength: { value: 8, message: t("form.validation.passwordMinLength") },
                }}
                startIcon={<KeyRound className="h-4 w-4" />}
              />
              {isEdit && (
                <p className="text-[10px] text-amber-600 mt-1 font-medium italic">
                  {t("form.hints.passwordKeepCurrent")}
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
              <CardTitle className="text-lg">{t("form.accountVisibility.title")}</CardTitle>
              <CardDescription className="text-xs">
                {t("form.accountVisibility.description")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <SwitchField
            label={isActiveValue ? t("form.accountVisibility.enabled") : t("form.accountVisibility.disabled")}
            description={
              isActiveValue
                ? t("form.accountVisibility.enabledDescription")
                : t("form.accountVisibility.disabledDescription")
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
            {t("form.buttons.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("form.buttons.savingChanges")}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEdit ? t("form.buttons.updateProfile") : t("form.buttons.createAccount")}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
