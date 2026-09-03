import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./SymptomAssessment.css";

function SymptomAssessment() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(5);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [conversation, setConversation] = useState([]);

  const [assessmentActive, setAssessmentActive] = useState(true);

  const [spellingWarnings, setSpellingWarnings] = useState([]);


  // ============================================================
  // COMMON SPELLING CORRECTIONS
  // ============================================================

  const commonCorrections = {
    hedache: "headache",
    headake: "headache",
    hedake: "headache",
    headach: "headache",

    fevr: "fever",
    feaver: "fever",
    fevre: "fever",

    coughh: "cough",
    coug: "cough",

    tirdness: "tiredness",
    tirednes: "tiredness",
    tirednss: "tiredness",

    vomitng: "vomiting",
    vomitting: "vomiting",
    vomting: "vomiting",

    nausia: "nausea",
    nusea: "nausea",

    diarrhoea: "diarrhea",
    diarhea: "diarrhea",
    diarhoea: "diarrhea",

    stomch: "stomach",
    stomak: "stomach",

    throath: "throat",
    throt: "throat",

    diziness: "dizziness",
    dizzines: "dizziness",
    dizines: "dizziness",

    weekness: "weakness",
    weaknes: "weakness",

    breathles: "breathless",
    brething: "breathing",
    breathng: "breathing",

    migrane: "migraine",

    alergic: "allergic",
    alergy: "allergy",

    temprature: "temperature",
    temprture: "temperature",

    pane: "pain",
    muscel: "muscle",
    cheast: "chest",
    abdomnal: "abdominal",

    constiption: "constipation",

    fatige: "fatigue",
    fatique: "fatigue",

    anxity: "anxiety",
    infecion: "infection",

    soar: "sore",
  };


  // ============================================================
  // CHECK SPELLING
  // ============================================================

  const checkSpelling = (text) => {
    if (!text.trim()) {
      setSpellingWarnings([]);
      return;
    }

    const words = text
      .toLowerCase()
      .replace(/[.,!?;:()[\]{}]/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    const warnings = [];
    const alreadyFound = new Set();

    words.forEach((word) => {
      const correction = commonCorrections[word];

      if (
        correction &&
        correction !== word &&
        !alreadyFound.has(word)
      ) {
        warnings.push({
          incorrect: word,
          correct: correction,
        });

        alreadyFound.add(word);
      }
    });

    setSpellingWarnings(warnings);
  };


  // ============================================================
  // HANDLE SYMPTOM CHANGE
  // ============================================================

  const handleSymptomsChange = (event) => {
// sourcery skip: use-object-destructuring
    const value = event.target.value;

    setSymptoms(value);
    checkSpelling(value);

    if (error) {
      setError("");
    }
  };


  // ============================================================
  // LOAD USER
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

    } catch (err) {
      console.error("Invalid user data:", err);

      localStorage.removeItem("user");
      localStorage.removeItem("access_token");

      navigate("/login");
    }
  }, [navigate]);


  // ============================================================
  // GET TOKEN
  // ============================================================

  const getValidToken = () => {
    const token = localStorage.getItem("access_token");

    if (!token || token.split(".").length !== 3) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      alert(
        "Your login session is invalid. Please login again."
      );

      navigate("/login");

      return null;
    }

    return token;
  };


  // ============================================================
  // SUBMIT INITIAL ASSESSMENT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);
    setConversation([]);
    setAssessmentActive(true);

    if (!symptoms.trim()) {
      setError(
        "Please enter your symptoms before starting the assessment."
      );
      return;
    }

    const token = getValidToken();

    if (!token) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/assessment",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            symptoms: symptoms.trim(),

            duration:
              duration.trim() !== ""
                ? duration.trim()
                : null,

            severity:
              severity !== ""
                ? Number(severity)
                : null,

            additional_info:
              additionalInfo.trim() !== ""
                ? additionalInfo.trim()
                : null,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "ASSESSMENT RESPONSE:",
        response.status,
        data
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        alert(
          "Your session has expired. Please login again."
        );

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to complete the health assessment."
        );
      }

      setResult(data);

    } catch (err) {
      console.error("Assessment error:", err);

      setError(
        err.message ||
          "Something went wrong while completing the assessment."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // SEND FOLLOW-UP QUESTION
  // ============================================================

  const handleFollowUp = async (event) => {
    event.preventDefault();

    if (
      !followUpQuestion.trim() ||
      followUpLoading ||
      !assessmentActive
    ) {
      return;
    }

    const token = getValidToken();

    if (!token) {
      return;
    }

    const question = followUpQuestion.trim();

    setFollowUpQuestion("");
    setFollowUpLoading(true);
    setError("");

    // ----------------------------------------------------------
    // ADD USER QUESTION TO SCREEN IMMEDIATELY
    // ----------------------------------------------------------

    setConversation((previous) => [
      ...previous,
      {
        type: "user",
        text: question,
      },
    ]);

    // ----------------------------------------------------------
    // BUILD CONTEXT FOR AI
    // ----------------------------------------------------------

    const initialAIResponse =
      result?.response ||
      result?.ai_response ||
      "No initial AI response was available.";

    const conversationContext = conversation
      .map((item) => {
        return `${item.type === "user" ? "User" : "MediAssist AI"}: ${item.text}`;
      })
      .join("\n");

    const contextualMessage = `
You are continuing a health assessment conversation for MediAssist AI.

The user originally reported these symptoms:
${symptoms}

Duration:
${duration || "Not specified"}

Severity:
${severity}/10

Additional information:
${additionalInfo || "None provided"}

Initial MediAssist AI assessment:
${initialAIResponse}

Previous follow-up conversation:
${conversationContext || "No previous follow-up questions."}

The user's new follow-up question is:
${question}

Answer the user's question while keeping the original symptoms and assessment context in mind.

Provide general health information and practical guidance.
Do not claim to diagnose the user.
Do not prescribe medication.
Mention appropriate warning signs or professional medical care when relevant.
Keep the answer clear and understandable.
`;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: contextualMessage,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "FOLLOW-UP RESPONSE:",
        response.status,
        data
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        alert(
          "Your session has expired. Please login again."
        );

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to get a response from MediAssist AI."
        );
      }

      // --------------------------------------------------------
      // ADD AI RESPONSE
      // --------------------------------------------------------

      setConversation((previous) => [
        ...previous,
        {
          type: "ai",
          text:
            data.response ||
            "MediAssist AI did not return a response.",
        },
      ]);

    } catch (err) {
      console.error(
        "Follow-up question error:",
        err
      );

      setConversation((previous) => [
        ...previous,
        {
          type: "ai",
          text:
            err.message ||
            "Sorry, I could not answer that question right now.",
        },
      ]);

    } finally {
      setFollowUpLoading(false);
    }
  };


  // ============================================================
  // END CURRENT ASSESSMENT
  // ============================================================

  const handleEndAssessment = () => {
    setAssessmentActive(false);
    setFollowUpQuestion("");
  };


  // ============================================================
  // NEW ASSESSMENT
  // ============================================================

  const handleNewAssessment = () => {
    setSymptoms("");
    setDuration("");
    setSeverity(5);
    setAdditionalInfo("");

    setSpellingWarnings([]);
    setResult(null);
    setConversation([]);

    setFollowUpQuestion("");
    setAssessmentActive(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (!user) {
    return (
      <div className="assessment-loading">

        <div className="assessment-loading-spinner"></div>

        <span>
          Loading assessment...
        </span>

      </div>
    );
  }


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="assessment-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="assessment-header">

        <div
          className="assessment-logo"
          onClick={() => navigate("/dashboard")}
        >
          MediAssist <span>AI</span>
        </div>

        <div className="assessment-header-actions">

          <button
            type="button"
            className="assessment-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="assessment-user">

            <div className="assessment-user-avatar">

              {user.name
                ? user.name.charAt(0).toUpperCase()
                : "U"}

            </div>

            <div className="assessment-user-info">

              <strong>
                {user.name || "User"}
              </strong>

              <span>
                {user.email || ""}
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="assessment-container">

        {/* TITLE */}

        <div className="assessment-title">

          <div className="assessment-main-icon">
            🩺
          </div>

          <div>

            <h1>
              Symptom Assessment
            </h1>

            <p>
              Share your symptoms to receive general health
              information from MediAssist AI.
            </p>

          </div>

        </div>


        {/* NOTICE */}

        <div className="assessment-notice">

          <span className="assessment-notice-icon">
            ⚠️
          </span>

          <div>

            <strong>
              Important
            </strong>

            <p>
              This assessment provides general health
              information only. It does not provide a
              medical diagnosis or replace professional
              medical advice.
            </p>

          </div>

        </div>


        {/* ====================================================
            INITIAL RESULT
        ==================================================== */}

        {result && (

          <section className="assessment-result-card">

            {/* RESULT HEADER */}

            <div className="assessment-result-header">

              <div className="assessment-result-icon">
                🤖
              </div>

              <div>

                <h2>
                  Your AI Health Information
                </h2>

                <p>
                  Based on the information you provided.
                </p>

              </div>

            </div>


            {/* RESULT CONTENT */}

            <div className="assessment-result-content">

              <div className="result-section">

                <h3>
                  Symptoms
                </h3>

                <p>
                  {result.symptoms || symptoms}
                </p>

              </div>


              <div className="result-section">

                <h3>
                  Initial AI Assessment
                </h3>

                <div className="ai-response">

                  <ReactMarkdown>
                    {result.response ||
                      result.ai_response ||
                      "No response was returned."}
                  </ReactMarkdown>

                </div>

              </div>

            </div>

          </section>
        )}


        {/* ====================================================
            FOLLOW-UP CONVERSATION
        ==================================================== */}

        {result && (

          <section className="assessment-result-card">

            <div className="assessment-result-header">

              <div className="assessment-result-icon">
                💬
              </div>

              <div>

                <h2>
                  Follow-up Conversation
                </h2>

                <p>
                  Ask as many related questions as you need.
                  The AI will keep your current assessment in context.
                </p>

              </div>

            </div>


            {/* CONVERSATION */}

            {conversation.length > 0 && (

              <div className="assessment-result-content">

                {conversation.map((item, index) => (

                  <div
                    key={index}
                    className="result-section"
                  >

                    <h3>

                      {item.type === "user"
                        ? "You"
                        : "MediAssist AI"}

                    </h3>

                    <div className="ai-response">

                      {item.type === "ai" ? (

                        <ReactMarkdown>
                          {item.text}
                        </ReactMarkdown>

                      ) : (

                        <p>
                          {item.text}
                        </p>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}


            {/* FOLLOW-UP INPUT */}

            {assessmentActive ? (

              <form
                onSubmit={handleFollowUp}
                style={{
                  padding: "20px",
                  borderTop: "1px solid #e5e7eb"
                }}
              >

                <div className="assessment-field">

                  <label htmlFor="follow-up-question">

                    Ask a follow-up question

                  </label>

                  <textarea
                    id="follow-up-question"
                    value={followUpQuestion}
                    onChange={(event) =>
                      setFollowUpQuestion(event.target.value)
                    }
                    placeholder="For example: What should I do if the headache gets worse?"
                    rows="4"
                    maxLength="2000"
                    disabled={followUpLoading}
                  />

                  <div className="field-help">

                    <span>
                      Ask questions related to this assessment.
                    </span>

                    <span>
                      {followUpQuestion.length}/2000
                    </span>

                  </div>

                </div>


                <div className="assessment-form-actions">

                  <button
                    type="button"
                    className="assessment-cancel-button"
                    onClick={handleEndAssessment}
                    disabled={followUpLoading}
                  >
                    End Assessment
                  </button>

                  <button
                    type="submit"
                    className="assessment-submit-button"
                    disabled={
                      followUpLoading ||
                      !followUpQuestion.trim()
                    }
                  >

                    {followUpLoading
                      ? "Thinking..."
                      : "Ask MediAssist AI →"}

                  </button>

                </div>

              </form>

            ) : (

              <div
                className="assessment-notice"
                style={{ margin: "20px" }}
              >

                <span className="assessment-notice-icon">
                  ✅
                </span>

                <div>

                  <strong>
                    Assessment Ended
                  </strong>

                  <p>
                    This assessment conversation has ended.
                    You can start a new assessment whenever you're ready.
                  </p>

                </div>

              </div>

            )}


            {/* ACTIONS */}

            <div className="assessment-result-actions">

              <button
                type="button"
                className="new-assessment-button"
                onClick={handleNewAssessment}
              >
                + New Assessment
              </button>

              <button
                type="button"
                className="history-button"
                onClick={() => navigate("/health-history")}
              >
                View Health History →
              </button>

            </div>

          </section>

        )}


        {/* ====================================================
            INITIAL ASSESSMENT FORM
        ==================================================== */}

        {!result && (

          <form
            className="assessment-form"
            onSubmit={handleSubmit}
          >

            {/* SYMPTOMS */}

            <div className="assessment-field">

              <label htmlFor="symptoms">

                What symptoms are you experiencing?

                <span>
                  *
                </span>

              </label>

              <textarea
                id="symptoms"
                value={symptoms}
                onChange={handleSymptomsChange}
                placeholder="For example: headache, mild fever, tiredness..."
                rows="6"
                maxLength="2000"
              />

              <div className="field-help">

                <span>
                  Describe your symptoms as clearly as possible.
                </span>

                <span>
                  {symptoms.length}/2000
                </span>

              </div>


              {/* SPELLING WARNING */}

              {spellingWarnings.length > 0 && (

                <div className="spelling-warning">

                  <div className="spelling-warning-icon">
                    ⚠
                  </div>

                  <div className="spelling-warning-content">

                    <strong>
                      Possible spelling mistake
                    </strong>

                    <p>
                      We noticed a possible spelling mistake.
                      You can continue with your assessment.
                    </p>

                    <div className="spelling-suggestions">

                      {spellingWarnings.map(
                        (warning, index) => (

                          <div
                            className="spelling-suggestion"
                            key={`${warning.incorrect}-${index}`}
                          >

                            <span className="incorrect-word">
                              {warning.incorrect}
                            </span>

                            <span className="suggestion-arrow">
                              →
                            </span>

                            <span className="correct-word">
                              {warning.correct}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                </div>

              )}

            </div>


            {/* DURATION */}

            <div className="assessment-field">

              <label htmlFor="duration">
                How long have you had these symptoms?
              </label>

              <select
                id="duration"
                value={duration}
                onChange={(event) =>
                  setDuration(event.target.value)
                }
              >

                <option value="">
                  Select duration
                </option>

                <option value="Less than a day">
                  Less than a day
                </option>

                <option value="1–3 days">
                  1–3 days
                </option>

                <option value="4–7 days">
                  4–7 days
                </option>

                <option value="1–2 weeks">
                  1–2 weeks
                </option>

                <option value="More than 2 weeks">
                  More than 2 weeks
                </option>

                <option value="More than a month">
                  More than a month
                </option>

              </select>

            </div>


            {/* SEVERITY */}

            <div className="assessment-field">

              <div className="severity-header">

                <label htmlFor="severity">
                  How severe are your symptoms?
                </label>

                <strong>
                  {severity}/10
                </strong>

              </div>

              <input
                id="severity"
                type="range"
                min="1"
                max="10"
                step="1"
                value={severity}
                onChange={(event) =>
                  setSeverity(event.target.value)
                }
              />

              <div className="severity-scale">

                <span>
                  1 — Mild
                </span>

                <span>
                  5 — Moderate
                </span>

                <span>
                  10 — Severe
                </span>

              </div>

            </div>


            {/* ADDITIONAL INFORMATION */}

            <div className="assessment-field">

              <label htmlFor="additionalInfo">
                Additional information
              </label>

              <textarea
                id="additionalInfo"
                value={additionalInfo}
                onChange={(event) =>
                  setAdditionalInfo(event.target.value)
                }
                placeholder="Anything else you think may be relevant..."
                rows="5"
                maxLength="2000"
              />

              <div className="field-help">

                <span>
                  Optional
                </span>

                <span>
                  {additionalInfo.length}/2000
                </span>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="assessment-error">

                <span>
                  ❌
                </span>

                <p>
                  {error}
                </p>

              </div>

            )}


            {/* BUTTONS */}

            <div className="assessment-form-actions">

              <button
                type="button"
                className="assessment-cancel-button"
                onClick={() => navigate("/dashboard")}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="assessment-submit-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="assessment-spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🩺 Start Assessment
                  </>
                )}

              </button>

            </div>

          </form>

        )}


        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        {!result && (

          <section className="how-assessment-works">

            <h2>
              How it works
            </h2>

            <div className="assessment-steps">

              <div className="assessment-step">

                <div className="step-number">
                  1
                </div>

                <div>

                  <h3>
                    Describe
                  </h3>

                  <p>
                    Tell us about the symptoms you are
                    experiencing.
                  </p>

                </div>

              </div>


              <div className="assessment-step">

                <div className="step-number">
                  2
                </div>

                <div>

                  <h3>
                    Analyze
                  </h3>

                  <p>
                    MediAssist AI analyzes the information
                    you provide.
                  </p>

                </div>

              </div>


              <div className="assessment-step">

                <div className="step-number">
                  3
                </div>

                <div>

                  <h3>
                    Continue the conversation
                  </h3>

                  <p>
                    Ask follow-up questions until you
                    choose to end the assessment.
                  </p>

                </div>

              </div>

            </div>

          </section>

        )}


        {/* DISCLAIMER */}

        <div className="assessment-disclaimer">

          ⚕️ <strong>Medical Disclaimer:</strong>{" "}

          MediAssist AI provides general health information
          and educational guidance. It is not a doctor and
          cannot diagnose conditions or prescribe treatment.
          If you have severe or emergency symptoms, seek
          immediate professional medical attention.

        </div>

      </main>

    </div>
  );
}

export default SymptomAssessment;