import { CustomerReviewFlow } from "@/containers/customer/review/CustomerReviewFlow";
import { getTranslations } from "next-intl/server";

export default async function CustomerReviewPage({ params }) {
    const { locale } = params;
    const t = await getTranslations("customerReview");

    return (
        <div className="min-h-screen bg-background text-foreground">
            <CustomerReviewFlow locale={locale} />
        </div>
    );
}
