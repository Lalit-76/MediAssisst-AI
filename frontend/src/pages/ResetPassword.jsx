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

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");

    const resetToken = localStorage.getItem(
      "password_reset_token"
    );

    if (!resetToken) {
      setMessage(
        "Reset session not found. Please request a new password reset."
      );
      return;
    }

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

  if (success) {
    return (
      <div className="auth-page">

        <div className="auth-card reset-success-card">

          <div className="auth-logo">
            MediAssist<span>AI</span>
          </div>

          <div className="reset-success-icon">
            ✓
          </div>

          <div className="reset-success-label">
            PASSWORD UPDATED
          </div>

          <h1>
            Password Reset Successful
          </h1>

          <p className="auth-subtitle">
            Your MediAssist AI password has been
            changed successfully.
          </p>

          <div className="form-message reset-success-message">
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

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          MediAssist<span>AI</span>
        </div>

        <div className="reset-page-icon">
          🔐
        </div>

        <h1>
          Reset Password
        </h1>

        <p className="auth-subtitle">
          Create a new password for your
          MediAssist AI account.
        </p>

        <form onSubmit={handleResetPassword}>

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

          {message && (
            <div
              className={`form-message ${
                message.includes("successfully")
                  ? "reset-success-message"
                  : "reset-error-message"
              }`}
            >
              {message}
            </div>
          )}

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

        <p className="switch-auth">
          Remember your password?{" "}

          <Link to="/login">
            Back to Login
          </Link>
        </p>

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