import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  FileText, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { motion, AnimatePresence } from "motion/react";

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/payments", icon: CreditCard, label: "Payments" },
    { path: "/admin/content", icon: FileText, label: "Content" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed inset-y-0 left-0 w-72 bg-gray-900 border-r border-gray-800 z-40 flex flex-col"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg leading-none">Admin Panel</h2>
                  <p className="text-gray-500 text-xs mt-1">Management System</p>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                        isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-8">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
