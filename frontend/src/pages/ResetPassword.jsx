import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");

    // Get development reset token
    const resetToken = localStorage.getItem(
      "password_reset_token"
    );

    // ==========================================================
    // CHECK TOKEN
    // ==========================================================

    if (!resetToken) {
      setMessage(
        "Reset session not found. Please request a new password reset."
      );
      return;
    }

    // ==========================================================
    // CHECK PASSWORD
    // ==========================================================

    if (!newPassword || !confirmPassword) {
      setMessage(
        "Please enter and confirm your new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    // ==========================================================
    // SEND RESET REQUEST
    // ==========================================================

    try {
      setLoading(true);

      const response = await fetch(
        "https://mediassist-backend-70gs.onrender.com/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            token: resetToken,
            new_password: newPassword
          })
        }
      );

      const data = await response.json();

      // ========================================================
      // SUCCESS
      // ========================================================

      if (response.ok) {
        localStorage.removeItem(
          "password_reset_token"
        );

        setSuccess(true);

        setMessage(
          "Password reset successfully!"
        );

        setNewPassword("");
        setConfirmPassword("");

      } else {

        setMessage(
          data.detail ||
          "Unable to reset password."
        );
      }

    } catch (error) {

      console.error(
        "Reset password error:",
        error
      );

      setMessage(
        "Cannot connect to the server. Make sure FastAPI is running."
      );

    } finally {

      setLoading(false);
    }
  };


  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (success) {
    return (
      <div className="auth-page">

        <div className="auth-card">

          <div className="auth-logo">
            MediAssist<span>AI</span>
          </div>

          <h1>
            Password Reset Successful ✅
          </h1>

          <p className="auth-subtitle">
            Your MediAssist AI password has been changed successfully.
          </p>

          <div
            className="form-message"
            style={{
              color: "#0f766e",
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
              textAlign: "center"
            }}
          >
            {message}
          </div>

          <button
            type="button"
            className="auth-button"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>

          <Link
            to="/"
            className="back-home"
          >
            ← Back to Home
          </Link>

        </div>

      </div>
    );
  }


  // ============================================================
  // RESET PASSWORD FORM
  // ============================================================

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          MediAssist<span>AI</span>
        </div>

        <h1>
          Reset Password 🔐
        </h1>

        <p className="auth-subtitle">
          Create a new password for your MediAssist AI account.
        </p>

        <form onSubmit={handleResetPassword}>

          {/* ==================================================
              NEW PASSWORD
          ================================================== */}

          <div className="form-group">

            <label htmlFor="new-password">
              New Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>


          {/* ==================================================
              CONFIRM PASSWORD
          ================================================== */}

          <div className="form-group">

            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {showConfirmPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>


          {/* ==================================================
              MESSAGE
          ================================================== */}

          {message && (
            <div
              className="form-message"
              style={{
                color: message.includes("successfully")
                  ? "#0f766e"
                  : "#b91c1c",

                backgroundColor: message.includes("successfully")
                  ? "#ecfdf5"
                  : "#fef2f2",

                border: message.includes("successfully")
                  ? "1px solid #a7f3d0"
                  : "1px solid #fecaca",

                padding: "12px",

                borderRadius: "8px",

                marginBottom: "16px",

                textAlign: "center"
              }}
            >
              {message}
            </div>
          )}


          {/* ==================================================
              RESET BUTTON
          ================================================== */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Resetting Password..."
              : "Reset Password"}
          </button>

        </form>


        {/* ==================================================
            BACK TO LOGIN
        ================================================== */}

        <p className="switch-auth">

          Remember your password?{" "}

          <Link to="/login">
            Back to Login
          </Link>

        </p>


        {/* ==================================================
            BACK HOME
        ================================================== */}

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

export default ResetPassword;