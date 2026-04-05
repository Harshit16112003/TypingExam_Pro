import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, TrendingUp, Clock, Target, Calendar, ChevronRight, Loader2, Mail, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToUserResults } from "../services/firestoreService";
import { TestResult } from "../types";
import { Link } from "react-router-dom";
import { ProgressItem } from "../components/Shared";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserResults(user.uid, (data) => {
        setResults(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Please log in to view your dashboard.</h2>
        <Link to="/login" className="mt-4 inline-block rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white transition-colors hover:bg-indigo-700">
          Go to Login
        </Link>
      </div>
    );
  }

  const stats = [
    { label: "Average WPM", value: user.stats?.avgWpm.toString() || "0", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Highest WPM", value: user.stats?.maxWpm.toString() || "0", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Avg Accuracy", value: `${user.stats?.avgAccuracy || 0}%`, icon: Target, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Tests", value: user.stats?.totalTests.toString() || "0", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.displayName || "User"}!</h1>
            <p className="mt-2 text-gray-600">Here's a summary of your typing performance.</p>
          </div>
          <div className="hidden sm:block">
            <Link to="/tests" className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition-colors hover:bg-indigo-700">
              New Test
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                <h2 className="font-bold text-gray-900">Recent Test History</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {results.length > 0 ? (
                  results.slice(0, 10).map((test) => (
                    <div key={test.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{test.testTitle}</p>
                            {test.examMode && test.examMode !== "Normal" && (
                              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 uppercase">
                                {test.examMode}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{new Date(test.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{test.wpm} WPM</p>
                          <div className="flex flex-col items-end">
                            <p className="text-xs text-gray-500">{test.accuracy}% Accuracy</p>
                            {test.penalty && test.penalty > 0 && (
                              <p className="text-[10px] font-bold text-red-500">-{test.penalty} words penalty</p>
                            )}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                            test.accuracy >= 90 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                          )}
                        >
                          {test.accuracy >= 90 ? "Excellent" : "Good"}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 text-center text-gray-500">
                    No tests taken yet. Start practicing!
                  </div>
                )}
              </div>
              {results.length > 10 && (
                <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 text-center">
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                    View All History
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className={cn(
              "rounded-2xl border p-8 text-white shadow-sm",
              user.subscription?.status === "active" ? "bg-green-600 border-green-500" : "bg-indigo-600 border-indigo-500"
            )}>
              <h3 className="text-xl font-bold">
                {user.subscription?.status === "active" ? "Pro Subscription Active" : "Upgrade to Pro"}
              </h3>
              <p className="mt-2 text-indigo-100">
                {user.subscription?.status === "active" 
                  ? `Your plan expires on ${new Date(user.subscription.expiresAt).toLocaleDateString()}`
                  : "Get access to all exam tests and advanced analytics."}
              </p>
              {user.subscription?.status !== "active" && (
                <Link to="/subscription" className="mt-6 block w-full rounded-xl bg-white py-3 text-center font-bold text-indigo-600 transition-colors hover:bg-indigo-50">
                  View Plans
                </Link>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="font-bold text-gray-900">Your Progress</h3>
              <div className="mt-6 space-y-6">
                <ProgressItem label="Overall Accuracy" progress={user.stats?.avgAccuracy || 0} />
                <ProgressItem label="Speed Goal (60 WPM)" progress={Math.min(Math.round(((user.stats?.maxWpm || 0) / 60) * 100), 100)} />
                <ProgressItem label="Tests Completed" progress={Math.min(Math.round(((user.stats?.totalTests || 0) / 50) * 100), 100)} />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="font-bold text-gray-900">Need Help?</h3>
              <p className="mt-2 text-sm text-gray-600">Contact our support team for any assistance.</p>
              <div className="mt-6 space-y-4">
                <a href="mailto:email-information@typingpro.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  email-information@typingpro.com
                </a>
                <a href="https://wa.me/916265641092" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-600 hover:text-indigo-600">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  WhatsApp: +91 6265641092
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
