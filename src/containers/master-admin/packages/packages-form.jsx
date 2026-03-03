"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/helper/Loader";
import { toast } from "@/lib/toast";
import {
  Save,
  Package,
  StepBack,
  Trash2,
  Tag,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Wallet,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axiosInstance from "@/lib/axios";
import {
  TextField,
  NumberField,
  SelectField,
  TextareaField,
} from "@/components/form-fields";

export default function PackageForm({ isEdit = false, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const packageId = isEdit ? params?.id : undefined;
  const t = useTranslations("masterAdminPackages");

  const BASE_CREDIT_TYPES = [
    { value: "coupon", label: t("form.options.creditType.coupon") },
    { value: "whatsapp ui message", label: t("form.options.creditType.whatsappUI") },
    { value: "whatsapp bi message", label: t("form.options.creditType.whatsappBI") },
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
      description: "",
      price: "",
      credits: "",
      pricePerCredit: "",
      currency: "USD",
      creditType: "coupon",
      customCreditType: "",
      merchantType: "annual",
      sortOrder: 1,
      isActive: "true",
    },
  });

  const formValues = watch();
  const price = watch("price");
  const credits = watch("credits");
  const selectedCreditType = watch("creditType");
  const pricePerCredit = watch("pricePerCredit");
  const selectedMerchantType = watch("merchantType");

  useEffect(() => {
    if (!price || !credits) return;
    const calculated = (Number(price) / Number(credits)).toFixed(2);
    setValue("pricePerCredit", calculated);
  }, [price, credits, setValue]);

  useEffect(() => {
    if (!isEdit || !packageId) return;

    const fetchPackage = async () => {
      try {
        const res = await axiosInstance.get(
          `/wallets/credit-packages/${packageId}`,
        );
        const data = res?.data?.data;
        if (!data) return;

        // Prevent super admin from editing paid ads packages (agent-only)
        if (data.credit_type === "paid ads") {
          toast.error(t("form.messages.paidAdsRestriction"), {
            closeButton: true,
            duration: false,
          });
          router.push("/master-admin/packages");
          return;
        }

        reset({
          name: data.name,
          description: data.description,
          price: data.price,
          credits: data.credits,
          currency: data.currency,
          creditType: BASE_CREDIT_TYPES.some(
            (opt) => opt.value === data.credit_type,
          )
            ? data.credit_type
            : "custom",
          customCreditType: BASE_CREDIT_TYPES.some(
            (opt) => opt.value === data.credit_type,
          )
            ? ""
            : data.credit_type,
          merchantType: data.merchant_type,
          sortOrder: data.sort_order,
          isActive: data.is_active ? "true" : "false",
        });
      } catch {
        toast.error(t("form.messages.fetchError"), {
          closeButton: true,
          duration: false,
        });
      }
    };

    fetchPackage();
  }, [isEdit, packageId, reset, router, t]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const finalCreditType =
        data.creditType === "custom" ? data.customCreditType : data.creditType;

      const payload = {
        name: data.name,
        description: data.description,
        credits: Number(data.credits),
        credit_type: finalCreditType,
        price: Number(data.price),
        price_per_credit: Number(data.price) / Number(data.credits),
        currency: data.currency,
        merchant_type: data.merchantType,
        is_active: data.isActive === "true",
        sort_order: Number(data.sortOrder),
      };

      if (isEdit && packageId) {
        await axiosInstance.patch(
          `/wallets/credit-packages/${packageId}`,
          payload,
        );
      } else {
        await axiosInstance.post("/wallets/credit-packages", payload);
      }

      toast.success(
        isEdit
          ? t("form.messages.updateSuccess")
          : t("form.messages.createSuccess"),
        {
          closeButton: true,
          duration: false,
        },
      );

      onSuccess?.();
      if (!isEdit) reset();
      router.push("/master-admin/packages");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          (isEdit ? t("form.messages.updateError") : t("form.messages.createError")),
        { closeButton: true, duration: false },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await axiosInstance.delete(`/wallets/credit-packages/${packageId}`, {
        params: { admin_id: session?.user?.adminId },
      });
      toast.success(t("form.messages.deleteSuccess"), {
        closeButton: true,
        duration: false,
      });
      router.push("/master-admin/packages");
    } catch (err) {
      toast.error(err?.response?.data?.message || t("form.messages.deleteError"), {
        closeButton: true,
        duration: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCreditTypeOptions = BASE_CREDIT_TYPES.filter((opt) => {
    if (selectedMerchantType === "temporary") {
      return opt.value === "whatsapp ui message" || opt.value === "coupon";
    }
    return true; // annual → allow all
  });
  useEffect(() => {
    if (
      selectedMerchantType === "temporary" &&
      watch("creditType") === "whatsapp bi message"
    ) {
      setValue("creditType", "whatsapp ui message");
    }
  }, [selectedMerchantType, setValue, watch]);

  return (
    <div className="max-w-full  px-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Form */}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-muted/60 shadow-lg overflow-hidden">
              <CardHeader className="border-b pb-6 px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary/20 shadow-lg">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {isEdit ? t("form.editTitle") : t("form.createTitle")}
                      </CardTitle>
                      <CardDescription>
                        {t("form.subtitle")}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-muted"
                    onClick={() => router.push("/master-admin/packages")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t("form.backButton")}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.identity")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextField
                      label={t("form.fields.packageName")}
                      name="name"
                      placeholder={t("form.fields.packageNamePlaceholder")}
                      register={register}
                      errors={errors}
                      validation={{ required: t("form.validation.nameRequired") }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        label={t("form.fields.price")}
                        name="price"
                        placeholder={t("form.fields.pricePlaceholder")}
                        register={register}
                        errors={errors}
                        validation={{ 
                          required: t("form.validation.priceRequired"), 
                          min: { value: 1, message: t("form.validation.priceMin") }
                        }}
                      />
                      <SelectField
                        label={t("form.fields.currency")}
                        name="currency"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "USD", label: t("form.options.currency.usd") },
                          { value: "PKR", label: t("form.options.currency.pkr") },
                        ]}
                      />
                    </div>
                  </div>

                  <TextareaField
                    label={t("form.fields.description")}
                    name="description"
                    placeholder={t("form.fields.descriptionPlaceholder")}
                    control={control}
                    errors={errors}
                    rules={{ required: t("form.validation.descriptionRequired") }}
                  />
                </div>

                <Separator className="bg-muted/60" />

                {/* Section 2: Credits Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.credits")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <NumberField
                      label={t("form.fields.totalCredits")}
                      name="credits"
                      placeholder={t("form.fields.creditsPlaceholder")}
                      register={register}
                      errors={errors}
                      validation={{ 
                        required: t("form.validation.creditsRequired"), 
                        min: { value: 1, message: t("form.validation.creditsMin") }
                      }}
                    />

                    <div className="relative">
                      <NumberField
                        label={t("form.fields.pricePerCredit")}
                        name="pricePerCredit"
                        register={register}
                        errors={errors}
                        readOnly
                        className="bg-muted/50"
                      />
                      <div className="absolute right-3 top-[34px]">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {t("form.hints.autoCalculated")}
                        </span>
                      </div>
                    </div>

                    <NumberField
                      label={t("form.fields.displayPriority")}
                      name="sortOrder"
                      placeholder={t("form.fields.displayPriorityPlaceholder")}
                      register={register}
                      errors={errors}
                      validation={{ required: true }}
                    />
                  </div>
                </div>

                <Separator className="bg-muted/60" />

                {/* Section 3: Classification */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StepBack className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {t("form.sections.classification")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectField
                      label={t("form.fields.merchantPlan")}
                      name="merchantType"
                      control={control}
                      errors={errors}
                      options={[
                        { value: "annual", label: t("form.options.merchantType.annual") },
                        { value: "temporary", label: t("form.options.merchantType.temporary") },
                      ]}
                    />
                    <SelectField
                      label={t("form.fields.creditType")}
                      name="creditType"
                      control={control}
                      errors={errors}
                      options={filteredCreditTypeOptions}
                    />

                    <SelectField
                      label={t("form.fields.packageStatus")}
                      name="isActive"
                      control={control}
                      errors={errors}
                      options={[
                        { value: "true", label: t("form.options.status.active") },
                        { value: "false", label: t("form.options.status.inactive") },
                      ]}
                    />
                  </div>

                  {selectedCreditType === "custom" && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <TextField
                        label={t("form.fields.customCreditType")}
                        name="customCreditType"
                        placeholder={t("form.fields.customCreditTypePlaceholder")}
                        register={register}
                        errors={errors}
                        validation={{
                          required: t("form.validation.customTypeRequired"),
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>

              <div className="flex justify-between items-center p-8 border-t bg-muted/20">
                <div>
                  {isEdit && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={submitting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("form.buttons.delete")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("form.deleteDialog.title")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("form.deleteDialog.description", { name: formValues.name || "this package" })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("form.deleteDialog.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("form.deleteDialog.confirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/master-admin/packages")}
                  >
                    {t("form.buttons.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="min-w-[150px] shadow-lg shadow-primary/20"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2 animate-spin" />
                        {t("form.buttons.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEdit ? t("form.buttons.update") : t("form.buttons.save")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        {/* Right Side: Preview */}
        <div className="w-[380px] hidden lg:block sticky top-10">
          <div className="mb-4 flex items-center gap-2 px-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("form.preview.title")}
            </h3>
          </div>

          {(() => {
            const getCategoryTheme = (type) => {
              const t_type = type?.toLowerCase() || "";
              if (t_type.includes("coupon"))
                return {
                  label: t("form.preview.categories.coupon"),
                  icon: <CheckCircle2 className="h-4 w-4" />,
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                  badge: "bg-blue-100/80 text-blue-700 border-blue-200",
                };
              if (t_type.includes("whatsapp"))
                return {
                  label: t("form.preview.categories.whatsapp"),
                  icon: <Sparkles className="h-4 w-4" />,
                  bg: "bg-emerald-50",
                  text: "text-emerald-600",
                  badge:
                    "bg-emerald-100/80 text-emerald-700 border-emerald-200",
                };
              if (t_type.includes("ad"))
                return {
                  label: t("form.preview.categories.paidAds"),
                  icon: <Wallet className="h-4 w-4" />,
                  bg: "bg-violet-50",
                  text: "text-violet-600",
                  badge: "bg-violet-100/80 text-violet-700 border-violet-200",
                };
              return {
                label: t("form.preview.categories.standard"),
                icon: <Zap className="h-4 w-4" />,
                bg: "bg-slate-50",
                text: "text-slate-600",
                badge: "bg-slate-100 text-slate-700 border-slate-200",
              };
            };
            const theme = getCategoryTheme(
              formValues.creditType === "custom"
                ? formValues.customCreditType
                : formValues.creditType,
            );

            return (
              <div className="group relative flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Header Section from Purchase Index */}
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-colors duration-300",
                        theme.bg,
                        theme.text,
                      )}
                    >
                      {theme.icon}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide border",
                        theme.badge,
                      )}
                    >
                      {theme.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 truncate">
                      {formValues.name || t("form.preview.title")}
                    </h3>
                    <Badge
                      className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                        formValues.merchantType?.toLowerCase() === "annual"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {formValues.merchantType || "Standard"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1 font-medium">
                    {formValues.description || t("form.preview.enhancedFeatures")}
                  </p>
                </div>

                {/* Content Section from Purchase Index */}
                <div className="p-6 pt-0 flex-1 flex flex-col">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {formValues.currency === "PKR" ? "Rs" : "$"}{" "}
                        {Number(formValues.price || 0).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-widest">
                      {formValues.currency === "PKR" ? "Rs" : "$"}{" "}
                      {formValues.pricePerCredit || "0.00"} {t("columns.perCredit")}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="font-medium text-slate-700">
                        {formValues.credits || "0"} {t("form.preview.baseCredits")}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-xl font-semibold transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-[1.02]"
                    disabled
                  >
                    {t("form.preview.getStarted")}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>

                {/* Status Overlay */}
                {formValues.isActive === "false" && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rotate-[-10deg]">
                    <div className="bg-red-500 text-white px-8 py-2 font-bold text-xl shadow-2xl skew-x-[-15deg] border-4 border-white tracking-tight">
                      {t("form.preview.hiddenDraft")}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
