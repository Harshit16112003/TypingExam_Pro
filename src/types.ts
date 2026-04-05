export type SubscriptionPlan = {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
};

export type PaymentRequest = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  price: number;
  transactionId?: string;
  screenshotUrl?: string;
  status: "pending" | "approved" | "rejected";
  timestamp: number;
};

export type TypingTest = {
  id: string;
  title: string;
  category: string; // e.g., "SSC", "Banking", "General"
  content: string;
  duration: number; // in seconds
  isPremium?: boolean;
  difficulty: "Easy" | "Medium" | "Hard";
};

export type TestResult = {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  category: string;
  wpm: number;
  accuracy: number;
  errors: number;
  examMode?: string;
  penalty?: number;
  timestamp: number;
};

export type LeaderboardEntry = {
  id: string;
  userId: string;
  displayName: string;
  testId: string;
  testTitle: string;
  category: string;
  wpm: number;
  accuracy: number;
  examMode?: string;
  subscriptionPlan: string;
  timestamp: number;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName?: string;
  isAdmin?: boolean;
  subscription?: {
    planId: string;
    status: "active" | "expired" | "none";
    expiresAt: number;
  };
  stats?: {
    totalTests: number;
    avgWpm: number;
    maxWpm: number;
    avgAccuracy: number;
  };
};
