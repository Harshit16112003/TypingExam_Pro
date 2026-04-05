import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { QrCode, Upload, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "../constants";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planId = searchParams.get("plan");
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    transactionId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) {
      navigate("/subscription");
    }
    if (user) {
      setFormData((prev) => ({ ...prev, email: user.email || "" }));
    }
  }, [plan, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to continue");
      return;
    }
    if (!plan) return;

    setLoading(true);
    setError(null);

    try {
      let screenshotUrl = "";
      if (file) {
        const storageRef = ref(storage, `payments/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        screenshotUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "payments"), {
        userId: user.uid,
        userName: formData.name,
        userEmail: formData.email,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        transactionId: formData.transactionId,
        screenshotUrl,
        status: "pending",
        timestamp: Date.now(),
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl bg-white p-12 shadow-xl border border-gray-100"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Payment Submitted!</h2>
          <p className="mt-4 text-lg text-gray-600">
            Your payment request has been sent for approval. It usually takes 2-4 hours to activate your subscription.
          </p>
          <p className="mt-2 text-indigo-600 font-medium">Waiting for admin approval</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate("/subscription")}
        className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plans
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: UPI Details */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Payment</h1>
          <p className="mt-4 text-gray-600">
            Follow the instructions below to pay for your <span className="font-bold text-indigo-600">{plan?.name}</span> plan.
          </p>

          <div className="mt-8 rounded-3xl bg-indigo-50 p-8 border border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600 uppercase tracking-wider">UPI Payment</p>
                <p className="text-lg font-bold text-gray-900">Scan to Pay</p>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <div className="relative rounded-2xl bg-white p-4 shadow-md">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=bhorgadeharshit@okaxis%26pn=TypingMaster%26am=79%26cu=INR"
                  alt="UPI QR Code"
                  className="h-48 w-48"
                  referrerPolicy="no-referrer"
                />
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">UPI ID</p>
                  <p className="font-mono text-sm font-bold text-gray-900">bhorgadeharshit@okaxis</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</div>
                <p className="text-sm text-gray-600">Scan the QR code or use the UPI ID to pay <span className="font-bold text-gray-900">₹{plan?.price}</span>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">2</div>
                <p className="text-sm text-gray-600">Take a screenshot of the successful payment.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">3</div>
                <p className="text-sm text-gray-600">Fill the form and upload the screenshot here.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">4</div>
                <p className="text-sm text-gray-600">Alternatively, send the screenshot on WhatsApp with your email.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Submission Form */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Submit Payment Details</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address / Username</label>
              <input
                type="text"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID (Optional)</label>
              <input
                type="text"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter UPI Transaction ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Screenshot (Optional)</label>
              <div className="mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition-colors hover:border-indigo-400">
                <div className="text-center">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                      <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="mt-2 text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="mt-4 flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Payment Details"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
