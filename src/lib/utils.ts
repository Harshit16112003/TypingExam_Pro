import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function calculateWPM(chars: number, seconds: number): number {
  if (seconds === 0) return 0;
  const words = chars / 5;
  const minutes = seconds / 60;
  return Math.round(words / minutes);
}

export function calculateAccuracy(total: number, errors: number): number {
  if (total === 0) return 100;
  return Math.round(((total - errors) / total) * 100);
}

export function calculateNetWPM(chars: number, errors: number, seconds: number): number {
  if (seconds === 0) return 0;
  const totalWords = chars / 5;
  const minutes = seconds / 60;
  
  // 5% mistakes allowed rule
  const allowedMistakes = Math.floor(totalWords * 0.05);
  const extraMistakes = Math.max(0, errors - allowedMistakes);
  
  // Penalty: 10 words for every extra mistake (standard SSC penalty)
  const penaltyWords = extraMistakes * 10;
  const netWpm = Math.max(0, (totalWords - penaltyWords) / minutes);
  
  return Math.round(netWpm);
}
