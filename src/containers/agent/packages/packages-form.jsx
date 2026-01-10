"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
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
import { toast } from "sonner";
import {
  Save,
  Package,
  StepBack,
  ArrowLeft,
  Trash2,
  Tag,
  Layers,
} from "lucide-react";
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

const creditTypeOptions = [
  { value: "coupon", label: "Coupon" },
  { value: "paid ads", label: "Paid Ads" },
  { value: "whatsapp message", label: "WhatsApp Message" },
];

export default function PackageForm({ isEdit = false, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const packageId = isEdit ? params?.id : undefined;

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
      creditType: "general",
      customCreditType: "",
      merchantType: "temporary",
      sortOrder: 1,
      isActive: "true",
    },
  });

  const formValues = watch();
  const price = watch("price");
  const credits = watch("credits");
  const selectedCreditType = watch("creditType");
  const pricePerCredit = watch("pricePerCredit");

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
          `/wallets/credit-packages/${packageId}`
        );
        const data = res?.data?.data;
        if (!data) return;

        reset({
          name: data.name,
          description: data.description,
          price: data.price,
          credits: data.credits,
          currency: data.currency,
          creditType: creditTypeOptions.some(
            (opt) => opt.value === data.credit_type
          )
            ? data.credit_type
            : "custom",
          customCreditType: creditTypeOptions.some(
            (opt) => opt.value === data.credit_type
          )
            ? ""
            : data.credit_type,
          merchantType: data.merchant_type,
          sortOrder: data.sort_order,
          isActive: data.is_active ? "true" : "false",
        });
      } catch {
        toast.error("Failed to load package details");
      }
    };

    fetchPackage();
  }, [isEdit, packageId, reset]);

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
        admin_id: session?.user?.adminId,
        is_active: data.isActive === "true",
        sort_order: Number(data.sortOrder),
      };

      if (isEdit && packageId) {
        await axiosInstance.patch(
          `/wallets/credit-packages/${packageId}`,
          payload
        );
      } else {
        await axiosInstance.post("/wallets/credit-packages", payload);
      }

      toast.success(
        isEdit ? "Package updated successfully" : "Package created successfully"
      );

      onSuccess?.();
      if (!isEdit) reset();
      router.push("/agent/packages");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} package`
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
      toast.success("Package deleted successfully");
      router.push("/agent/packages");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete package");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-full py-10 px-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Side: Form */}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-muted/60 shadow-lg overflow-hidden">
              <CardHeader className="bg-muted/30 border-b pb-6 px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-primary/20 shadow-lg">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {isEdit ? "Edit Credit Package" : "Create New Package"}
                      </CardTitle>
                      <CardDescription>
                        Define pricing and credit limits for merchants.
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hover:bg-muted"
                    onClick={() => router.push("/agent/packages")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Section 1: Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Identity & Pricing
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextField
                      label="Package Name"
                      name="name"
                      placeholder="e.g. Premium Growth Bundle"
                      register={register}
                      errors={errors}
                      validation={{ required: "Package name is required" }}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        label="Price"
                        name="price"
                        placeholder="0.00"
                        register={register}
                        errors={errors}
                        validation={{ required: "Price is required", min: 1 }}
                      />
                      <SelectField
                        label="Currency"
                        name="currency"
                        control={control}
                        errors={errors}
                        options={[
                          { value: "USD", label: "USD ($)" },
                          { value: "PKR", label: "PKR (Rs)" },
                        ]}
                      />
                    </div>
                  </div>

                  <TextareaField
                    label="Description"
                    name="description"
                    placeholder="Short summary of what this package offers..."
                    control={control}
                    errors={errors}
                    rules={{ required: "Description is required" }}
                  />
                </div>

                <Separator className="bg-muted/60" />

                {/* Section 2: Credits Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      Credits & Allocation
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <NumberField
                      label="Total Credits"
                      name="credits"
                      register={register}
                      errors={errors}
                      validation={{ required: "Credits are required", min: 1 }}
                    />

                    <div className="relative">
                      <NumberField
                        label="Price per Credit"
                        name="pricePerCredit"
                        register={register}
                        errors={errors}
                        readOnly
                        className="bg-muted/50"
                      />
                      <div className="absolute right-3 top-[34px]">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          AUTO
                        </span>
                      </div>
                    </div>

                    <NumberField
                      label="Display Priority"
                      name="sortOrder"
                      placeholder="Pos. in list (1, 2, 3...)"
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
                      Classification
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SelectField
                      label="Credit Type"
                      name="creditType"
                      control={control}
                      errors={errors}
                      options={creditTypeOptions}
                    />

                    <SelectField
                      label="Merchant Plan"
                      name="merchantType"
                      control={control}
                      errors={errors}
                      options={[
                        { value: "temporary", label: "Temporary / Basic" },
                        { value: "annual", label: "Annual / Premium" },
                      ]}
                    />

                    <SelectField
                      label="Package Status"
                      name="isActive"
                      control={control}
                      errors={errors}
                      options={[
                        { value: "true", label: "Active & Visible" },
                        { value: "false", label: "Inactive / Hidden" },
                      ]}
                    />
                  </div>

                  {selectedCreditType === "custom" && (
                    <div className="animate-in fade-in slide-in-from-top-2 pt-2">
                      <TextField
                        label="Specify Custom Credit Type"
                        name="customCreditType"
                        placeholder="e.g. Birthday Special"
                        register={register}
                        errors={errors}
                        validation={{
                          required: "Custom credit type is required",
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
                          Delete Package
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove{" "}
                            <strong>{formValues.name || "this package"}</strong>
                            . This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, delete package
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
                    onClick={() => router.push("/agent/packages")}
                  >
                    Cancel
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEdit ? "Update Package" : "Publish Package"}
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
              Live Preview
            </h3>
          </div>
          <div className="group relative flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[450px]">
            {/* Image/Gradient Area */}
            <div className="h-32 relative bg-linear-to-br from-indigo-600 to-violet-700 p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start w-full">
                <div className="flex gap-2">
                  <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {formValues.creditType || "Credits"}
                  </span>
                  <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Recommended
                  </span>
                </div>
                <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-xl text-white shadow-inner">
                  🚀
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider mb-1">
                  {formValues.credits || "0"} Total Credits
                </p>
                <h3 className="text-white text-xl font-bold leading-tight truncate">
                  {formValues.name || "Package Title"}
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {formValues.currency === "PKR" ? "Rs" : "$"}{" "}
                    {Number(formValues.price || 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {formValues.currency === "PKR" ? "Rs" : "$"}{" "}
                    {formValues.pricePerCredit || "0.00"} / credit
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-[20px] border border-slate-100 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Credits
                  </p>
                  <p className="text-xl font-bold text-slate-700">
                    {formValues.credits || "0"}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-[20px] border border-slate-100 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Type
                  </p>
                  <p className="text-xs font-bold text-slate-700 capitalize text-center leading-tight">
                    {formValues.creditType === "custom"
                      ? formValues.customCreditType
                      : formValues.creditType}
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 italic border-l-4 border-indigo-100 pl-4">
                  "
                  {formValues.description ||
                    "The merchant will see your package description here. Make it compelling to increase sales!"}
                  "
                </p>
              </div>

              <div className="mt-8">
                <div className="w-full h-12 rounded-[20px] bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-xl shadow-slate-200">
                  Buy Package <ArrowRight className="ml-2 w-4 h-4" />
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter">
                  Availability:{" "}
                  <span className="text-slate-900 font-bold">
                    {formValues.merchantType} Plan
                  </span>
                </p>
              </div>
            </div>

            {/* Secondary Badge for Status Inactive */}
            {formValues.isActive === "false" && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rotate-[-10deg]">
                <div className="bg-red-500 text-white px-8 py-2 font-bold text-xl shadow-2xl skew-x-[-15deg] border-4 border-white tracking-tight">
                  HIDDEN / DRAFT
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reuse the same ArrowRight icon since it's used in the preview
function ArrowRight({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}
