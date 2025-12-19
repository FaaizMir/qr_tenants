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
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { ShieldCheck, Globe, Save } from "lucide-react";
import {
  TextField,
  EmailField,
  PhoneField,
  PasswordField,
} from "@/components/form-fields";

const AgentForm = ({ agentId, isEdit = false }) => {
  const router = useRouter();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

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
      email: "",
      phone: "",
      domain: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isEdit && agentId) {
      // Simulated fetch for edit mode
      const dummy = {
        name: "Imran Sikandar",
        email: "imran@example.com",
        phone: "+1-555-1001",
        domain: "imran.qr-app.com",
      };
      reset({ ...dummy, password: "", confirmPassword: "" });
    }
  }, [isEdit, agentId, reset]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsFormSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success(
        isEdit ? "Agent updated successfully" : "Agent created successfully"
      );
      router.push("/agents");
    } catch (error) {
      console.error("Error saving agent:", error);
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} agent`
      );
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  {isEdit ? "Edit Agent" : "Add Agent Manually"}
                </CardTitle>
                <CardDescription>
                  {isEdit
                    ? "Update agent credentials and contact details"
                    : "Create a new agent and assign tenant access later"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Full Name"
                name="name"
                placeholder="John Doe"
                register={register}
                errors={errors}
                validation={{
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                }}
              />

              <EmailField
                label="Email Address"
                name="email"
                placeholder="agent@example.com"
                register={register}
                errors={errors}
                validation={{
                  required: "Email is required",
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhoneField
                label="Phone Number"
                name="phone"
                placeholder="+1 555 0100"
                control={control}
                errors={errors}
                validation={{ required: false }}
              />

              <TextField
                label="Custom Domain (optional)"
                name="domain"
                placeholder="agent.mybrand.com"
                register={register}
                errors={errors}
                validation={{ required: false }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordField
                label="Password"
                name="password"
                placeholder="Enter password"
                register={register}
                errors={errors}
                validation={{
                  required: !isEdit && "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                }}
              />

              <PasswordField
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm password"
                register={register}
                errors={errors}
                validation={{
                  required: !isEdit && "Confirm your password",
                }}
              />
            </div>
          </CardContent>
        </Card>

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
                {isEdit ? "Update Agent" : "Create Agent"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgentForm;

