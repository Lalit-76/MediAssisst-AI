import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");


    // Check all fields

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {

      setMessage("Please fill in all fields.");

      return;
    }


    // Check password length

    if (formData.password.length < 6) {

      setMessage(
        "Password must be at least 6 characters."
      );

      return;
    }


    // Check passwords

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setMessage(
        "Passwords do not match."
      );

      return;
    }


    try {

      setLoading(true);


      // Send registration data to FastAPI

      const response = await fetch(
        "https://mediassist-backend-70gs.onrender.com/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        }
      );


      const data = await response.json();


      if (response.ok) {

        setMessage(
          "Account created successfully! 🎉"
        );

        // Clear form

        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: ""
        });

      } else {

        setMessage(
          data.detail || "Registration failed."
        );

      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Cannot connect to the server. Make sure FastAPI is running."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          MediAssist <span>AI</span>
        </div>


        <h1>
          Create Account
        </h1>


        <p className="auth-subtitle">
          Join MediAssist AI today
        </p>


        <form onSubmit={handleSubmit}>

          {/* Full Name */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

          </div>


          {/* Email */}

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
            />

          </div>


          {/* Confirm Password */}

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />

          </div>


          {/* Message */}

          {message && (

            <div className="form-message">
              {message}
            </div>

          )}


          {/* Submit button */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"
            }

          </button>

        </form>


        <p className="switch-auth">

          Already have an account?{" "}

          <Link to="/login">
            Login
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

export default Register;