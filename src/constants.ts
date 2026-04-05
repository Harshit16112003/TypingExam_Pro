import { SubscriptionPlan } from "./types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "1-month",
    name: "1 Month",
    duration: "1 Month",
    price: 79,
    features: ["All Exam Tests", "Detailed Analytics", "Progress Tracking", "Ad-free Experience"],
  },
  {
    id: "3-months",
    name: "3 Months",
    duration: "3 Months",
    price: 210,
    features: ["All Exam Tests", "Detailed Analytics", "Progress Tracking", "Ad-free Experience", "Priority Support"],
  },
  {
    id: "1-year",
    name: "1 Year",
    duration: "1 Year",
    price: 500,
    features: ["All Exam Tests", "Detailed Analytics", "Progress Tracking", "Ad-free Experience", "Priority Support", "Personalized Tips", "Certificate of Completion"],
  },
];
