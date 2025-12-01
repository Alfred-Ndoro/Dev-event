import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Create the Context
const AuthContext = createContext();

const API_URL = "http://localhost:3000/users";

// 2. Custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Auth Provider Component
export const AuthProvider = ({ children }) => {
  // State to hold the current authenticated user (null if logged out)
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * 🔒 Login Function
   * Finds a user with matching email and password.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const users = await response.json();

      // Find user by email and check password
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Successful login
        const userData = { id: user.id, email: user.email }; // Only store safe data
        setCurrentUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        return { success: true, message: "Login successful!" };
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 📝 Sign Up Function
   * Creates a new user entry in the db.json file.
   * NOTE: JSON Server needs the POST body to include an 'id' or it will generate one.
   * This example assumes the user object includes 'email' and 'password'.
   */
  const signup = async (email, password) => {
    setLoading(true);
    try {
      // 1. Check if user already exists (optional, but good practice)
      const checkResponse = await fetch(`${API_URL}?email=${email}`);
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        throw new Error("A user with this email already exists.");
      }

      // 2. Perform the POST request to create the user
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // IMPORTANT: The password will be stored in PLAIN TEXT in db.json.
        // For a real app, you MUST hash the password on a real backend.
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user account.");
      }

      const newUser = await response.json();

      // Auto-log the user in after successful signup
      const userData = { id: newUser.id, email: newUser.email };
      setCurrentUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return { success: true, message: "Account created and logged in!" };
    } catch (error) {
      console.error("Signup Error:", error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🚪 Logout Function
   * Clears the current user from state and local storage.
   */
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  // 4. Context Value
  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser, // Boolean flag for easy checking
  };

  // 5. Provide the context value to children
  return (
    <AuthContext.Provider value={value}>
      {/* Only render children once loading from local storage is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
