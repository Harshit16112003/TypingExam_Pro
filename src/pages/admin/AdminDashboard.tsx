import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion } from "motion/react";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingPayments: number;
  totalParagraphs: number;
}

const AdminDashboard: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [adminToken]);

  if (loading) return <div className="text-white">Loading stats...</div>;

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "blue" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions || 0, icon: CheckCircle2, color: "green" },
    { label: "Pending Payments", value: stats?.pendingPayments || 0, icon: Clock, color: "yellow" },
    { label: "Total Paragraphs", value: stats?.totalParagraphs || 0, icon: FileText, color: "purple" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Real-time statistics and insights</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-900 border border-gray-800 p-6 rounded-2xl"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${card.color}-500/10 text-${card.color}-400`}>
              <card.icon size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">{card.label}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                <div>
                  <p className="text-white text-sm font-medium">New user registered: John Doe</p>
                  <p className="text-gray-500 text-xs mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm font-medium transition-all">
              Add New User
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm font-medium transition-all">
              Create Paragraph
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm font-medium transition-all">
              View Reports
            </button>
            <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm font-medium transition-all">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
