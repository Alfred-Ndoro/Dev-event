import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "./api";

// 1. Create the Context
const AuthContext = createContext();

// 2. Custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Auth Provider Component
export const AuthProvider = ({ children }) => {
  // State to hold the current authenticated user (null if logged out)
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on component mount
  useEffect(() => {
    // Restore session from localStorage
    const savedUser = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  /**
   * 🔒 Login Function
   * Finds a user with matching email and password.
   */
  const login = async (email, password) => {
    const response = await authAPI.login(email, password);

    // Decode token to get user info (simple decode, not verification)
    const payload = JSON.parse(atob(response.access_token.split(".")[1]));
    const user = { id: payload.id, email: payload.sub };

    setCurrentUser(user);
    setToken(response.access_token);

    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("token", response.access_token);

    return user;
  };

  /**
   * 📝 Sign Up Function
   * Creates a new user entry in the db.json file.
   * NOTE: JSON Server needs the POST body to include an 'id' or it will generate one.
   * This example assumes the user object includes 'email' and 'password'.
   */
  const signup = async (email, password) => {
    const user = await authAPI.signup(email, password);
    // Auto-login after signup
    return login(email, password);
  };

  /**
   * 🚪 Logout Function
   * Clears the current user from state and local storage.
   */
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.email === "deveventadmin@gmail.com";

  // 4. Context Value
  const value = {
    currentUser,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated, // Boolean flag for easy checking
    isAdmin,
  };

  // 5. Provide the context value to children
  return (
    <AuthContext.Provider value={value}>
      {/* Only render children once loading from local storage is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
