import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const API_URL = "https://mediassist-backend-70gs.onrender.com";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // GET PROFILE PHOTO URL
  // ============================================================

  const getPhotoUrl = (photo) => {
    if (!photo) {
      return null;
    }

    // If backend already returns a complete URL
    if (
      photo.startsWith("http://") ||
      photo.startsWith("https://")
    ) {
      return photo;
    }

    // If backend returns /uploads/filename.jpg
    if (photo.startsWith("/")) {
      return `${API_URL}${photo}`;
    }

    return `${API_URL}/${photo}`;
  };

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("PROFILE DATA:", data);

        // --------------------------------------------------------
        // SESSION EXPIRED
        // --------------------------------------------------------

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");

          navigate("/login");
          return;
        }

        // --------------------------------------------------------
        // API ERROR
        // --------------------------------------------------------

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load profile."
          );
        }

        // --------------------------------------------------------
        // SET PROFILE
        // --------------------------------------------------------

        setProfile(data);
        setName(data.name || "");

        localStorage.setItem(
          "user",
          JSON.stringify(data)
        );

      } catch (err) {
        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err.message ||
            "Unable to load your profile."
        );

      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // ============================================================
  // SAVE PROFILE NAME
  // ============================================================

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name cannot be empty.");
      return;
    }

    if (trimmedName.length > 100) {
      setError(
        "Name must be 100 characters or less."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      // --------------------------------------------------------
      // UPDATE PROFILE
      // --------------------------------------------------------

      const response = await fetch(
        `${API_URL}/profile`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "PROFILE UPDATE RESPONSE:",
        data
      );

      // --------------------------------------------------------
      // SESSION EXPIRED
      // --------------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      // --------------------------------------------------------
      // API ERROR
      // --------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update profile."
        );
      }

      // --------------------------------------------------------
      // UPDATED USER
      // --------------------------------------------------------

      const updatedUser = data.user || {
        ...profile,
        name: trimmedName,
      };

      setProfile(updatedUser);
      setName(updatedUser.name || "");

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setMessage(
        "Profile updated successfully."
      );

    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.message ||
          "Unable to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // OPEN FILE SELECTOR
  // ============================================================

  const handlePhotoClick = () => {
    if (uploadingPhoto) {
      return;
    }

    fileInputRef.current?.click();
  };

  // ============================================================
  // PROFILE PHOTO SELECTED
  // ============================================================

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];

    // Reset input if nothing selected
    if (!file) {
      return;
    }

    // --------------------------------------------------------
    // VALID FILE TYPES
    // --------------------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    // --------------------------------------------------------
    // FILE SIZE
    // --------------------------------------------------------

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB."
      );

      event.target.value = "";
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
      setUploadingPhoto(true);
      setError("");
      setMessage("");

      // ------------------------------------------------------
      // CREATE FORM DATA
      // ------------------------------------------------------

      const formData = new FormData();

      formData.append("file", file);

      // ------------------------------------------------------
      // UPLOAD PHOTO
      // ------------------------------------------------------

      const response = await fetch(
        `${API_URL}/profile/photo`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      console.log(
        "PHOTO UPLOAD RESPONSE:",
        data
      );

      // ------------------------------------------------------
      // SESSION EXPIRED
      // ------------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      // ------------------------------------------------------
      // API ERROR
      // ------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to upload profile photo."
        );
      }

      // ------------------------------------------------------
      // GET PHOTO PATH
      // ------------------------------------------------------

      const photoPath =
        data.profile_photo ||
        data.user?.profile_photo ||
        null;

      if (!photoPath) {
        throw new Error(
          "Photo uploaded, but the server did not return the photo path."
        );
      }

      // ------------------------------------------------------
      // UPDATE PROFILE STATE
      // ------------------------------------------------------

      const updatedProfile = {
        ...profile,
        profile_photo: photoPath,
      };

      setProfile(updatedProfile);

      // ------------------------------------------------------
      // UPDATE LOCAL STORAGE
      // ------------------------------------------------------

      localStorage.setItem(
        "user",
        JSON.stringify(updatedProfile)
      );

      setMessage(
        "Profile photo updated successfully."
      );

    } catch (err) {
      console.error(
        "Photo upload error:",
        err
      );

      setError(
        err.message ||
          "Unable to upload profile photo."
      );

    } finally {
      setUploadingPhoto(false);

      // Allow selecting the same file again
      event.target.value = "";
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="profile-page">

        <div className="profile-loading">

          <div className="profile-spinner"></div>

          <h2>
            Loading your profile...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>
    );
  }

  // ============================================================
  // PROFILE FAILED TO LOAD
  // ============================================================

  if (!profile) {
    return (
      <div className="profile-page">

        <header className="profile-header">

          <div
            className="profile-logo"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            MediAssist <span>AI</span>
          </div>

          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

        </header>

        <main className="profile-container">

          <div className="profile-error-card">

            <div className="profile-error-icon">
              ⚠️
            </div>

            <h2>
              Unable to load profile
            </h2>

            <p>
              {error ||
                "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // USER INITIAL
  // ============================================================

  const userInitial =
    profile.name?.charAt(0).toUpperCase() ||
    "U";

  // ============================================================
  // PROFILE PHOTO
  // ============================================================

  const photoUrl = getPhotoUrl(
    profile.profile_photo
  );

  // ============================================================
  // PROFILE PAGE
  // ============================================================

  return (
    <div className="profile-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="profile-header">

        <div
          className="profile-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          MediAssist <span>AI</span>
        </div>

        <div className="profile-header-actions">

          <button
            type="button"
            className="profile-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="profile-container">

        {/* ====================================================
            PAGE TITLE
        ==================================================== */}

        <div className="profile-page-title">

          {/* PROFILE PHOTO / INITIAL */}

          <button
            type="button"
            className="profile-title-icon"
            onClick={handlePhotoClick}
            title="Change profile photo"
            aria-label="Change profile photo"
          >

            {photoUrl ? (

              <img
                src={photoUrl}
                alt="Your profile"
                className="profile-title-photo"
              />

            ) : (

              userInitial

            )}

          </button>

          <div>

            <span>
              ACCOUNT
            </span>

            <h1>
              Your Profile
            </h1>

            <p>
              Manage your personal information
              and profile photo.
            </p>

          </div>

        </div>


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {message && (
          <div className="profile-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="profile-error">
            ⚠️ {error}
          </div>
        )}


        {/* ====================================================
            PROFILE CARD
        ==================================================== */}

        <section className="profile-card">

          {/* PROFILE CARD HEADING */}

          <div className="profile-card-heading">

            <div>

              <span className="profile-kicker">
                PERSONAL INFORMATION
              </span>

              <h2>
                Profile details
              </h2>

              <p>
                Keep your MediAssist account
                information up to date.
              </p>

            </div>

          </div>


          {/* ==================================================
              PROFILE PHOTO
          ================================================== */}

          <div className="profile-photo-section">

            <button
              type="button"
              className="profile-photo-wrapper"
              onClick={handlePhotoClick}
              disabled={uploadingPhoto}
              title="Click to change profile photo"
            >

              {photoUrl ? (

                <img
                  src={photoUrl}
                  alt="Your profile"
                  className="profile-photo"
                />

              ) : (

                <div className="profile-photo-placeholder">
                  {userInitial}
                </div>

              )}

              <span className="profile-photo-edit">

                {uploadingPhoto
                  ? "..."
                  : "📷"}

              </span>

            </button>


            <div className="profile-photo-info">

              <h3>
                Profile Photo
              </h3>

              <p>
                Click your photo to upload
                a new one.
              </p>

              <span>
                JPG, PNG or WEBP • Max 5 MB
              </span>

            </div>

            {/* HIDDEN FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              hidden
            />

          </div>


          {/* ==================================================
              FORM
          ================================================== */}

          <div className="profile-form">

            {/* NAME */}

            <div className="profile-field">

              <label htmlFor="profile-name">
                Full Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                  setMessage("");
                }}
                placeholder="Enter your name"
                maxLength={100}
              />

            </div>


            {/* EMAIL */}

            <div className="profile-field">

              <label htmlFor="profile-email">
                Email Address
              </label>

              <input
                id="profile-email"
                type="email"
                value={profile.email || ""}
                disabled
              />

              <small>
                Your email address is linked
                to your account.
              </small>

            </div>

          </div>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="profile-actions">

            <button
              type="button"
              className="profile-cancel-button"
              onClick={() =>
                navigate("/dashboard")
              }
              disabled={saving || uploadingPhoto}
            >
              Cancel
            </button>

            <button
              type="button"
              className="profile-save-button"
              onClick={handleSaveProfile}
              disabled={saving || uploadingPhoto}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </section>


        {/* ====================================================
            SECURITY CARD
        ==================================================== */}

        <section className="profile-security-card">

          <div className="security-icon">
            🔒
          </div>

          <div>

            <h3>
              Your account is protected
            </h3>

            <p>
              Your profile information is
              available only after authentication.
              MediAssist AI keeps your account
              protected with secure login.
            </p>

          </div>

        </section>


        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <div className="profile-disclaimer">

          <strong>
            ⚠️ Privacy notice
          </strong>

          <p>
            Only upload a profile photo that
            you are comfortable storing with
            your MediAssist account.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Profile;