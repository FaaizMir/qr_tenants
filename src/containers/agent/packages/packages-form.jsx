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
import { toast } from "@/lib/toast";
import {
  Save,
  Target,
  StepBack,
  Trash2,
  Tag,
  Layers,
  ArrowRight,
  CheckCircle2,
  Wallet,
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
      merchantType: "annual",
      sortOrder: 1,
      isActive: "true",
    },
  });

  const formValues = watch();
  const price = watch("price");
  const credits = watch("credits");
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

        // Verify this is a paid ads package
        if (data.credit_type !== 'paid ads') {
          toast.error("You can only edit paid ads packages", {
            closeButton: true,
            duration: false,
          });
          router.push("/agent/packages");
          return;
        }

        reset({
          name: data.name,
          description: data.description,
          price: data.price,
          credits: data.credits,
          currency: data.currency,
          merchantType: data.merchant_type,
          sortOrder: data.sort_order,
          isActive: data.is_active ? "true" : "false",
        });
      } catch {
        toast.error("Failed to load package details", {
          closeButton: true,
          duration: false,
        });
      }
    };

    fetchPackage();
  }, [isEdit, packageId, reset, router]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        credits: Number(data.credits),
        credit_type: "paid ads", // Always paid ads for agents
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
          ? "Package updated successfully"
          : "Package created successfully",
        {
          closeButton: true,
          duration: false,
        },
      );

      onSuccess?.();
      if (!isEdit) reset();
      router.push("/agent/packages");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} package`,
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
      toast.success("Package deleted successfully", {
        closeButton: true,
        duration: false,
      });
      router.push("/agent/packages");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete package", {
        closeButton: true,
        duration: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

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
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">
                        {isEdit ? "Edit Paid Ads Package" : "Create Paid Ads Package"}
                      </CardTitle>
                      <CardDescription>
                        Define pricing and credits for paid advertising campaigns.
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
                {/* Info Banner */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-blue-900">Paid Ads Credit Package</h4>
                      <p className="text-xs text-blue-700">This package type is specifically for paid advertising campaigns</p>
                    </div>
                  </div>
                </div>

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
                      placeholder="e.g. Premium Ads Bundle"
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField
                      label="Merchant Plan"
                      name="merchantType"
                      control={control}
                      errors={errors}
                      options={[
                        { value: "annual", label: "Annual / Premium" },
                        { value: "temporary", label: "Temporary / Basic" },
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

          <div className="group relative flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header Section */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300">
                  <Wallet className="h-4 w-4" />
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide border bg-blue-100/80 text-blue-700 border-blue-200"
                >
                  Paid Ads
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 truncate">
                  {formValues.name || "Package Title"}
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
                {formValues.description || "Enhanced advertising capacity"}
              </p>
            </div>

            {/* Content Section */}
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
                  {formValues.pricePerCredit || "0.00"} per credit
                </p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="font-medium text-slate-700">
                    {formValues.credits || "0"} Advertising Credits
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 rounded-xl font-semibold transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-[1.02]"
                disabled
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Status Overlay */}
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
