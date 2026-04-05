import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem("admin_token"));

  const login = (token: string) => {
    localStorage.setItem("admin_token", token);
    setAdminToken(token);
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setAdminToken(null);
  };

  const isAdminAuthenticated = !!adminToken;

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminToken, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
