import { CustomerReviewFlow } from "@/containers/customer/review/CustomerReviewFlow";

export default function CustomerReviewPage({ params }) {
    // In a real app, we would fetch merchant config based on ID from query or params
    // const { merchantId } = params;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <CustomerReviewFlow />
        </div>
    );
}
