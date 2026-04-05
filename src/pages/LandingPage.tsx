import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Keyboard, Trophy, LineChart, ShieldCheck, ArrowRight, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "../constants";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-indigo-600 py-24 text-white">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl"
            >
              Master Your Typing for Competitive Exams
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-2xl text-lg text-indigo-100"
            >
              Practice with real exam-style typing tests for SSC, Banking, CAPF HCM, KVS NVS, EMRS JSA, RRB NTPC, and more. Track your speed, accuracy, and progress with our advanced dashboard.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link
                to="/tests"
                className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition-transform hover:scale-105"
              >
                Start Free Test <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/forgot-password"
                className="flex items-center gap-2 rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10"
              >
                Forgot Password
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to succeed</h2>
            <p className="mt-4 text-lg text-gray-600">Designed specifically for SSC, Banking, and other government exams.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Exam-Specific Content",
                desc: "Tests based on the latest exam patterns and previous year papers.",
                icon: Keyboard,
              },
              {
                title: "Real-time Analytics",
                desc: "Get instant feedback on your WPM, accuracy, and error types.",
                icon: LineChart,
              },
              {
                title: "Performance Dashboard",
                desc: "Track your progress over time with detailed charts and history.",
                icon: Trophy,
              },
              {
                title: "Subscription Plans",
                desc: "Flexible plans to suit your preparation timeline.",
                icon: ShieldCheck,
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-indigo-600 p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Need Help with Your Preparation?</h2>
            <p className="mt-4 text-lg text-indigo-100">Our support team is here to help you with any questions or technical issues.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-8">
              <a href="mailto:email-information@typingpro.com" className="flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-4 font-bold transition-colors hover:bg-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600">
                  <Mail className="h-6 w-6" />
                </div>
                email-information@typingpro.com
              </a>
              <a href="https://wa.me/916265641092" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-4 font-bold transition-colors hover:bg-white/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white">
                  <MessageCircle className="h-6 w-6" />
                </div>
                WhatsApp: +91 6265641092
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that fits your preparation needs.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
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
                <Link
                  to="/subscription"
                  className="mt-8 block w-full rounded-xl bg-indigo-600 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
