import type { IPricing } from "../types";

export const pricingData: IPricing[] = [
    {
        name: "Basic",
        price: 29,
        period: "month",
        features: [
            "50 AI thumbnails per month",
            "Access to basic templates",
            "Standard resolution",
            "No Watermark",
            "Basic code review",
            "Email support"
        ],
        mostPopular: false
    },
    {
        name: "Pro",
        price: 79,
        period: "month",
        features: [
            "Unlimited AI thumbnails",
            "Premium templates",
            "High resolution",
            "Custom Fonts",
            "Testing Tools",
            "Priority support",
            "Brand Kit Analysis"
        ],
        mostPopular: true
    },
    {
        name: "Enterprise",
        price: 199,
        period: "month",
        features: [
            "Everthing in Pro",
            "Custom Branding",
            "API access",
            "Dedicated Account Manager",
            "Custom Integrations"
        ],
        mostPopular: false
    }
];