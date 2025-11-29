import { BrowserRouter, Route, Routes } from "react-router-dom";
import LightRays from "./components/LightRays";
import HomePage from "./pages/HomePage";
import EventPage from "./pages/EventPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import LandingPage from "./pages/LandingPage";
import ConditionalNavBar from "./components/ConditionalNavBar";
import { AuthProvider } from "./lib/auth-context";
import ManageBookings from "./pages/ManageBookings";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <ConditionalNavBar />
          <Routes>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/events/:slug" element={<EventPage />} />
            <Route path="/bookings" element={<ManageBookings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>

      <div className="absolute inset-0 top-0 z-[-1] min-h-screen">
        <LightRays
          raysOrigin="top-center-offset"
          raysColor="#5dfeca"
          raysSpeed={0.5}
          lightSpread={0.9}
          rayLength={1.4}
          followMouse={true}
          mouseInfluence={0.02}
          noiseAmount={0.0}
          distortion={0.01}
        />
      </div>
    </>
  );
}

export default App;
