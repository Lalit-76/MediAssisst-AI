import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import HealthHistory from "./pages/HealthHistory.jsx";
import HealthInformation from "./pages/HealthInformation.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import SymptomAssessment from "./pages/SymptomAssessment.jsx";

import "./App.css";

/* =========================================================
   PAGE TRANSITION
========================================================= */

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div className="page-transition" key={location.pathname}>
      <Routes location={location}>
        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* AI CHAT */}
        <Route path="/chat" element={<Chat />} />

        {/* HEALTH / SYMPTOM ASSESSMENT */}
        <Route
          path="/health-assessment"
          element={<SymptomAssessment />}
        />

        <Route
          path="/assessment"
          element={<SymptomAssessment />}
        />

        <Route
          path="/symptom-assessment"
          element={<SymptomAssessment />}
        />

        {/* HEALTH HISTORY */}
        <Route
          path="/health-history"
          element={<HealthHistory />}
        />

        <Route
          path="/history"
          element={<HealthHistory />}
        />

        {/* HEALTH INFORMATION */}
        <Route
          path="/health-information"
          element={<HealthInformation />}
        />

        {/* PROFILE */}
        <Route path="/profile" element={<Profile />} />

        {/* SETTINGS */}
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;