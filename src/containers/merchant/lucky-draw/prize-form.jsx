"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { toast } from "@/lib/toast";
import axiosInstance from "@/lib/axios";
import UniversalComboBoxField from "@/components/form-fields/universal-combobox-field";
import { TextField, NumberField, SelectField } from "@/components/form-fields";

export default function PrizeForm({ isEdit = false }) {
  const t = useTranslations("merchantLuckyDraw.form");
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
            `/coupon-batches/${prize.batch_id}`,
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
        toast.error(t("toasts.loadFailed"));
      }
    };

    fetchPrize();
  }, [isEdit, prizeId, setValue, t]);

  const handleCancel = () => {
    router.push("/merchant/lucky-draw");
  };

  const onSubmit = async (data) => {
    if (!merchantId) {
      toast.error(t("toasts.noMerchantId"));
      return;
    }

    if (!data.batch_id) {
      toast.error(t("toasts.noBatchSelected"));
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
          Patchpayload,
        );
        toast.success(t("toasts.updateSuccess"));
      } else {
        // Create new prize
        await axiosInstance.post("/lucky-draw/prizes", Postpayload);
        toast.success(t("toasts.createSuccess"));
      }

      router.push("/merchant/lucky-draw");
    } catch (err) {
      toast.error(err?.response?.data?.message || t("toasts.saveFailed"));
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
            {isEdit ? t("editTitle") : t("createTitle")}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? t("editSubtitle") : t("createSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? t("cardTitle.edit") : t("cardTitle.create")}</CardTitle>
              <CardDescription>
                {isEdit ? t("cardDescription.edit") : t("cardDescription.create")}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label={t("fields.prizeName.label")}
                    name="prize_name"
                    register={register}
                    errors={errors}
                    validation={{ required: t("fields.prizeName.required") }}
                  />

                  <SelectField
                    label={t("fields.prizeType.label")}
                    name="prize_type"
                    control={control}
                    errors={errors}
                    options={[{ value: "coupon", label: t("fields.prizeType.options.coupon") }]}
                  />
                </div>

                <TextField
                  label={t("fields.prizeDescription.label")}
                  name="prize_description"
                  register={register}
                  errors={errors}
                />

                <UniversalComboBoxField
                  label={t("fields.couponBatch.label")}
                  name="batch_id"
                  control={control}
                  errors={errors}
                  validation={{ required: t("fields.couponBatch.required") }}
                  placeholder={t("fields.couponBatch.placeholder")}
                  searchPlaceholder={t("fields.couponBatch.searchPlaceholder")}
                  emptyMessage={t("fields.couponBatch.emptyMessage")}
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
                    label={t("fields.probability.label")}
                    name="probability"
                    register={register}
                    errors={errors}
                    validation={{
                      required: t("fields.probability.required"),
                      min: { value: 0, message: t("fields.probability.min") },
                      max: { value: 100, message: t("fields.probability.max") },
                    }}
                  />

                  <NumberField
                    label={t("fields.dailyLimit.label")}
                    name="daily_limit"
                    register={register}
                    errors={errors}
                    validation={{ required: true, min: 1 }}
                  />

                  <NumberField
                    label={t("fields.totalLimit.label")}
                    name="total_limit"
                    register={register}
                    errors={errors}
                    validation={{ required: true, min: 1 }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberField
                    label={t("fields.sortOrder.label")}
                    name="sort_order"
                    register={register}
                    errors={errors}
                    validation={{ required: true }}
                  />

                  <SelectField
                    label={t("fields.status.label")}
                    name="is_active"
                    control={control}
                    errors={errors}
                    options={[
                      { value: "true", label: t("fields.status.options.active") },
                      { value: "false", label: t("fields.status.options.inactive") },
                    ]}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-4 bg-muted/20">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t("buttons.cancel")}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    isEdit ? t("buttons.updating") : t("buttons.creating")
                  ) : (
                    <>{isEdit ? t("buttons.update") : t("buttons.create")}</>
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
                {t("importantNotes.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-800/80 space-y-2">
              <p>• {t("importantNotes.note1")}</p>
              <p>• {t("importantNotes.note2")}</p>
              <p>• {t("importantNotes.note3")}</p>
              <p>
                • {t("importantNotes.note4")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
