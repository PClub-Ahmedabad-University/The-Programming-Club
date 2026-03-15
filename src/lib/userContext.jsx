"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getUserRoleFromToken } from "@/lib/auth";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);
      setUserRole(getUserRoleFromToken(storedToken));
    }
  }, []);

  return (
    <UserContext.Provider value={{ token, userRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);