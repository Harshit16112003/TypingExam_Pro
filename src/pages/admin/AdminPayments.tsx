import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  ExternalLink,
  User,
  Calendar
} from "lucide-react";
import { motion } from "motion/react";

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  transactionId?: string;
  screenshotUrl?: string;
  timestamp: number;
}

const AdminPayments: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [adminToken]);

  const handleApprove = async (paymentId: string, status: "approved" | "rejected") => {
    try {
      await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ status }),
      });
      fetchPayments();
    } catch (err) {
      console.error("Failed to approve payment", err);
    }
  };

  const filteredPayments = payments.filter(p => filter === "all" || p.status === filter);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Approvals</h1>
          <p className="text-gray-400 mt-2">Manage subscription payments and approvals</p>
        </div>
        <div className="flex bg-gray-900 border border-gray-800 p-1 rounded-xl">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">User</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Plan & Amount</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Date</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading payments...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No payments found</td></tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-800/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{payment.userName || "Anonymous"}</p>
                          <p className="text-gray-500 text-xs">{payment.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium uppercase">{payment.planName || payment.planId}</p>
                        <p className="text-indigo-400 text-sm font-bold">₹{payment.price || (payment as any).amount}</p>
                        {payment.transactionId && (
                          <p className="text-gray-500 text-[10px] mt-1 font-mono">ID: {payment.transactionId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase flex items-center gap-1 w-fit ${
                        payment.status === "approved" ? "bg-green-500/10 text-green-400" :
                        payment.status === "rejected" ? "bg-red-500/10 text-red-400" :
                        "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {payment.status === "approved" ? <CheckCircle2 size={12} /> :
                         payment.status === "rejected" ? <XCircle size={12} /> :
                         <Clock size={12} />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Calendar size={14} />
                        {new Date(payment.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {payment.screenshotUrl && (
                          <a 
                            href={payment.screenshotUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all"
                            title="View Screenshot"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                        {payment.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleApprove(payment.id, "approved")}
                              className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-all"
                              title="Approve"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleApprove(payment.id, "rejected")}
                              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
