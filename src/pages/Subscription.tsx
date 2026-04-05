import { motion } from "motion/react";
import { CheckCircle2, ShieldCheck, CreditCard, Zap, Star } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "../constants";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function Subscription() {
  const navigate = useNavigate();

  const handleSubscribe = (planId: string) => {
    navigate(`/payment?plan=${planId}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Choose Your Preparation Plan
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          Unlock all features and exam-specific typing tests to boost your preparation.
        </p>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "relative flex flex-col rounded-3xl border p-8 shadow-sm transition-all hover:shadow-xl",
              plan.id === "3-months" ? "border-indigo-600 ring-2 ring-indigo-600 ring-opacity-10" : "border-gray-200"
            )}
          >
            {plan.id === "3-months" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
              <span className="text-sm text-gray-500">/{plan.duration}</span>
            </div>
            <ul className="mt-8 flex-1 space-y-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              className={cn(
                "mt-8 block w-full rounded-2xl py-4 text-center text-sm font-bold transition-colors",
                plan.id === "3-months"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              )}
            >
              Subscribe Now
            </button>
          </motion.div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure checkout with SSL encryption." },
          { icon: CreditCard, title: "Multiple Methods", desc: "Pay via Credit Card, UPI, or Net Banking." },
          { icon: Zap, title: "Instant Access", desc: "Get access to all tests immediately after payment." },
          { icon: Star, title: "Money-back Guarantee", desc: "7-day money-back guarantee if not satisfied." },
        ].map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <badge.icon className="h-6 w-6" />
            </div>
            <h4 className="mt-4 font-bold text-gray-900">{badge.title}</h4>
            <p className="mt-2 text-sm text-gray-500">{badge.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
