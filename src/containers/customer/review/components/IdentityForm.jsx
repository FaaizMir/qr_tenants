import React from "react";
import {
    User,
    ArrowRight,
    Calendar,
    Mail,
    MapPin,
    Phone,
    CheckCircle2,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

export const IdentityForm = ({
    register,
    handleSubmit,
    nextStep,
    setValue,
    control,
    errors: formErrors,
}) => {
    const currentGender = useWatch({
        control,
        name: "gender",
    });

    const validateAge = (value) => {
        if (!value) return "Date of Birth is required";
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }
        if (age < 13) return "You must be at least 13 years old";
        if (age > 100) return "Please enter a valid date";
        return true;
    };

    const onSubmit = (data) => {
        if (!data.gender) {
            toast.error("Please select a gender");
            return;
        }
        nextStep();
    };

    const onError = (errors) => {
        const errorMessages = Object.values(errors).map((err) => err.message);
        if (errorMessages.length > 0) {
            toast.error(errorMessages[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4 overflow-hidden">
            <Card className="w-full border-muted/60 shadow-lg">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Welcome!
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Please share a few details to get started.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit(onSubmit, onError)}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        {...register("name", { required: "Name is required" })}
                                        placeholder="e.g. Saboor Samad"
                                        className="pl-10 h-11 border-muted/60 focus:border-primary transition-colors"
                                    />
                                </div>
                                {formErrors.name && (
                                    <p className="text-[10px] text-red-500 font-medium pl-1">
                                        {formErrors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address",
                                            },
                                        })}
                                        placeholder="saboorsamad56@gmail.com"
                                        className="pl-10 h-11 border-muted/60 focus:border-primary transition-colors"
                                    />
                                </div>
                                {formErrors.email && (
                                    <p className="text-[10px] text-red-500 font-medium pl-1">
                                        {formErrors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Date of Birth <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        {...register("dob", {
                                            required: "Date of Birth is required",
                                            validate: validateAge,
                                        })}
                                        className="pl-10 h-11 border-muted/60 focus:border-primary transition-colors"
                                    />
                                </div>
                                {formErrors.dob && (
                                    <p className="text-[10px] text-red-500 font-medium pl-1">
                                        {formErrors.dob.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">
                                    Phone Number <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="tel"
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            minLength: { value: 8, message: "Too short" },
                                            maxLength: { value: 15, message: "Too long" },
                                        })}
                                        placeholder="0333 0443578"
                                        className="pl-10 h-11 border-muted/60 focus:border-primary transition-colors"
                                    />
                                </div>
                                {formErrors.phone && (
                                    <p className="text-[10px] text-red-500 font-medium pl-1">
                                        {formErrors.phone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Residential Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    {...register("address", { required: "Address is required" })}
                                    placeholder="Full address (Street, City, Zip)"
                                    className="pl-10 h-11 border-muted/60 focus:border-primary transition-colors"
                                />
                            </div>
                            {formErrors.address && (
                                <p className="text-[10px] text-red-500 font-medium pl-1">
                                    {formErrors.address.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <Label className="text-sm font-semibold">
                                    Select Gender <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {["male", "female", "other"].map((g) => {
                                    const isActive = currentGender === g;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() =>
                                                setValue("gender", g, { shouldValidate: true })
                                            }
                                            className={cn(
                                                "flex items-center justify-center py-2.5 rounded-lg border-2 transition-all font-semibold capitalize text-sm",
                                                isActive
                                                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                                                    : "border-muted/60 bg-muted/20 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                                            )}
                                        >
                                            {g}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold mt-6 shadow-md transition-all active:scale-95"
                        >
                            Continue <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
