"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import UniversalComboBoxField from "@/components/form-fields/universal-combobox-field";
import { TextField, NumberField, SelectField } from "@/components/form-fields";

export default function PrizeForm({ isEdit = false }) {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const merchantId = session?.user?.merchantId;
  const prizeId = isEdit ? params?.id : undefined;

  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      prize_name: "",
      prize_description: "",
      prize_type: "coupon",
      probability: 0,
      daily_limit: 10,
      total_limit: 100,
      is_active: "true",
      sort_order: 1,
      batch_id: "",
    },
  });

  // Fetch prize data if editing
  useEffect(() => {
    if (!isEdit || !prizeId) return;

    const fetchPrize = async () => {
      try {
        const res = await axiosInstance.get(`/lucky-draw/prizes/${prizeId}`);
        const prize = res?.data?.data;

        if (!prize) return;

        // Set form values
        setValue("prize_name", prize.prize_name);
        setValue("prize_description", prize.prize_description);
        setValue("prize_type", prize.prize_type);
        setValue("probability", prize.probability);
        setValue("daily_limit", prize.daily_limit);
        setValue("total_limit", prize.total_limit);
        setValue("is_active", prize.is_active ? "true" : "false");
        setValue("sort_order", prize.sort_order);
        setValue("batch_id", prize.batch_id);

        // 👉 Fetch batch name using batch_id
        if (prize.batch_id) {
          const batchRes = await axiosInstance.get(
            `/coupon-batches/${prize.batch_id}`
          );

          const batch = batchRes?.data?.data;

          if (batch) {
            setSelectedBatch({
              id: batch.id,
              batch_name: batch.batch_name,
            });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load prize details");
      }
    };

    fetchPrize();
  }, [isEdit, prizeId, setValue]);

  const handleCancel = () => {
    router.push("/merchant/lucky-draw");
  };

  const onSubmit = async (data) => {
    if (!merchantId) {
      toast.error("Merchant ID not found");
      return;
    }

    if (!data.batch_id) {
      toast.error("Please select a coupon batch");
      return;
    }

    setLoading(true);
    try {
      const Postpayload = {
        merchant_id: merchantId,
        batch_id: data.batch_id,
        prize_name: data.prize_name,
        prize_description: data.prize_description,
        prize_type: data.prize_type,
        probability: Number(data.probability),
        daily_limit: Number(data.daily_limit),
        total_limit: Number(data.total_limit),
        is_active: data.is_active === "true",
        sort_order: Number(data.sort_order),
      };
      const Patchpayload = {
        /*  merchant_id: merchantId,
        batch_id: data.batch_id,*/
        prize_name: data.prize_name,
        prize_description: data.prize_description,
        prize_type: data.prize_type,
        probability: Number(data.probability),
        daily_limit: Number(data.daily_limit),
        total_limit: Number(data.total_limit),
        is_active: data.is_active === "true",
        sort_order: Number(data.sort_order),
      };

      if (isEdit && prizeId) {
        // Update existing prize
        await axiosInstance.patch(
          `/lucky-draw/prizes/${prizeId}`,
          Patchpayload
        );
        toast.success("Prize updated successfully!");
      } else {
        // Create new prize
        await axiosInstance.post("/lucky-draw/prizes", Postpayload);
        toast.success("Prize created successfully!");
      }

      router.push("/merchant/lucky-draw");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save prize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Prize" : "Create Prize"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update prize details"
              : "Add a new prize to the lucky draw"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? "Edit Prize" : "Add New Prize"}</CardTitle>
              <CardDescription>
                {isEdit
                  ? "Update the prize information"
                  : "Create a new prize for the lucky draw"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Prize Name"
                    name="prize_name"
                    register={register}
                    errors={errors}
                    validation={{ required: "Prize name is required" }}
                  />

                  <SelectField
                    label="Prize Type"
                    name="prize_type"
                    control={control}
                    errors={errors}
                    options={[
                      { value: "coupon", label: "Coupon" },
                      { value: "discount", label: "Discount" },
                      { value: "free_item", label: "Freebie" },
                      { value: "no_prize", label: "Better Luck Next Time" },
                    ]}
                  />
                </div>

                <TextField
                  label="Prize Description"
                  name="prize_description"
                  register={register}
                  errors={errors}
                />

                <UniversalComboBoxField
                  label="Coupon Batch"
                  name="batch_id"
                  control={control}
                  errors={errors}
                  validation={{ required: "Coupon batch is required" }}
                  placeholder="Select coupon batch..."
                  searchPlaceholder="Search batches..."
                  emptyMessage="No batches found"
                  apiEndpoint="/coupon-batches"
                  dataToStore="batches"
                  valueKey="id"
                  labelKey="batch_name"
                  searchParam="search"
                  selectedItem={selectedBatch}
                  setSelectedItem={setSelectedBatch}
                  disabled={isEdit}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NumberField
                    label="Probability (%)"
                    name="probability"
                    register={register}
                    errors={errors}
                    validation={{
                      required: "Probability is required",
                      min: { value: 0, message: "Min 0%" },
                      max: { value: 100, message: "Max 100%" },
                    }}
                  />

                  <NumberField
                    label="Daily Limit"
                    name="daily_limit"
                    register={register}
                    errors={errors}
                    validation={{ required: true, min: 1 }}
                  />

                  <NumberField
                    label="Total Limit"
                    name="total_limit"
                    register={register}
                    errors={errors}
                    validation={{ required: true, min: 1 }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberField
                    label="Sort Order"
                    name="sort_order"
                    register={register}
                    errors={errors}
                    validation={{ required: true }}
                  />

                  <SelectField
                    label="Status"
                    name="is_active"
                    control={control}
                    errors={errors}
                    options={[
                      { value: "true", label: "Active" },
                      { value: "false", label: "Inactive" },
                    ]}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-4 bg-muted/20">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    isEdit ? (
                      "Updating..."
                    ) : (
                      "Creating..."
                    )
                  ) : (
                    <>{isEdit ? "Update Prize" : "Create Prize"}</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Important Notes Card - Takes 1/3 width */}
        <div className="lg:col-span-1">
          <Card className="bg-yellow-50 border-yellow-200 sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                Important
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-800/80 space-y-2">
              <p>• Total probability must equal 100%</p>
              <p>• Each prize requires a linked coupon batch</p>
              <p>• Daily limits reset at midnight</p>
              <p>
                • If a prize limit is reached, the system will skip to the next
                available prize
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
