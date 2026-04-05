import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { 
  Users, 
  Search, 
  MoreVertical, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert,
  UserCheck,
  UserX
} from "lucide-react";
import { motion } from "motion/react";

interface User {
  id: string;
  email: string;
  displayName?: string;
  subscription?: {
    planId: string;
    expiresAt: number;
  };
  role?: string;
}

const AdminUsers: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [adminToken]);

  const handleToggleSubscription = async (userId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/subscription`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ planId: "1-month", durationDays: 30, active }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle subscription", err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-2">View and manage all registered users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 w-full md:w-80"
          />
        </div>
      </header>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/50 border-b border-gray-800">
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">User</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Subscription</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Role</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                          {user.displayName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.displayName || "Anonymous"}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.subscription ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-lg font-medium uppercase ${
                            user.subscription.status === "active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {user.subscription.planId}
                          </span>
                          <span className="text-gray-500 text-xs">
                            Exp: {new Date(user.subscription.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-gray-800 text-gray-500 text-xs rounded-lg font-medium uppercase">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium uppercase ${
                        user.role === "admin" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {user.role || "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleSubscription(user.id, !user.subscription)}
                          className={`p-2 rounded-lg transition-all ${
                            user.subscription ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                          title={user.subscription ? "Deactivate Subscription" : "Activate Subscription"}
                        >
                          {user.subscription ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
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

export default AdminUsers;
