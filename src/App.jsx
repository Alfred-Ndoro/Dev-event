import { BrowserRouter, Route, Routes } from "react-router-dom";
import LightRays from "./components/LightRays";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";
import EventPage from "./pages/EventPage";

function App() {
  return (
    <>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:slug" element={<EventPage />} />
        </Routes>
      </BrowserRouter>

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
