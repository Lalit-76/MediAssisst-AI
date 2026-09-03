import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);

  // Remember-account popup
  const [showRememberPopup, setShowRememberPopup] = useState(false);

  // Forgot password popup
const [showForgotPopup, setShowForgotPopup] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [forgotMessage, setForgotMessage] = useState("");
const [forgotLoading, setForgotLoading] = useState(false);

  // ------------------------------------------------------------
  // LOAD REMEMBERED EMAIL
  // ------------------------------------------------------------

  useEffect(() => {
    const rememberedEmail =
      localStorage.getItem("remembered_email");

    if (rememberedEmail) {
      setFormData((previous) => ({
        ...previous,
        email: rememberedEmail
      }));
    }
  }, []);

  // ------------------------------------------------------------
  // HANDLE INPUT CHANGE
  // ------------------------------------------------------------

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ------------------------------------------------------------
  // REMEMBER ACCOUNT - YES
  // ------------------------------------------------------------

  const handleRememberYes = () => {
    /*
      We only remember the email address.

      IMPORTANT:
      Never store the user's password in localStorage.
    */

    localStorage.setItem(
      "remembered_email",
      formData.email
    );

    setShowRememberPopup(false);

    navigate("/dashboard");
  };

  // ------------------------------------------------------------
  // REMEMBER ACCOUNT - NO
  // ------------------------------------------------------------

  const handleRememberNo = () => {
    localStorage.removeItem("remembered_email");

    setShowRememberPopup(false);

    navigate("/dashboard");
  };

  // ------------------------------------------------------------
// FORGOT PASSWORD
// ------------------------------------------------------------

const handleForgotPassword = async (e) => {
  e.preventDefault();

  setForgotMessage("");

  if (!forgotEmail) {
    setForgotMessage("Please enter your email address.");
    return;
  }

  try {
    setForgotLoading(true);

    const response = await fetch(
      "https://mediassist-backend-70gs.onrender.com/forgot-password",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          email: forgotEmail
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
  if (data.reset_token) {
    localStorage.setItem(
      "password_reset_token",
      data.reset_token
    );

    setShowForgotPopup(false);

    navigate("/reset-password");
  } else {
    setForgotMessage(
      "A reset request was processed, but no reset token was received."
    );
  }
} else {
      setForgotMessage(
        data.detail ||
        "Unable to process your request."
      );
    }

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );

    setForgotMessage(
      "Cannot connect to the server. Make sure FastAPI is running."
    );

  } finally {

    setForgotLoading(false);

  }
};

  // ------------------------------------------------------------
  // LOGIN
  // ------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // Check fields
    if (!formData.email || !formData.password) {
      setMessage(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // SEND LOGIN REQUEST TO FASTAPI
      // --------------------------------------------------------

      const response = await fetch(
        "https://mediassist-backend-70gs.onrender.com/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        }
      );

      const data = await response.json();

      // --------------------------------------------------------
      // SUCCESS
      // --------------------------------------------------------

      if (response.ok && data.access_token) {

        // Save JWT token
        localStorage.setItem(
          "access_token",
          data.access_token
        );

        // Save user information
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user_id,
            name: data.name,
            email: data.email
          })
        );

        /*
          Show the Remember Account popup.

          We DON'T navigate immediately.
          The user first chooses Yes or No.
        */

        setShowRememberPopup(true);

      } else {

        // ------------------------------------------------------
        // LOGIN FAILED
        // ------------------------------------------------------

        setMessage(
          data.message ||
          data.detail ||
          "Invalid email or password."
        );
      }

    } catch (error) {

      console.error("Login error:", error);

      setMessage(
        "Cannot connect to the server. Make sure FastAPI is running."
      );

    } finally {

      setLoading(false);

    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <div className="auth-logo">
          MediAssist<span>AI</span>
        </div>


        {/* =====================================================
            TITLE
        ===================================================== */}

        <h1>
          Welcome Back 👋
        </h1>

        <p className="auth-subtitle">
          Login to continue to your MediAssist AI account
        </p>


        {/* =====================================================
            LOGIN FORM
        ===================================================== */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
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
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

          </div>


          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          <div className="form-options">

  <span></span>

  <button
    type="button"
    className="forgot-password-link"
    onClick={() => {
      setForgotEmail(formData.email);
      setForgotMessage("");
      setShowForgotPopup(true);
    }}
  >
    Forgot password?
  </button>

</div>


          {/* =================================================
              ERROR / NORMAL MESSAGE
          ================================================= */}

          {message && (
            <div className="form-message">
              {message}
            </div>
          )}


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* =====================================================
            REGISTER
        ===================================================== */}

        <p className="switch-auth">

          Don't have an account?{" "}

          <Link to="/register">
            Create Account
          </Link>

        </p>


        {/* =====================================================
            BACK HOME
        ===================================================== */}

        <Link
          to="/"
          className="back-home"
        >
          ← Back to Home
        </Link>

      </div>


      {/* =======================================================
          REMEMBER ACCOUNT POPUP
      ======================================================= */}

      {showRememberPopup && (

        <div className="remember-overlay">

          <div
            className="remember-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remember-title"
          >

            {/* CHECK ICON */}

            <div className="remember-icon">

              <div className="remember-check">
                ✓
              </div>

            </div>


            {/* CONTENT */}

            <div className="remember-content">

              <div className="remember-success-label">
                LOGIN SUCCESSFUL
              </div>

              <h2 id="remember-title">
                Login Successful! 🎉
              </h2>

              <p className="remember-question">
                Would you like MediAssist AI to remember
                this account on this device?
              </p>


              {/* SECURITY MESSAGE */}

              <div className="remember-security">

                <span className="security-shield">
                  ✓
                </span>

                <span>
                  Your password will not be saved.
                </span>

              </div>

            </div>


            {/* =================================================
                YES / NO
            ================================================= */}

            <div className="remember-actions">

              <button
                type="button"
                className="remember-yes"
                onClick={handleRememberYes}
              >

                <span>
                  ✓
                </span>

                Yes

              </button>


              <button
                type="button"
                className="remember-no"
                onClick={handleRememberNo}
              >

                <span>
                  ×
                </span>

                No

              </button>

            </div>

          </div>

        </div>

      )}

            {/* =======================================================
          FORGOT PASSWORD POPUP
      ======================================================= */}

      {showForgotPopup && (

        <div className="remember-overlay">

          <div
            className="remember-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
          >

            <div className="remember-icon">
              <div className="remember-check">
                🔐
              </div>
            </div>

            <div className="remember-content">

              <div className="remember-success-label">
                PASSWORD RESET
              </div>

              <h2 id="forgot-title">
                Forgot Password?
              </h2>

              <p className="remember-question">
                Enter your registered email address and
                we'll generate a password reset token.
              </p>

              <form onSubmit={handleForgotPassword}>

                <div className="form-group">

                  <label htmlFor="forgot-email">
                    Email Address
                  </label>

                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) =>
                      setForgotEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />

                </div>

                {forgotMessage && (
                  <div className="form-message">
                    {forgotMessage}
                  </div>
                )}

                <div className="remember-actions">

                  <button
                    type="button"
                    className="remember-no"
                    onClick={() => {
                      setShowForgotPopup(false);
                      setForgotMessage("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="remember-yes"
                    disabled={forgotLoading}
                  >
                    {forgotLoading
                      ? "Sending..."
                      : "Continue"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Login;