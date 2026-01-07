import React from "react";
import {
  Star,
  ArrowLeft,
  Send,
  Sparkles,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import StarRatingInput from "@/components/form-fields/star-rating-input";
import { TextareaField } from "@/components/form-fields/textarea-field";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const PLATFORMS = [
  {
    id: "google",
    name: "Google",
    icon: "G",
    brandColor: "#4285F4",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: "f",
    brandColor: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    brandColor: "#E4405F",
  },
  {
    id: "red",
    name: "RED / 小红书",
    icon: "📕",
    brandColor: "#FF2442",
  },
];

export const ReviewForm = ({
  merchantConfig,
  setValue,
  formValues,
  register,
  nextStep,
  prevStep,
  loading,
  setLoading,
}) => {
  const [presetReviews, setPresetReviews] = React.useState([]);
  const [loadingPresets, setLoadingPresets] = React.useState(true);
  const [selectedPresetId, setSelectedPresetId] = React.useState(null);
  const [showPlatforms, setShowPlatforms] = React.useState(false);

  React.useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axiosInstance.get(
          "/preset-reviews?merchantId=1"
        );
        setPresetReviews(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching presets:", error);
      } finally {
        setLoadingPresets(false);
      }
    };
    fetchPresets();
  }, []);

  const handlePresetClick = (text, id) => {
    setValue("text", text);
    setSelectedPresetId(id);
  };

  const onTextChange = (e) => {
    setValue("text", e.target.value);
    setSelectedPresetId(null);
  };

  const handleInitialSubmit = () => {
    if (!formValues.rating) {
      toast.error("Please provide a rating ⭐");
      return;
    }
    if (!formValues.text?.trim()) {
      toast.error("Please provide some feedback ✍️");
      return;
    }
    setShowPlatforms(true);
  };

  const handleSubmitFinal = async (platformId) => {
    try {
      setLoading(true);
      setValue("platform", platformId);

      const isPresetReview = selectedPresetId !== null;

      const payload = {
        merchantId: 1,
        email: formValues.email,
        name: formValues.name,
        phoneNumber: formValues.phone,
        date_of_birth: formValues.dob,
        address: formValues.address,
        gender: formValues.gender,
        rating: formValues.rating,
        comment: formValues.text,
        reviewType: isPresetReview ? "preset" : "custom",
        customReviewText: !isPresetReview ? formValues.text : null,
        presetReviewId: isPresetReview ? selectedPresetId : null,
        selectedPlatform: platformId,
        redirectCompleted: false,
      };

      await axiosInstance.post("/feedbacks", payload);

      const platformMap = {
        google: merchantConfig.googleReviewLink,
        facebook: merchantConfig.facebookReviewLink,
        instagram: merchantConfig.instagramReviewLink,
        red: merchantConfig.redReviewLink,
      };

      const redirectUrl = platformMap[platformId] || merchantConfig.mapLink;

      toast.success("Feedback recorded successfully!");

      setTimeout(() => {
        if (redirectUrl) {
          window.open(redirectUrl, "_blank");
        }
        nextStep();
      }, 1000);
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const availablePlatforms = PLATFORMS.filter((platform) => {
    if (platform.id === "google") return merchantConfig.enableGoogle;
    if (platform.id === "facebook") return merchantConfig.enableFacebook;
    if (platform.id === "instagram") return merchantConfig.enableInstagram;
    if (platform.id === "red") return merchantConfig.enableRed;
    return false;
  });

  if (!showPlatforms) {
    return (
      <div className="w-full">
        <Card className="w-full border-muted/60 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-between mb-4 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 px-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Back
                </span>
              </Button>
              <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                Step 2 of 2
              </div>
            </div>

            <div className="mx-auto w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Your Experience
            </CardTitle>
            <CardDescription className="text-sm">
              How was your time at {merchantConfig.name}?
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pb-8">
            <div className="flex justify-center py-6 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40 transition-colors hover:bg-muted/30">
              <StarRatingInput
                label=""
                name="rating"
                register={register}
                setValue={setValue}
                value={formValues.rating}
              />
            </div>

            {merchantConfig.enablePresetReviews && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold">Quick Review</Label>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {loadingPresets ? (
                    <div className="flex items-center gap-2 py-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    presetReviews.map((review) => (
                      <button
                        key={review.id}
                        type="button"
                        onClick={() =>
                          handlePresetClick(review.review_text, review.id)
                        }
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium border transition-all",
                          selectedPresetId === review.id
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                            : "bg-muted/20 border-muted/60 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        {review.review_text}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <Label className="text-sm font-semibold">
                  Custom Feedback <span className="text-red-500">*</span>
                </Label>
              </div>
              <TextareaField
                label=""
                name="text"
                placeholder="Tell us what you loved or how we can improve..."
                register={register}
                onChange={onTextChange}
                errors={{}}
                rows={3}
                className="rounded-xl border-muted/60 focus:border-primary transition-colors resize-none text-sm"
              />
            </div>

            <Button
              className="w-full h-12 text-base font-bold shadow-md transition-all active:scale-95 mt-4"
              onClick={handleInitialSubmit}
            >
              Continue <Send className="ml-2 w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card className="w-full border-muted/60 shadow-lg text-center">
        <CardHeader className="pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Almost Done!
          </CardTitle>
          <CardDescription className="text-sm">
            Please share your feedback on one of these platforms:
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {availablePlatforms.length > 0 ? (
              availablePlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  type="button"
                  className={cn(
                    "h-28 flex-col gap-3 relative overflow-hidden group border-2 transition-all rounded-xl",
                    formValues.platform === platform.id
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-muted/60 hover:border-primary/40 hover:bg-primary/5"
                  )}
                  onClick={() => handleSubmitFinal(platform.id)}
                  disabled={loading}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold text-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: platform.brandColor }}
                  >
                    {platform.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    {platform.name}
                  </span>

                  {loading && formValues.platform === platform.id && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex items-center justify-center z-20">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </Button>
              ))
            ) : (
              <div className="col-span-2 py-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40">
                <p className="text-muted-foreground text-sm italic">
                  Configuring platforms...
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary font-bold flex items-center gap-2 mx-auto"
              onClick={() => setShowPlatforms(false)}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Edit My Feedback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
