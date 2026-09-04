import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./HealthHistory.css";

function HealthHistory() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD HEALTH HISTORY
  // ============================================================

  const loadHistory = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://mediassist-backend-70gs.onrender.com/assessments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

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
          data.detail || "Unable to load health history."
        );
      }

      // --------------------------------------------------------
      // GET ASSESSMENTS
      // --------------------------------------------------------

      const history = Array.isArray(data)
        ? data
        : [];

      // --------------------------------------------------------
      // SORT NEWEST FIRST
      // --------------------------------------------------------

      const sortedHistory = [...history].sort(
        (a, b) => {
          const dateA = new Date(
            `${a.created_at}Z`
          ).getTime();

          const dateB = new Date(
            `${b.created_at}Z`
          ).getTime();

          return dateB - dateA;
        }
      );

      setAssessments(sortedHistory);
    } catch (error) {
      console.error(
        "Health history error:",
        error
      );

      setError(
        error.message ||
          "Unable to load your health history."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ============================================================
  // LOAD HISTORY ON PAGE OPEN
  // ============================================================

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Unknown date";
    }

    const date = new Date(
      `${dateString}Z`
    );

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ============================================================
  // GET SEVERITY CLASS
  // ============================================================

  const getSeverityClass = (severity) => {
    const value = Number(severity);

    if (value >= 8) {
      return "severity-high";
    }

    if (value >= 5) {
      return "severity-medium";
    }

    return "severity-low";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="history-page">

        <header className="history-header">

          <div
            className="history-logo"
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

        </header>

        <main className="history-container">

          <div className="history-message history-loading-message">

            <div className="history-status-icon">
              <span className="history-loading-spinner"></span>
            </div>

            <h2>
              Loading your health history...
            </h2>

            <p>
              Please wait while we retrieve your assessments.
            </p>

          </div>

        </main>

      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="history-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="history-header">

        <div
          className="history-logo"
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

        <div className="history-header-actions">

          <button
            type="button"
            className="history-back-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="history-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="history-container">

        {/* ====================================================
            PAGE TITLE
        ==================================================== */}

        <div className="history-title">

          <div className="history-icon">
            📋
          </div>

          <div>

            <span className="history-eyebrow">
              YOUR RECORDS
            </span>

            <h1>
              Health History
            </h1>

            <p>
              View your previous symptom assessments and
              AI-generated general health information.
            </p>

          </div>

        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="history-message error-message">

            <div className="history-status-icon">
              ⚠️
            </div>

            <h2>
              Unable to load history
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="history-retry-button"
              onClick={loadHistory}
            >
              Try Again
            </button>

          </div>
        )}

        {/* ====================================================
            EMPTY HISTORY
        ==================================================== */}

        {!error &&
          assessments.length === 0 && (
            <div className="history-message">

              <div className="history-status-icon">
                📋
              </div>

              <h2>
                No Health Assessments Yet
              </h2>

              <p>
                Your completed symptom assessments will
                appear here.
              </p>

              <button
                type="button"
                className="history-assessment-button"
                onClick={() =>
                  navigate("/assessment")
                }
              >
                🩺 Start Assessment
              </button>

            </div>
          )}

        {/* ====================================================
            ASSESSMENT LIST
        ==================================================== */}

        {!error &&
          assessments.length > 0 && (
            <div className="history-list">

              {/* SUMMARY */}

              <div className="history-summary">

                <div className="history-summary-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    {assessments.length}
                  </strong>

                  <span>
                    {assessments.length === 1
                      ? " completed assessment"
                      : " completed assessments"}
                  </span>
                </div>

              </div>

              {/* CARDS */}

              {assessments.map(
                (assessment, index) => (
                  <article
                    className="history-card"
                    key={assessment.id}
                    style={{
                      "--history-index": index,
                    }}
                  >

                    {/* CARD HEADER */}

                    <div className="history-card-header">

                      <div className="history-card-heading">

                        <div className="history-card-icon">
                          🩺
                        </div>

                        <div>

                          <h2>
                            Symptom Assessment
                          </h2>

                          <p>
                            {formatDate(
                              assessment.created_at
                            )}
                          </p>

                        </div>

                      </div>

                      <div
                        className={`severity-badge ${getSeverityClass(
                          assessment.severity
                        )}`}
                      >
                        Severity:{" "}
                        {assessment.severity ?? "N/A"}/10
                      </div>

                    </div>

                    {/* SYMPTOMS */}

                    <div className="history-section">

                      <h3>
                        Symptoms
                      </h3>

                      <p>
                        {assessment.symptoms ||
                          "No symptoms provided."}
                      </p>

                    </div>

                    {/* DURATION */}

                    {assessment.duration && (
                      <div className="history-section">

                        <h3>
                          Duration
                        </h3>

                        <p>
                          {assessment.duration}
                        </p>

                      </div>
                    )}

                    {/* ADDITIONAL INFORMATION */}

                    {assessment.additional_info && (
                      <div className="history-section">

                        <h3>
                          Additional Information
                        </h3>

                        <p>
                          {assessment.additional_info}
                        </p>

                      </div>
                    )}

                    {/* AI RESPONSE */}

                    <div className="ai-analysis">

                      <div className="ai-analysis-heading">

                        <div className="ai-analysis-icon">
                          🤖
                        </div>

                        <div>
                          <h3>
                            MediAssist AI Analysis
                          </h3>

                          <span>
                            General health information
                          </span>
                        </div>

                      </div>

                      <div className="ai-response">
                        <ReactMarkdown>
                          {assessment.ai_response ||
                            "No AI response available."}
                        </ReactMarkdown>
                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <div className="history-disclaimer">

          <span>
            ⚠️
          </span>

          <div>
            <strong>
              Important:
            </strong>{" "}
            Your health history contains information provided
            during your assessments. MediAssist AI provides
            general health information and does not provide
            a medical diagnosis. For serious or emergency
            symptoms, consult a qualified healthcare
            professional or emergency service.
          </div>

        </div>

      </main>

    </div>
  );
}

export default HealthHistory;