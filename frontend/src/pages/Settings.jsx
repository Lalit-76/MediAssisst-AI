import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState(true);
  const [healthReminders, setHealthReminders] = useState(true);

  const [message, setMessage] = useState("");

  // ============================================================
  // LOAD USER AND SETTINGS
  // ============================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser || !parsedUser.id) {
        throw new Error("Invalid user data");
      }

      setUser(parsedUser);

      // Load saved preferences
      const savedNotifications =
        localStorage.getItem("notifications");

      const savedHealthReminders =
        localStorage.getItem("healthReminders");

      if (savedNotifications !== null) {
        setNotifications(savedNotifications === "true");
      }

      if (savedHealthReminders !== null) {
        setHealthReminders(
          savedHealthReminders === "true"
        );
      }
    } catch (error) {
      console.error("Invalid user data:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      navigate("/login");
    }
  }, [navigate]);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const handleNotifications = () => {
    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "notifications",
      String(newValue)
    );

    showMessage(
      newValue
        ? "Notifications enabled."
        : "Notifications disabled."
    );
  };

  // ============================================================
  // HEALTH REMINDERS
  // ============================================================

  const handleHealthReminders = () => {
    const newValue = !healthReminders;

    setHealthReminders(newValue);

    localStorage.setItem(
      "healthReminders",
      String(newValue)
    );

    showMessage(
      newValue
        ? "Health reminders enabled."
        : "Health reminders disabled."
    );
  };

  // ============================================================
  // MESSAGE
  // ============================================================

  const showMessage = (text) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = () => {
    alert(
      "Password change functionality will be added in the next step."
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (!user) {
    return (
      <div className="settings-loading">
        Loading settings...
      </div>
    );
  }

  // ============================================================
  // SETTINGS UI
  // ============================================================

  return (
    <div className="settings-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="settings-header">

        <div
          className="settings-logo"
          onClick={() => navigate("/dashboard")}
        >
          MediAssist <span>AI</span>
        </div>

        <div className="settings-header-actions">

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="settings-container">

        {/* PAGE TITLE */}

        <div className="settings-title">

          <div className="settings-main-icon">
            ⚙️
          </div>

          <div>

            <h1>
              Settings
            </h1>

            <p>
              Manage your MediAssist AI account and preferences.
            </p>

          </div>

        </div>


        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {message && (
          <div className="settings-message">
            ✓ {message}
          </div>
        )}


        {/* ====================================================
            ACCOUNT SETTINGS
        ==================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              👤
            </div>

            <div>

              <h2>
                Account
              </h2>

              <p>
                Your current account information.
              </p>

            </div>

          </div>


          <div className="settings-row">

            <div className="settings-row-info">

              <span className="settings-label">
                Name
              </span>

              <strong>
                {user.name || "Not available"}
              </strong>

            </div>

          </div>


          <div className="settings-row">

            <div className="settings-row-info">

              <span className="settings-label">
                Email
              </span>

              <strong>
                {user.email || "Not available"}
              </strong>

            </div>

          </div>


          <div className="settings-row">

            <div className="settings-row-info">

              <span className="settings-label">
                User ID
              </span>

              <strong>
                {user.id}
              </strong>

            </div>

          </div>

        </section>


        {/* ====================================================
            SECURITY
        ==================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              🔐
            </div>

            <div>

              <h2>
                Security
              </h2>

              <p>
                Manage your account security.
              </p>

            </div>

          </div>


          <div className="settings-row">

            <div className="settings-row-info">

              <span className="settings-label">
                Password
              </span>

              <strong>
                ••••••••••••
              </strong>

            </div>


            <button
              className="settings-action-button"
              onClick={handleChangePassword}
            >
              Change Password
            </button>

          </div>


          <div className="settings-security-note">

            🛡️ Your password is securely hashed before
            being stored. MediAssist AI does not store
            your password as plain text.

          </div>

        </section>


        {/* ====================================================
            NOTIFICATIONS
        ==================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              🔔
            </div>

            <div>

              <h2>
                Notifications
              </h2>

              <p>
                Manage your notification preferences.
              </p>

            </div>

          </div>


          {/* GENERAL NOTIFICATIONS */}

          <div className="settings-row">

            <div className="settings-row-info">

              <span className="settings-label">
                Notifications
              </span>

              <p>
                Allow MediAssist AI notifications.
              </p>

            </div>


            <button
              type="button"
              className={`settings-toggle ${
                notifications ? "enabled" : ""
              }`}
              onClick={handleNotifications}
              aria-label="Toggle notifications"
              aria-pressed={notifications}
            >

              <span className="toggle-circle"></span>

            </button>

          </div>


          {/* HEALTH REMINDERS */}

          <div className="settings-row">

            <div className="settings-row-info">

              <span className="settings-label">
                Health Reminders
              </span>

              <p>
                Receive reminders related to your
                health activity.
              </p>

            </div>


            <button
              type="button"
              className={`settings-toggle ${
                healthReminders ? "enabled" : ""
              }`}
              onClick={handleHealthReminders}
              aria-label="Toggle health reminders"
              aria-pressed={healthReminders}
            >

              <span className="toggle-circle"></span>

            </button>

          </div>

        </section>


        {/* ====================================================
            PRIVACY
        ==================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              🛡️
            </div>

            <div>

              <h2>
                Privacy
              </h2>

              <p>
                Information about your account privacy.
              </p>

            </div>

          </div>


          <div className="privacy-information">

            <div className="privacy-item">

              <span>
                🔒
              </span>

              <div>

                <strong>
                  Secure Authentication
                </strong>

                <p>
                  Your account uses token-based
                  authentication.
                </p>

              </div>

            </div>


            <div className="privacy-item">

              <span>
                🗄️
              </span>

              <div>

                <strong>
                  Personal Data
                </strong>

                <p>
                  Your account information is associated
                  with your MediAssist AIaccount.
                </p>

              </div>

            </div>


            <div className="privacy-item">

              <span>
                ⚕️
              </span>

              <div>

                <strong>
                  Health Information
                </strong>

                <p>
                  MediAssist AI provides general health
                  information and should not replace
                  professional medical advice.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            ACCOUNT ACTIONS
        ==================================================== */}

        <section className="settings-card settings-danger-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              ⚠️
            </div>

            <div>

              <h2>
                Account Actions
              </h2>

              <p>
                Manage your current session.
              </p>

            </div>

          </div>


          <div className="settings-danger-content">

            <div>

              <strong>
                Sign out of MediAssist AI
              </strong>

              <p>
                This will remove your current login
                session from this browser.
              </p>

            </div>


            <button
              className="settings-logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        </section>


        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <div className="settings-disclaimer">

          ⚠️ <strong>Important:</strong>{" "}

          MediAssist AI is a health information
          application. It does not provide medical
          diagnosis, treatment, or professional medical
          advice.

          For serious or emergency symptoms, contact a
          qualified healthcare professional or emergency
          service.

        </div>

      </main>

    </div>
  );
}

export default Settings;