import { useAuth } from "@/lib/auth-context";
import { useLocation } from "react-router-dom";
import NavBar from "./NavBar";
import LandingNavBar from "./LandingNavBar";

const ConditionalNavBar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Don't show navbar on landing page
  if (location.pathname === "/") {
    return null;
  }

  // Show authenticated navbar for logged-in users
  if (isAuthenticated) {
    return <NavBar />;
  }

  // No navbar for unauthenticated users on other pages
  return null;
};

export default ConditionalNavBar;
