import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Keyboard, User, LayoutDashboard, CreditCard, LogOut, Trophy, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Tests", path: "/tests", icon: Keyboard },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Subscription", path: "/subscription", icon: CreditCard },
    { name: "Help", path: "https://wa.me/916265641092", icon: MessageCircle, external: true },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <Keyboard className="h-8 w-8" />
            <span className="hidden sm:inline">TypingExam Pro</span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          {navItems.map((item) => {
            const isExternal = item.external;
            const Component = isExternal ? "a" : Link;
            const props = isExternal 
              ? { href: item.path, target: "_blank", rel: "noopener noreferrer" } 
              : { to: item.path };

            return (
              <Component
                key={item.path}
                {...props as any}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-indigo-600",
                  !isExternal && location.pathname === item.path ? "text-indigo-600" : "text-gray-600"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.name}</span>
              </Component>
            );
          })}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{user.displayName || "Profile"}</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
