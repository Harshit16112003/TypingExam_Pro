import { useState, useEffect, useCallback, useRef } from "react";
import { calculateWPM, calculateAccuracy, calculateNetWPM } from "../lib/utils";

export type TypingState = {
  typed: string;
  errors: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errorPercentage: number;
  penalty: number;
  timeLeft: number;
  isStarted: boolean;
  isFinished: boolean;
};

export function useTypingEngine(content: string, duration: number, options: { backspaceEnabled: boolean; examMode: "Normal" | "CAPF HCM" }) {
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [grossWpm, setGrossWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorPercentage, setErrorPercentage] = useState(0);
  const [penalty, setPenalty] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTyped("");
    setErrors(0);
    setTimeLeft(duration);
    setIsStarted(false);
    setIsFinished(false);
    setGrossWpm(0);
    setNetWpm(0);
    setAccuracy(100);
    setErrorPercentage(0);
    setPenalty(0);
  }, [duration]);

  const handleInput = useCallback(
    (input: string) => {
      if (isFinished) return;

      // Handle Backspace Restriction
      if (!options.backspaceEnabled || options.examMode === "CAPF HCM") {
        if (input.length < typed.length) {
          return; // Prevent backspace
        }
      }

      if (!isStarted) {
        setIsStarted(true);
        startTimer();
      }

      const currentInput = input;
      const lastCharIndex = currentInput.length - 1;
      const lastChar = currentInput[lastCharIndex];
      const expectedChar = content[lastCharIndex];

      let newErrors = errors;
      if (lastChar !== expectedChar && currentInput.length > typed.length) {
        newErrors += 1;
        setErrors(newErrors);
      }

      setTyped(currentInput);

      // Calculate stats
      const timeElapsed = duration - timeLeft;
      const timeInMinutes = (timeElapsed || 1) / 60;

      // Word-based calculations (1 word = 5 chars)
      const totalWords = currentInput.length / 5;
      const wrongWords = newErrors; // In many exam rules, each error is a "wrong word" or penalized as such
      // But the user said: error% = (wrong words / total typed words) * 100
      // Let's assume "total typed words" is total characters / 5
      
      const currentErrorPercentage = totalWords > 0 ? (wrongWords / totalWords) * 100 : 0;
      const currentAccuracy = totalWords > 0 ? ((totalWords - wrongWords) / totalWords) * 100 : 100;

      let currentPenalty = 0;
      let finalNetWpm = 0;

      if (options.examMode === "CAPF HCM") {
        // Special Rule: 5% mistakes allowed.
        const allowedMistakes = Math.floor(totalWords * 0.05);
        if (wrongWords > allowedMistakes) {
          // If error percentage > 5%: Apply penalty system
          // For each additional wrong word beyond the 5% limit, subtract 10 words
          const extraMistakes = wrongWords - allowedMistakes;
          currentPenalty = extraMistakes * 10;
          finalNetWpm = Math.max(0, (totalWords - currentPenalty) / timeInMinutes);
        } else {
          // If error percentage ≤ 5%: Continue typing normally
          finalNetWpm = Math.max(0, (totalWords - wrongWords) / timeInMinutes);
        }
      } else {
        // Normal Mode
        finalNetWpm = Math.max(0, (totalWords - wrongWords) / timeInMinutes);
      }

      const currentGrossWpm = totalWords / timeInMinutes;

      setGrossWpm(Math.round(currentGrossWpm));
      setNetWpm(Math.round(finalNetWpm));
      setAccuracy(Math.max(0, Math.round(currentAccuracy * 100) / 100));
      setErrorPercentage(Math.round(currentErrorPercentage * 100) / 100);
      setPenalty(currentPenalty);

      if (currentInput.length === content.length) {
        setIsFinished(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    },
    [content, duration, isFinished, isStarted, startTimer, timeLeft, errors, typed.length, options.backspaceEnabled, options.examMode]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const submit = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return {
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
  };
}
