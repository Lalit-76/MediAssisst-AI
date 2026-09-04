import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const API_URL = "https://mediassist-backend-70gs.onrender.com";

function Settings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState(true);
  const [healthReminders, setHealthReminders] = useState(true);

  const [message, setMessage] = useState("");

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

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

      const savedNotifications =
        localStorage.getItem("notifications");

      const savedHealthReminders =
        localStorage.getItem("healthReminders");

      if (savedNotifications !== null) {
        setNotifications(
          savedNotifications === "true"
        );
      }

      if (savedHealthReminders !== null) {
        setHealthReminders(
          savedHealthReminders === "true"
        );
      }
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

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

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // ============================================================
  // OPEN PASSWORD MODAL
  // ============================================================

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordModal(true);
  };

  // ============================================================
  // CLOSE PASSWORD MODAL
  // ============================================================

  const closePasswordModal = () => {
    if (passwordLoading) {
      return;
    }

    setShowPasswordModal(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");

    if (!currentPassword) {
      setPasswordMessage(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      setPasswordMessage(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordMessage(
        "Please confirm your new password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordMessage(
        "New password must be different from your current password."
      );
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch(
        `${API_URL}/change-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
          })
        }
      );

      const data = await response.json();

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
        setPasswordMessage(
          data.detail ||
            "Unable to change password."
        );

        return;
      }

      setPasswordMessage(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      window.setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");

        showMessage(
          "Password changed successfully."
        );
      }, 1200);

    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordMessage(
        "Cannot connect to the server. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
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
          onClick={() =>
            navigate("/dashboard")
          }
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              navigate("/dashboard");
            }
          }}
        >
          MediAssist <span>AI</span>
        </div>

        <div className="settings-header-actions">

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <button
            type="button"
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

        {message && (
          <div className="settings-message">
            ✓ {message}
          </div>
        )}

        {/* ====================================================
            ACCOUNT
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
              type="button"
              className="settings-action-button"
              onClick={openPasswordModal}
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
                  with your MediAssist AI account.
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
              type="button"
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

      {/* ======================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}

      {showPasswordModal && (
        <div
          className="password-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !passwordLoading
            ) {
              closePasswordModal();
            }
          }}
        >

          <div
            className="password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >

            <div className="password-modal-icon">
              🔐
            </div>

            <div className="password-modal-header">

              <span>
                SECURITY
              </span>

              <h2 id="change-password-title">
                Change Password
              </h2>

              <p>
                Update your MediAssist AI account password.
              </p>

            </div>

            <form
              className="password-form"
              onSubmit={handleChangePassword}
            >

              {/* CURRENT PASSWORD */}

              <div className="password-form-group">

                <label htmlFor="current-password">
                  Current Password
                </label>

                <div className="settings-password-wrapper">

                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(
                        event.target.value
                      );
                      setPasswordMessage("");
                    }}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    disabled={passwordLoading}
                  />

                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                    disabled={passwordLoading}
                    aria-label={
                      showCurrentPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showCurrentPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>

              {/* NEW PASSWORD */}

              <div className="password-form-group">

                <label htmlFor="new-password">
                  New Password
                </label>

                <div className="settings-password-wrapper">

                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(
                        event.target.value
                      );
                      setPasswordMessage("");
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={passwordLoading}
                  />

                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                    disabled={passwordLoading}
                    aria-label={
                      showNewPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showNewPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="password-form-group">

                <label htmlFor="confirm-password">
                  Confirm New Password
                </label>

                <div className="settings-password-wrapper">

                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(
                        event.target.value
                      );
                      setPasswordMessage("");
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={passwordLoading}
                  />

                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    disabled={passwordLoading}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? "🙈"
                      : "👁️"}
                  </button>

                </div>

                <small>
                  Password must contain at least 6 characters.
                </small>

              </div>

              {/* MESSAGE */}

              {passwordMessage && (
                <div
                  className={`password-modal-message ${
                    passwordMessage.includes(
                      "successfully"
                    )
                      ? "password-success"
                      : "password-error"
                  }`}
                >
                  {passwordMessage.includes(
                    "successfully"
                  )
                    ? "✓"
                    : "⚠️"}{" "}
                  {passwordMessage}
                </div>
              )}

              {/* ACTIONS */}

              <div className="password-modal-actions">

                <button
                  type="button"
                  className="password-modal-cancel"
                  onClick={closePasswordModal}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="password-modal-save"
                  disabled={passwordLoading}
                >
                  {passwordLoading
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Settings;