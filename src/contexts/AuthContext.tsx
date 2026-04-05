import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut, 
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Subscribe to user profile in Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        
        // Initial check if profile exists, if not create it
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              subscription: {
                planId: "free",
                status: "none",
                expiresAt: Date.now(),
              },
              stats: {
                totalTests: 0,
                avgWpm: 0,
                maxWpm: 0,
                avgAccuracy: 0,
              },
            };
            await setDoc(userRef, newProfile);
          }
        } catch (err) {
          console.error("Error checking/creating user profile in useEffect:", err);
        }

        const unsubscribeProfile = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUser(doc.data() as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Update Auth Profile
      try {
        await updateProfile(userCredential.user, { displayName: name });
      } catch (profileErr) {
        console.error("Error updating auth profile:", profileErr);
        // Continue even if profile update fails, we'll set it in Firestore
      }
      
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        subscription: {
          planId: "free",
          status: "none",
          expiresAt: Date.now(),
        },
        stats: {
          totalTests: 0,
          avgWpm: 0,
          maxWpm: 0,
          avgAccuracy: 0,
        },
      };

      // Create Firestore Profile
      try {
        await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      } catch (dbErr) {
        console.error("Error creating firestore profile:", dbErr);
        // If this fails, the useEffect fallback will try again
      }
    } catch (err: any) {
      console.error("Signup core error:", err);
      throw err; // Re-throw to be caught by the Signup page
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
