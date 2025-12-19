import { MessageSquare, Gift, Star, Calendar } from "lucide-react";

export const campaigns = [
    {
        id: "whatsapp-nudge",
        title: "WhatsApp Nudge",
        description: "Send reminder to inactive customers",
        icon: MessageSquare,
        colorClass: "bg-green-100 text-green-600",
        defaultChecked: true,
        details:
            "Automatically send a WhatsApp message to customers who haven't visited in 30 days.",
        preview:
            '"Hi [Name]! We miss you at [Store Name]. Here is a 10% discount coupon for your next visit!"',
        cost: "1 Credit",
    },
    {
        id: "birthday-rewards",
        title: "Birthday Rewards",
        description: "Automatic birthday wishes & coupons",
        icon: Gift,
        colorClass: "bg-pink-100 text-pink-600",
        defaultChecked: true,
        details:
            "Send a special birthday greeting and exclusive offer to customers on their birthday.",
        preview:
            '"Happy Birthday [Name]! 🎂 Enjoy a free dessert on us today at [Store Name]!"',
        cost: "2 Credits",
    },
    {
        id: "post-review",
        title: "Post-Review Message",
        description: "Thank customers after a review",
        icon: Star,
        colorClass: "bg-yellow-100 text-yellow-600",
        defaultChecked: false,
        details:
            "Send a thank you message immediately after a customer leaves a review.",
        preview:
            '"Thanks for the [Rating] star review! We appreciate your feedback. See you soon!"',
        cost: "1 Credit",
    },
    {
        id: "festival-greetings",
        title: "Festival Greetings",
        description: "Seasonal & holiday campaigns",
        icon: Calendar,
        colorClass: "bg-purple-100 text-purple-600",
        defaultChecked: false,
        details:
            "Schedule messages for upcoming festivals (Christmas, New Year, Diwali, etc.).",
        preview:
            '"Merry Christmas! 🎄 Celebrate with us and get 15% off this week!"',
        cost: "1.5 Credits",
    },
];
