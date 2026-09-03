import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    health_assessments: 0,
    ai_conversations: 0,
    health_records: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  // ============================================================
  // PROFILE PHOTO URL
  // ============================================================

  const getPhotoUrl = (photo) => {
    if (!photo) {
      return null;
    }

    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }

    return `${API_URL}${photo}`;
  };

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        // ------------------------------------------------------
        // SESSION EXPIRED
        // ------------------------------------------------------

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load user profile."
          );
        }

        // ------------------------------------------------------
        // SAVE UPDATED USER
        // ------------------------------------------------------

        const updatedUser = {
          id: data.id,
          name: data.name,
          email: data.email,
          profile_photo: data.profile_photo || null,
        };

        setUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

      } catch (error) {
        console.error(
          "User loading error:",
          error
        );

        // ------------------------------------------------------
        // FALLBACK TO LOCAL STORAGE
        // ------------------------------------------------------

        const storedUser =
          localStorage.getItem("user");

        if (storedUser) {
          try {
            const parsedUser =
              JSON.parse(storedUser);

            if (
              parsedUser &&
              parsedUser.id
            ) {
              setUser(parsedUser);
            } else {
              navigate("/login");
            }

          } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");

            navigate("/login");
          }

        } else {
          navigate("/login");
        }
      }
    };

    loadUser();
  }, [navigate]);

  // ============================================================
  // LOAD DASHBOARD STATS
  // ============================================================

  useEffect(() => {
    const loadStats = async () => {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/dashboard/stats`,
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data =
          await response.json();

        // ------------------------------------------------------
        // SESSION EXPIRED
        // ------------------------------------------------------

        if (response.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");

          return;
        }

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to load dashboard statistics."
          );
        }

        setStats({
          health_assessments:
            Number(
              data.health_assessments
            ) || 0,

          ai_conversations:
            Number(
              data.ai_conversations
            ) || 0,

          health_records:
            Number(
              data.health_records
            ) || 0,
        });

      } catch (error) {
        console.error(
          "Dashboard stats error:",
          error
        );

      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [navigate]);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "user"
    );

    navigate("/login");
  };

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigationItems = [
    {
      label: "Dashboard",
      icon: "⌂",
      action: () => navigate("/dashboard"),
      active: true,
    },

    {
      label: "AI Assistant",
      icon: "✦",
      action: () => navigate("/chat"),
    },

    {
      label: "Health Assessment",
      icon: "♡",
      action: () => navigate("/assessment"),
    },

    {
      label: "Health History",
      icon: "▤",
      action: () => navigate("/history"),
    },

    {
      label: "Health Information",
      icon: "＋",
      action: () =>
        navigate("/health-information"),
    },
  ];

  // ============================================================
  // GREETING
  // ============================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Preparing your health dashboard...
        </p>
      </div>
    );
  }

  // ============================================================
  // USER DATA
  // ============================================================

  const firstName =
    user.name?.split(" ")[0] ||
    "there";

  const userInitial =
    user.name?.charAt(0).toUpperCase() ||
    "U";

  const profilePhoto =
    getPhotoUrl(user.profile_photo);

  // ============================================================
  // DASHBOARD
  // ============================================================

  return (
    <div className="dashboard-page">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="dashboard-sidebar">

        {/* BRAND */}

        <div className="sidebar-brand">

          <div className="brand-mark">
            M
          </div>

          <div>

            <div className="dashboard-logo">
              MediAssist  <span>AI</span>
            </div>

            <small>
              Smart Health Companion
            </small>

          </div>

        </div>


        {/* SECTION LABEL */}

        <div className="sidebar-section-label">
          WORKSPACE
        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-menu">

          {navigationItems.map(
            (item) => (

              <button
                key={item.label}
                type="button"
                className={`sidebar-button ${
                  item.active
                    ? "active"
                    : ""
                }`}
                onClick={item.action}
              >

                <span className="sidebar-icon">
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>

                {item.active && (
                  <span className="active-dot"></span>
                )}

              </button>
            )
          )}

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          {/* PROFILE */}

          <button
            type="button"
            className="sidebar-button"
            onClick={() =>
              navigate("/profile")
            }
          >

            <span className="sidebar-icon">
              ◯
            </span>

            Profile

          </button>


          {/* SETTINGS */}

          <button
            type="button"
            className="sidebar-button"
            onClick={() =>
              navigate("/settings")
            }
          >

            <span className="sidebar-icon">
              ⚙
            </span>

            Settings

          </button>


          {/* USER */}

          <div className="sidebar-user">

            <div className="sidebar-avatar">

              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                />
              ) : (
                userInitial
              )}

            </div>

            <div className="sidebar-user-info">

              <strong>
                {user.name || "User"}
              </strong>

              <span>
                {user.email || ""}
              </span>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
          >

            <span>
              ↪
            </span>

            Sign out

          </button>

        </div>

      </aside>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="dashboard-main">


        {/* ====================================================
            TOPBAR
        ==================================================== */}

        <header className="dashboard-topbar">

          {/* MOBILE BRAND */}

          <div className="mobile-brand">

            <div className="brand-mark">
              M
            </div>

            <strong>
              MediAssist <span>AI</span>
            </strong>

          </div>


          {/* TOPBAR RIGHT */}

          <div className="topbar-right">

            {/* SECURE SESSION */}

            <div className="secure-indicator">

              <span className="secure-dot"></span>

              Secure session

            </div>


            {/* SETTINGS */}

            <button
              type="button"
              className="topbar-icon-button"
              onClick={() =>
                navigate("/settings")
              }
              title="Settings"
              aria-label="Settings"
            >
              ⚙
            </button>


            {/* PROFILE */}

            <button
              type="button"
              className="topbar-profile"
              onClick={() =>
                navigate("/profile")
              }
              aria-label="Open profile"
            >

              <div className="topbar-avatar">

                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                  />
                ) : (
                  userInitial
                )}

              </div>

              <div className="topbar-user-text">

                <strong>
                  {firstName}
                </strong>

                <span>
                  My account
                </span>

              </div>

            </button>

          </div>

        </header>


        {/* ====================================================
            DASHBOARD CONTENT
        ==================================================== */}

        <div className="dashboard-content">


          {/* PAGE HEADING */}

          <div className="page-heading">

            <div>

              <span className="eyebrow">
                YOUR HEALTH SPACE
              </span>

              <h1>
                {getGreeting()}, {firstName}{" "}
                <span>👋</span>
              </h1>

              <p>
                Stay informed, understand your
                symptoms, and keep your health
                information organized.
              </p>

            </div>

          </div>


          {/* ==================================================
              HERO
          ================================================== */}

          <section className="dashboard-hero">

            <div className="hero-content">

              <div className="hero-badge">

                <span className="hero-badge-dot"></span>

                AI HEALTH ASSISTANT READY

              </div>


              <h2>

                Your health questions,
                <br />

                <span>
                  simplified.
                </span>

              </h2>


              <p>
                Get general health information,
                explore symptoms, and keep track
                of your MediAssist AI activity —
                all in one place.
              </p>


              <div className="hero-actions">

                <button
                  type="button"
                  className="primary-action"
                  onClick={() =>
                    navigate("/assessment")
                  }
                >

                  <span>
                    ♡
                  </span>

                  Start Assessment

                  <span>
                    →
                  </span>

                </button>


                <button
                  type="button"
                  className="secondary-action"
                  onClick={() =>
                    navigate("/chat")
                  }
                >

                  <span>
                    ✦
                  </span>

                  Ask AI Assistant

                </button>

              </div>

            </div>


            {/* HERO VISUAL */}

            <div className="hero-visual">

              <div className="hero-orbit orbit-one"></div>

              <div className="hero-orbit orbit-two"></div>


              <div className="hero-ai-card">

                <div className="ai-pulse">
                  ✦
                </div>

                <span>
                  MediAssist
                </span>

                <strong>
                  AI
                </strong>

                <small>
                  Here to help you understand
                </small>

              </div>


              <div className="floating-card floating-card-top">

                <span>
                  AI
                </span>

                <div>

                  <strong>
                    Available
                  </strong>

                  <small>
                    Ready to assist
                  </small>

                </div>

              </div>


              <div className="floating-card floating-card-bottom">

                <span>
                  ✓
                </span>

                <div>

                  <strong>
                    Private & Secure
                  </strong>

                  <small>
                    Your account is protected
                  </small>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              STATS
          ================================================== */}

          <section className="section-block">

            <div className="section-heading">

              <div>

                <span className="section-kicker">
                  OVERVIEW
                </span>

                <h2>
                  Your health activity
                </h2>

              </div>

              <span className="live-label">
                ● Live data
              </span>

            </div>


            <div className="stats-grid">


              {/* ASSESSMENTS */}

              <div className="stat-card">

                <div className="stat-card-top">

                  <div className="stat-icon assessment-stat">
                    ♡
                  </div>

                  <span className="stat-arrow">
                    ↗
                  </span>

                </div>

                <div className="stat-value">

                  {loadingStats
                    ? "..."
                    : stats.health_assessments}

                </div>

                <div className="stat-title">
                  Health Assessments
                </div>

                <p>
                  Completed symptom assessments
                </p>

              </div>


              {/* AI CONVERSATIONS */}

              <div className="stat-card">

                <div className="stat-card-top">

                  <div className="stat-icon ai-stat">
                    ✦
                  </div>

                  <span className="stat-arrow">
                    ↗
                  </span>

                </div>

                <div className="stat-value">

                  {loadingStats
                    ? "..."
                    : stats.ai_conversations}

                </div>

                <div className="stat-title">
                  AI Conversations
                </div>

                <p>
                  Questions discussed with AI
                </p>

              </div>


              {/* HEALTH RECORDS */}

              <div className="stat-card">

                <div className="stat-card-top">

                  <div className="stat-icon record-stat">
                    ▤
                  </div>

                  <span className="stat-arrow">
                    ↗
                  </span>

                </div>

                <div className="stat-value">

                  {loadingStats
                    ? "..."
                    : stats.health_records}

                </div>

                <div className="stat-title">
                  Health Records
                </div>

                <p>
                  Saved health information
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="section-block">

            <div className="section-heading">

              <div>

                <span className="section-kicker">
                  SHORTCUTS
                </span>

                <h2>
                  What would you like to do?
                </h2>

              </div>

            </div>


            <div className="quick-action-grid">


              {/* ASSESSMENT */}

              <button
                type="button"
                className="quick-action-card blue-action"
                onClick={() =>
                  navigate("/assessment")
                }
              >

                <div className="quick-action-icon">
                  ♡
                </div>

                <div className="quick-action-content">

                  <span>
                    HEALTH ASSESSMENT
                  </span>

                  <h3>
                    Check your symptoms
                  </h3>

                  <p>
                    Describe what you're experiencing
                    and receive general health information.
                  </p>

                </div>

                <div className="quick-action-arrow">
                  →
                </div>

              </button>


              {/* AI ASSISTANT */}

              <button
                type="button"
                className="quick-action-card purple-action"
                onClick={() =>
                  navigate("/chat")
                }
              >

                <div className="quick-action-icon">
                  ✦
                </div>

                <div className="quick-action-content">

                  <span>
                    AI ASSISTANT
                  </span>

                  <h3>
                    Ask a health question
                  </h3>

                  <p>
                    Get simple, easy-to-understand
                    general health information.
                  </p>

                </div>

                <div className="quick-action-arrow">
                  →
                </div>

              </button>


              {/* HISTORY */}

              <button
                type="button"
                className="quick-action-card green-action"
                onClick={() =>
                  navigate("/history")
                }
              >

                <div className="quick-action-icon">
                  ▤
                </div>

                <div className="quick-action-content">

                  <span>
                    HEALTH HISTORY
                  </span>

                  <h3>
                    Review your records
                  </h3>

                  <p>
                    View your previous assessments
                    and saved AI health information.
                  </p>

                </div>

                <div className="quick-action-arrow">
                  →
                </div>

              </button>

            </div>

          </section>


          {/* ==================================================
              LOWER GRID
          ================================================== */}

          <section className="dashboard-lower-grid">

            {/* ACTIVITY */}

            <div className="dashboard-panel">

              <div className="panel-heading">

                <div>

                  <span className="section-kicker">
                    ACTIVITY
                  </span>

                  <h2>
                    You MediAssist journey
                  </h2>

                </div>

              </div>


              <div className="activity-timeline">

                <div className="timeline-item">

                  <div className="timeline-icon">
                    1
                  </div>

                  <div>

                    <strong>
                      Describe
                    </strong>

                    <p>
                      Tell MediAssist what you're
                      experiencing.
                    </p>

                  </div>

                </div>


                <div className="timeline-line"></div>


                <div className="timeline-item">

                  <div className="timeline-icon">
                    2
                  </div>

                  <div>

                    <strong>
                      Understand
                    </strong>

                    <p>
                      AI provides general health
                      information in simple language.
                    </p>

                  </div>

                </div>


                <div className="timeline-line"></div>


                <div className="timeline-item">

                  <div className="timeline-icon">
                    3
                  </div>

                  <div>

                    <strong>
                      Keep track
                    </strong>

                    <p>
                      Your completed assessments are
                      saved in Health History.
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* SYSTEM STATUS */}

            <div className="dashboard-panel status-panel">

              <div className="panel-heading">

                <div>

                  <span className="section-kicker">
                    SYSTEM
                  </span>

                  <h2>
                    Service status
                  </h2>

                </div>

                <span className="status-online">
                  Operational
                </span>

              </div>


              <div className="service-row">

                <div className="service-icon">
                  ✦
                </div>

                <div className="service-info">

                  <strong>
                    AI Assistant
                  </strong>

                  <span>
                    General health information
                  </span>

                </div>

                <span className="service-dot"></span>

              </div>


              <div className="service-row">

                <div className="service-icon">
                  ♡
                </div>

                <div className="service-info">

                  <strong>
                    Health Assessment
                  </strong>

                  <span>
                    Symptom assessment service
                  </span>

                </div>

                <span className="service-dot"></span>

              </div>


              <div className="service-row">

                <div className="service-icon">
                  ▤
                </div>

                <div className="service-info">

                  <strong>
                    Health History
                  </strong>

                  <span>
                    Your saved assessments
                  </span>

                </div>

                <span className="service-dot"></span>

              </div>


              <div className="privacy-note">

                <span>
                  🔒
                </span>

                <p>
                  Your MediAssist account requires
                  authentication to access personal
                  health information.
                </p>

              </div>

            </div>

          </section>


          {/* ==================================================
              HEALTH INFORMATION
          ================================================== */}

          <section className="information-banner">

            <div className="information-icon">
              +
            </div>

            <div>

              <span>
                HEALTH INFORMATION
              </span>

              <h3>
                Learn more about staying healthy
              </h3>

              <p>
                Explore general wellness information,
                common symptoms, prevention tips,
                and important warning signs.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/health-information"
                )
              }
            >
              Explore Information →
            </button>

          </section>


          {/* ==================================================
              DISCLAIMER
          ================================================== */}

          <div className="dashboard-disclaimer">

            <div className="disclaimer-icon">
              ⚠
            </div>

            <div>

              <strong>
                Medical information disclaimer
              </strong>

              <p>
                MediAssist AI provides general health
                information for educational purposes.
                It is not a doctor and does not provide
                a medical diagnosis, treatment, or
                prescription. If you have severe or
                emergency symptoms, seek immediate
                professional medical attention.
              </p>

            </div>

          </div>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="dashboard-footer">

            <span>
              © 2026 MediAssist AI
            </span>

            <span>
              Built for smarter health awareness
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;