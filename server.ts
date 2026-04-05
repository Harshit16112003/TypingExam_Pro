import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// In this environment, we can use the service account if provided, 
// but usually we can just use the project ID if running in Cloud Run.
// However, for local dev, we might need a service account.
// Since we don't have one, we'll try to initialize with default credentials.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "typing-practice-app"
  });
}

const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Admin Credentials (Hashed)
  // Default password is 'admin123' for now, but should be set via env
  const ADMIN_USER = "admin";
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync("admin123", 10);
  const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

  // Middleware to verify Admin JWT
  const verifyAdmin = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.admin = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Admin Stats
  app.get("/api/admin/stats", verifyAdmin, async (req, res) => {
    try {
      const usersSnap = await db.collection("users").get();
      const paragraphsSnap = await db.collection("paragraphs").get();
      
      // Active subscriptions (expiresAt > now)
      const now = Date.now();
      const activeSubs = usersSnap.docs.filter(doc => {
        const data = doc.data();
        return data.subscription?.expiresAt > now;
      }).length;

      // Pending payments (assuming a 'payments' collection or status in users)
      const pendingPaymentsSnap = await db.collection("payments").where("status", "==", "pending").get();

      res.json({
        totalUsers: usersSnap.size,
        activeSubscriptions: activeSubs,
        pendingPayments: pendingPaymentsSnap.size,
        totalParagraphs: paragraphsSnap.size
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Management
  app.get("/api/admin/users", verifyAdmin, async (req, res) => {
    try {
      const usersSnap = await db.collection("users").get();
      const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/users/:userId/subscription", verifyAdmin, async (req, res) => {
    const { userId } = req.params;
    const { planId, durationDays, active } = req.body;
    try {
      const userRef = db.collection("users").doc(userId);
      if (active) {
        const expiresAt = Date.now() + (durationDays || 30) * 24 * 60 * 60 * 1000;
        await userRef.update({
          subscription: { planId, expiresAt, status: "active" }
        });
      } else {
        await userRef.update({
          subscription: admin.firestore.FieldValue.delete()
        });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/users/:userId", verifyAdmin, async (req, res) => {
    const { userId } = req.params;
    try {
      await db.collection("users").doc(userId).delete();
      // Also delete from Auth if possible, but Admin SDK needed for that
      await admin.auth().deleteUser(userId).catch(() => {}); 
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Payment Management
  app.get("/api/admin/payments", verifyAdmin, async (req, res) => {
    try {
      const paymentsSnap = await db.collection("payments").orderBy("timestamp", "desc").get();
      const payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/payments/:paymentId/approve", verifyAdmin, async (req, res) => {
    const { paymentId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    try {
      const paymentRef = db.collection("payments").doc(paymentId);
      const paymentSnap = await paymentRef.get();
      if (!paymentSnap.exists) return res.status(404).json({ error: "Payment not found" });

      const paymentData = paymentSnap.data()!;
      await paymentRef.update({ status, updatedAt: Date.now() });

      if (status === "approved") {
        const userRef = db.collection("users").doc(paymentData.userId);
        const durationDays = paymentData.planId === "1-month" ? 30 : 
                            paymentData.planId === "3-months" ? 90 :
                            paymentData.planId === "1-year" ? 365 : 30;
        
        const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
        await userRef.update({
          subscription: { planId: paymentData.planId, expiresAt, status: "active" }
        });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Content Management
  app.get("/api/admin/paragraphs", verifyAdmin, async (req, res) => {
    try {
      const paragraphsSnap = await db.collection("paragraphs").get();
      const paragraphs = paragraphsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(paragraphs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/paragraphs", verifyAdmin, async (req, res) => {
    try {
      const docRef = await db.collection("paragraphs").add({
        ...req.body,
        createdAt: Date.now()
      });
      res.json({ id: docRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/paragraphs/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("paragraphs").doc(id).update({
        ...req.body,
        updatedAt: Date.now()
      });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/paragraphs/:id", verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      await db.collection("paragraphs").doc(id).delete();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
