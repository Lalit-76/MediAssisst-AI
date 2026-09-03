import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

function Chat() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    // ----------------------------------------------------------
    // GET JWT TOKEN
    // ----------------------------------------------------------

    const token = localStorage.getItem("access_token");

    if (!token || token.split(".").length !== 3) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      alert("Your login session is invalid. Please login again.");

      navigate("/login");
      return;
    }

    const currentMessage = message.trim();

    // ----------------------------------------------------------
    // SHOW USER MESSAGE
    // ----------------------------------------------------------

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        type: "user",
        text: currentMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    // ----------------------------------------------------------
    // SEND MESSAGE TO BACKEND
    // ----------------------------------------------------------

    try {
      const response = await fetch(
        "https://mediassist-backend-70gs.onrender.com/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            message: currentMessage,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "CHAT RESPONSE:",
        response.status,
        data
      );

      // --------------------------------------------------------
      // SESSION EXPIRED
      // --------------------------------------------------------

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        alert("Your session has expired. Please login again.");

        navigate("/login");
        return;
      }

      // --------------------------------------------------------
      // API ERROR
      // --------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to get a response from the AI."
        );
      }

      // --------------------------------------------------------
      // AI RESPONSE
      // --------------------------------------------------------

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          type: "ai",
          text:
            data.response ||
            "The AI did not return a response.",
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          type: "ai",
          text:
            error.message ||
            "Sorry, I could not complete your request.",
        },
      ]);
    } finally {
      setLoading(false);
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
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    setMessages([]);
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="chat-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="chat-header">

        <div
          className="chat-logo"
          onClick={() => navigate("/dashboard")}
        >
          MediAssist <span>AI</span>
        </div>

        <div className="chat-header-actions">

          <button
            type="button"
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>

          <button
            type="button"
            className="clear-chat-button"
            onClick={clearChat}
          >
            Clear Chat
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
          MAIN CONTENT
      ====================================================== */}

      <main className="chat-container">

        {/* TITLE */}

        <div className="chat-title">

          <div className="chat-icon">
            🤖
          </div>

          <div>

            <h1>
              AI Health Assistant
            </h1>

            <p>
              Ask questions about general health information.
            </p>

          </div>

        </div>

        {/* ====================================================
            CHAT BOX
        ==================================================== */}

        <div className="chat-card">

          {/* EMPTY STATE */}

          {messages.length === 0 && (

            <div className="chat-empty">

              <div className="empty-icon">
                🩺
              </div>

              <h2>
                How can I help you?
              </h2>

              <p>
                Ask me a health-related question and
                I'll provide general health information.
              </p>

              <div className="suggestion-list">

                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "What are some common causes of a headache?"
                    )
                  }
                >
                  What are common causes of a headache?
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "What are some ways to improve sleep?"
                    )
                  }
                >
                  What are some ways to improve sleep?
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "What are some healthy lifestyle habits?"
                    )
                  }
                >
                  What are some healthy lifestyle habits?
                </button>

              </div>

            </div>

          )}

          {/* ==================================================
              MESSAGES
          ================================================== */}

          {messages.length > 0 && (

            <div className="messages-container">

              {messages.map((chatMessage, index) => (

                <div
                  key={index}
                  className={
                    chatMessage.type === "user"
                      ? "message user-message"
                      : "message ai-message"
                  }
                >

                  <div className="message-avatar">

                    {chatMessage.type === "user"
                      ? "👤"
                      : "🤖"}

                  </div>

                  <div className="message-content">

                    <div className="message-name">

                      {chatMessage.type === "user"
                        ? "You"
                        : "MediAssist AI"}

                    </div>

                    <div className="message-text">

                      {chatMessage.text}

                    </div>

                  </div>

                </div>

              ))}

              {/* LOADING */}

              {loading && (

                <div className="message ai-message">

                  <div className="message-avatar">
                    🤖
                  </div>

                  <div className="message-content">

                    <div className="message-name">
                      MediAssist AI
                    </div>

                    <div className="message-text">
                      Thinking...
                    </div>

                  </div>

                </div>

              )}

            </div>

          )}

        </div>

        {/* ====================================================
            INPUT
        ==================================================== */}

        <form
          className="chat-input-form"
          onSubmit={sendMessage}
        >

          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Ask a health-related question..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
          >
            {loading ? "..." : "Send"}
          </button>

        </form>

        {/* DISCLAIMER */}

        <div className="chat-disclaimer">

          ⚠️ <strong>Important:</strong> MediAssist AI provides
          general health information only and is not a substitute
          for professional medical advice, diagnosis, or treatment.
          For serious or emergency symptoms, contact a qualified
          healthcare professional or emergency service.

        </div>

      </main>

    </div>
  );
}

export default Chat;