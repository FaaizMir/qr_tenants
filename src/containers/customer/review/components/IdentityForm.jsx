import React from "react";
import { User, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { TextField } from "@/components/form-fields/text-field";
import { DateField } from "@/components/form-fields/date-field";
import { PhoneField } from "@/components/form-fields/phone-input";

export const IdentityForm = ({ register, handleSubmit, nextStep, control, errors: formErrors }) => {
    const onSubmit = (data) => {
        nextStep();
    };

    const onError = (errors) => {
        if (errors.name || errors.phone || errors.dob) {
            toast.error("Please fill in all details");
            return;
        }
        if (errors.phone?.type === "minLength") {
            toast.error("Please enter a valid phone number");
            return;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome!</h2>
                <p className="text-muted-foreground">
                    Please tell us about yourself to get started.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                <TextField
                    label="Full Name"
                    name="name"
                    placeholder="John Doe"
                    register={register}
                    errors={formErrors}
                    validation={{ required: "Name is required" }}
                    startIcon={<User />}
                    inputClassName="h-12 text-lg"
                />

                <div className="space-y-2">
                    <Controller
                        name="phone"
                        control={control}
                        rules={{ required: "Phone number is required", minLength: 8 }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <PhoneField
                                label="Phone Number"
                                value={value}
                                onChange={onChange}
                                error={error?.message}
                                placeholder="+1 234 567 890"
                                defaultCountry="US"
                            />
                        )}
                    />
                </div>

                <DateField
                    label="Date of Birth"
                    name="dob"
                    register={register}
                    errors={formErrors}
                    validation={{ required: "Date of Birth is required" }}
                    startIcon={<Calendar />}
                    inputClassName="h-12 text-lg"
                />

                <Button
                    type="submit"
                    className="w-full h-12 text-lg font-medium mt-6 bg-linear-to-r from-primary to-primary-hover hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                >
                    Continue <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </form>
        </div>
    );
};
