import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Keyboard, Timer, Trophy, RotateCcw, AlertCircle, CheckCircle2, Loader2, Lock, ArrowRight } from "lucide-react";
import { EXAM_CATEGORIES, ALL_TESTS, getMergedTests } from "../data/tests";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { formatTime, cn } from "../lib/utils";
import { TypingTest as TypingTestType } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { saveTestResult } from "../services/firestoreService";
import { StatCard, ResultMetric } from "../components/Shared";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function TypingTest() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TypingTestType | null>(null);
  const [isTestActive, setIsTestActive] = useState(false);
  const [allTests, setAllTests] = useState<TypingTestType[]>(ALL_TESTS);
  const [backspaceEnabled, setBackspaceEnabled] = useState(true);
  const [examMode, setExamMode] = useState<"Normal" | "CAPF HCM">("Normal");
  const { user } = useAuth();

  useEffect(() => {
    const fetchDynamicParagraphs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "paragraphs"));
        const dynamicParagraphs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllTests(getMergedTests(dynamicParagraphs));
      } catch (error) {
        console.error("Error fetching dynamic paragraphs:", error);
      }
    };
    fetchDynamicParagraphs();
  }, []);

  const isPremiumUser = user?.subscription?.status === "active" && user.subscription.expiresAt > Date.now();

  const handleStartTest = (test: TypingTestType) => {
    if (test.isPremium && !isPremiumUser) {
      return; // Handled by UI
    }
    setSelectedTest(test);
    setIsTestActive(true);
  };

  const filteredTests = allTests.filter(t => t.category === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {!isTestActive ? (
        <div className="flex flex-col gap-8">
          {!selectedCategory ? (
            <>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Exam Categories</h1>
                <p className="mt-4 text-lg text-gray-600">Select an exam to view available typing tests.</p>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {EXAM_CATEGORIES.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ y: -5 }}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-50 p-2">
                      <img src={cat.icon} alt={cat.name} className="h-full w-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-gray-900">{cat.name}</h3>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600">
                      View Tests <ArrowRight className="h-4 w-4" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-sm font-medium text-gray-500 hover:text-indigo-600"
                  >
                    ← Back to Categories
                  </button>
                  <h1 className="mt-2 text-3xl font-bold text-gray-900">Tests for {selectedCategory}</h1>
                </div>
                <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600">
                  {filteredTests.length} Tests Available
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900">Typing Settings</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">Backspace Control</span>
                        <span className="text-xs text-gray-500">Enable or disable backspace key</span>
                      </div>
                      <button
                        onClick={() => setBackspaceEnabled(!backspaceEnabled)}
                        disabled={examMode === "CAPF HCM"}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          backspaceEnabled ? "bg-indigo-600" : "bg-gray-200",
                          examMode === "CAPF HCM" && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            backspaceEnabled ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">Exam Mode</span>
                        <span className="text-xs text-gray-500">Select specific exam rules</span>
                      </div>
                      <select
                        value={examMode}
                        onChange={(e) => {
                          const mode = e.target.value as "Normal" | "CAPF HCM";
                          setExamMode(mode);
                          if (mode === "CAPF HCM") setBackspaceEnabled(false);
                        }}
                        className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="Normal">Normal Mode</option>
                        <option value="CAPF HCM">CAPF HCM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900">Mode Description</h3>
                  <div className="mt-4">
                    {examMode === "CAPF HCM" ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-bold text-red-600">Special Rules:</span>
                        </p>
                        <ul className="list-disc pl-5 text-xs text-gray-500 space-y-1">
                          <li>Backspace is <span className="font-bold">DISABLED</span>.</li>
                          <li>Maximum 5% mistakes allowed.</li>
                          <li>Each mistake beyond 5% results in <span className="font-bold text-red-500">-10 words</span> penalty.</li>
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Normal typing rules apply. You can toggle backspace and practice freely. Accuracy and WPM will be calculated normally.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="divide-y divide-gray-100">
                  {filteredTests.map((test) => {
                    const isLocked = test.isPremium && !isPremiumUser;
                    return (
                      <div key={test.id} className="flex items-center justify-between p-6 transition-colors hover:bg-gray-50/50">
                        <div className="flex items-center gap-4">
                          {isLocked && <Lock className="h-5 w-5 text-amber-500" />}
                          <div className="flex flex-col">
                            <span className={cn("font-bold", isLocked ? "text-gray-400" : "text-gray-900")}>
                              {test.title}
                            </span>
                            <span className={cn(
                              "text-xs font-medium uppercase tracking-wider",
                              test.difficulty === "Easy" ? "text-green-500" :
                              test.difficulty === "Medium" ? "text-blue-500" : "text-red-500"
                            )}>
                              {test.difficulty}
                            </span>
                          </div>
                        </div>
                        {isLocked ? (
                          <Link
                            to="/subscription"
                            className="rounded-xl bg-green-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-green-700"
                          >
                            Upgrade
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleStartTest(test)}
                            className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
                          >
                            Take Test
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <TestInterface
          test={selectedTest!}
          options={{ backspaceEnabled, examMode }}
          onExit={() => setIsTestActive(false)}
          setExamMode={setExamMode}
          setBackspaceEnabled={setBackspaceEnabled}
        />
      )}
    </div>
  );
}

function TestInterface({ 
  test, 
  options, 
  onExit, 
  setExamMode, 
  setBackspaceEnabled 
}: { 
  test: TypingTestType; 
  options: { backspaceEnabled: boolean; examMode: "Normal" | "CAPF HCM" }; 
  onExit: () => void;
  setExamMode: (mode: "Normal" | "CAPF HCM") => void;
  setBackspaceEnabled: (enabled: boolean) => void;
}) {
  const { user } = useAuth();
  const [isPrintoutMode, setIsPrintoutMode] = useState(false);
  const {
    typed,
    errors,
    grossWpm,
    netWpm,
    accuracy,
    errorPercentage,
    penalty,
    timeLeft,
    isStarted,
    isFinished,
    handleInput,
    submit,
    reset,
  } = useTypingEngine(test.content, test.duration, options);

  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isFinished) {
      inputRef.current?.focus();
    } else if (isFinished && user && !hasSaved) {
      handleSaveResult();
    }
  }, [isFinished, user, hasSaved]);

  const handleSaveResult = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await saveTestResult({
        userId: user.uid,
        testId: test.id,
        testTitle: test.title,
        category: test.category,
        wpm: netWpm,
        accuracy,
        errors,
        examMode: options.examMode,
        penalty,
        timestamp: Date.now(),
      });
      setHasSaved(true);
    } catch (error) {
      console.error("Error saving result:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setHasSaved(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header with Stats and Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExit}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600"
          >
            ← Back to Tests
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
          <div className="flex gap-2">
            <span className="rounded-lg bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600 uppercase">
              {options.examMode} Mode
            </span>
            {isPrintoutMode && (
              <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-600 uppercase">
                Printout Mode
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <StatCard icon={Timer} label="Time" value={formatTime(timeLeft)} color="indigo" />
          <StatCard icon={Keyboard} label="WPM" value={netWpm.toString()} color="blue" />
          <StatCard icon={Trophy} label="Accuracy" value={`${accuracy}%`} color="green" />
          <StatCard icon={AlertCircle} label="Error %" value={`${errorPercentage}%`} color="red" />
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setIsPrintoutMode(!isPrintoutMode)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all",
            isPrintoutMode 
              ? "bg-amber-600 text-white shadow-md" 
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          )}
        >
          {isPrintoutMode ? "Exit Printout Mode" : "Go to Printout Mode"}
        </button>
        
        <button
          onClick={() => {
            const newMode = options.examMode === "Normal" ? "CAPF HCM" : "Normal";
            setExamMode(newMode);
            if (newMode === "CAPF HCM") setBackspaceEnabled(false);
          }}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all",
            options.examMode === "CAPF HCM"
              ? "bg-indigo-600 text-white shadow-md" 
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          )}
        >
          {options.examMode === "CAPF HCM" ? "Exit Exam Mode" : "Go to Exam Mode"}
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500">
          Backspace: <span className={cn("font-bold", options.backspaceEnabled ? "text-green-600" : "text-red-600")}>
            {options.backspaceEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Reference Text Area (Top Section) */}
        {!isFinished && !isPrintoutMode && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Reference Text</label>
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-inner">
              <div className="text-xl leading-relaxed text-gray-600 select-none font-mono">
                {test.content.split("").map((char, idx) => {
                  let color = "text-gray-600";
                  if (idx < typed.length) {
                    color = typed[idx] === char ? "text-indigo-600 bg-indigo-50" : "text-red-600 bg-red-50";
                  }
                  return (
                    <span key={idx} className={cn("transition-colors", color, idx === typed.length && "bg-indigo-200 text-indigo-900")}>
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Typing Input Area (Bottom Section) */}
        <div className="relative flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            {isPrintoutMode ? "Typing Area (Printout Mode ON)" : "Typing Area"}
          </label>
          <div className="rounded-2xl border-2 border-indigo-100 bg-white shadow-sm focus-within:border-indigo-500 transition-colors">
            {!isFinished ? (
              <textarea
                ref={inputRef}
                value={typed}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="Start typing here..."
                className="h-64 w-full rounded-2xl p-8 text-2xl leading-relaxed text-gray-900 focus:outline-none font-mono resize-none"
                autoFocus
              />
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-6 rounded-xl bg-indigo-50 p-12 text-center"
              >
                <CheckCircle2 className="h-16 w-16 text-indigo-600" />
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Test Completed!</h3>
                  <p className="mt-2 text-lg text-gray-600">Great job! Here are your results.</p>
                </div>
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-6">
                  <ResultMetric label="Final WPM" value={netWpm.toString()} />
                  <ResultMetric label="Gross WPM" value={grossWpm.toString()} />
                  <ResultMetric label="Accuracy" value={`${accuracy}%`} />
                  <ResultMetric label="Error %" value={`${errorPercentage}%`} />
                  <ResultMetric label="Wrong Words" value={errors.toString()} />
                  <ResultMetric label="Penalty" value={penalty > 0 ? `-${penalty} words` : "None"} />
                </div>
                
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving your results...
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white transition-colors hover:bg-indigo-700"
                  >
                    <RotateCcw className="h-5 w-5" /> Try Again
                  </button>
                  <button
                    onClick={onExit}
                    className="rounded-xl border-2 border-indigo-600 px-8 py-3 font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                  >
                    View Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        {!isFinished && (
          <div className="flex justify-center py-4">
            <button
              onClick={submit}
              className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 px-12 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95"
            >
              <CheckCircle2 className="h-6 w-6" />
              Submit Test
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform group-hover:translate-x-full duration-1000" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
