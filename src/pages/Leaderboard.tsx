import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Medal, Filter, Search, Loader2, Award } from "lucide-react";
import { getLeaderboard } from "../services/firestoreService";
import { LeaderboardEntry } from "../types";
import { cn } from "../lib/utils";

const CATEGORIES = ["All", "SSC", "Banking", "General", "State Exams"];
const PLANS = ["All", "free", "monthly", "quarterly", "half-yearly", "yearly"];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [plan, setPlan] = useState("All");

  useEffect(() => {
    fetchLeaderboard();
  }, [category, plan]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard({
        category: category === "All" ? undefined : category,
        subscriptionPlan: plan === "All" ? undefined : plan,
      });
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg"
          >
            <Trophy className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-extrabold text-gray-900"
          >
            Global Leaderboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-gray-600"
          >
            See how you rank against the best typists across all exams.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-1 flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Exam Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    category === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">Subscription</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:outline-none"
            >
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : entries.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Rank</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">User</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Exam</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">WPM</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Accuracy</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-600">Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Medal className="h-5 w-5 text-yellow-500" />}
                        {index === 1 && <Medal className="h-5 w-5 text-gray-400" />}
                        {index === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                        <span className={cn(
                          "font-bold",
                          index < 3 ? "text-indigo-600" : "text-gray-500"
                        )}>
                          #{index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {entry.displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{entry.displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{entry.testTitle}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{entry.category}</span>
                          {entry.examMode && entry.examMode !== "Normal" && (
                            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 uppercase">
                              {entry.examMode}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-extrabold text-indigo-600">{entry.wpm}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">
                      {entry.accuracy}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
                        entry.subscriptionPlan === "free" 
                          ? "bg-gray-100 text-gray-600" 
                          : "bg-indigo-100 text-indigo-600"
                      )}>
                        {entry.subscriptionPlan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-gray-500">
              <Award className="mb-4 h-12 w-12 opacity-20" />
              <p>No rankings available for these filters yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
