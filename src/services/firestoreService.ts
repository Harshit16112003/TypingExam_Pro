import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment,
  getDoc,
  setDoc,
  getDocs,
  limit,
  QueryConstraint
} from "firebase/firestore";
import { db } from "../firebase";
import { TestResult, UserProfile, LeaderboardEntry } from "../types";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      // We can't easily access auth here without passing it, 
      // but we can log what we have
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const saveTestResult = async (result: Omit<TestResult, "id">) => {
  const path = "results";
  try {
    const docRef = await addDoc(collection(db, path), result);
    
    // Update user stats
    const userRef = doc(db, "users", result.userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const currentStats = userData.stats || { totalTests: 0, avgWpm: 0, maxWpm: 0, avgAccuracy: 0 };
      
      const newTotalTests = currentStats.totalTests + 1;
      const newAvgWpm = (currentStats.avgWpm * currentStats.totalTests + result.wpm) / newTotalTests;
      const newAvgAccuracy = (currentStats.avgAccuracy * currentStats.totalTests + result.accuracy) / newTotalTests;
      const newMaxWpm = Math.max(currentStats.maxWpm, result.wpm);
      
      await updateDoc(userRef, {
        "stats.totalTests": newTotalTests,
        "stats.avgWpm": Math.round(newAvgWpm),
        "stats.avgAccuracy": Math.round(newAvgAccuracy),
        "stats.maxWpm": newMaxWpm
      });

      // Update leaderboard entry
      await updateLeaderboard(result, userData);
    }
    
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

const updateLeaderboard = async (result: Omit<TestResult, "id">, userProfile: UserProfile) => {
  const path = "leaderboards";
  try {
    const leaderboardId = `${userProfile.uid}_${result.testId}`;
    const leaderboardRef = doc(db, path, leaderboardId);
    const existingSnap = await getDoc(leaderboardRef);

    const shouldUpdate = !existingSnap.exists() || (existingSnap.data() as LeaderboardEntry).wpm < result.wpm;

    if (shouldUpdate) {
      const entry: LeaderboardEntry = {
        id: leaderboardId,
        userId: userProfile.uid,
        displayName: userProfile.displayName,
        testId: result.testId,
        testTitle: result.testTitle,
        category: result.category || "General",
        wpm: result.wpm,
        accuracy: result.accuracy,
        examMode: result.examMode,
        subscriptionPlan: userProfile.subscription?.planId || "free",
        timestamp: result.timestamp,
      };
      await setDoc(leaderboardRef, entry);
    }
  } catch (error) {
    console.error("Error updating leaderboard:", error);
  }
};

export const getLeaderboard = async (filters: { category?: string; subscriptionPlan?: string } = {}) => {
  const path = "leaderboards";
  try {
    const constraints: QueryConstraint[] = [orderBy("wpm", "desc"), limit(50)];

    if (filters.category && filters.category !== "All") {
      constraints.unshift(where("category", "==", filters.category));
    }

    if (filters.subscriptionPlan && filters.subscriptionPlan !== "All") {
      constraints.unshift(where("subscriptionPlan", "==", filters.subscriptionPlan));
    }

    const q = query(collection(db, path), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const subscribeToUserResults = (userId: string, callback: (results: TestResult[]) => void) => {
  const path = "results";
  const q = query(
    collection(db, path),
    where("userId", "==", userId),
    orderBy("timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestResult));
    callback(results);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};
