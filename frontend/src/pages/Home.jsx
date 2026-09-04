import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className="home-navbar">
        <Link to="/" className="home-logo">
          <span className="logo-icon">✚</span>
          <span>MediAssist <span className="logo-ai">AI</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-register">
            Get Started
            <span>→</span>
          </Link>
        </div>
      </nav>

      {/* =====================================================
          HERO
      ===================================================== */}
      <main className="hero-section">

        {/* Animated background */}
        <div className="hero-glow hero-glow-one"></div>
        <div className="hero-glow hero-glow-two"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-pulse"></span>
            <span>AI-POWERED HEALTHCARE</span>
            <span className="badge-sparkle">✦</span>
          </div>

          <h1>
            Your Health.
            <br />
            <span>Smarter with AI.</span>
          </h1>

          <p className="hero-description">
            Get personalized health information, understand your symptoms,
            track your health assessments, and chat with your AI health
            assistant — all in one place.
          </p>

          <div className="hero-buttons">

            <Link to="/register" className="primary-button">
              <span>Get Started</span>
              <span className="button-arrow">→</span>
            </Link>

            <Link to="/login" className="secondary-button">
              Login
            </Link>

          </div>

          <div className="hero-note">
            <span>🔒</span>
            <span>Your health information is kept private and secure.</span>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <strong>24/7</strong>
              <span>AI Support</span>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <strong>AI</strong>
              <span>Powered Insights</span>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <strong>100%</strong>
              <span>Accessible Online</span>
            </div>
          </div>
        </div>

        {/* =====================================================
            AI HEALTH CARD
        ===================================================== */}
        <div className="hero-visual">

          <div className="floating-orb orb-one"></div>
          <div className="floating-orb orb-two"></div>

          <div className="health-card">

            <div className="card-shine"></div>

            <div className="card-top">
              <div className="assistant-title">

                <div className="ai-avatar">
                  <span>✦</span>
                  <div className="avatar-ring"></div>
                </div>

                <div>
                  <span className="card-label">MediAssist AI</span>
                  <h3>How can I help you?</h3>

                  <div className="online-status">
                    <span></span>
                    AI Assistant online
                  </div>
                </div>
              </div>

              <div className="ai-icon">✦</div>
            </div>

            <div className="chat-message ai-message">
              <div className="message-icon">✦</div>

              <p>
                Hi! I'm your AI health assistant. Tell me what you're
                experiencing and I'll help you understand it.
              </p>
            </div>

            <div className="chat-message user-message">
              <p>I have been feeling tired lately.</p>
            </div>

            <div className="typing-message">
              <div className="typing-avatar">✦</div>

              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <span>AI is responding</span>
            </div>

            <div className="health-stats">

              <div className="stat-item">
                <span className="stat-icon">♥</span>

                <div>
                  <strong>Health</strong>
                  <small>Assessment</small>
                </div>
              </div>

              <div className="stat-item">
                <span className="stat-icon">◉</span>

                <div>
                  <strong>AI Chat</strong>
                  <small>24/7 Support</small>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section className="features-section">

        <div className="section-heading">
          <div className="section-eyebrow">
            WHAT WE OFFER
          </div>

          <h2>
            Healthcare made <span>simpler.</span>
          </h2>

          <p>
            Everything you need to better understand and manage your
            health information in one intelligent platform.
          </p>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">✦</div>
              <span className="feature-number">01</span>
            </div>

            <h3>AI Health Assistant</h3>

            <p>
              Ask health-related questions and receive helpful,
              easy-to-understand information whenever you need it.
            </p>

            <div className="feature-line"></div>
          </div>

          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">♥</div>
              <span className="feature-number">02</span>
            </div>

            <h3>Health Assessment</h3>

            <p>
              Record your symptoms and receive AI-powered health
              information based on what you provide.
            </p>

            <div className="feature-line"></div>
          </div>

          <div className="feature-card">
            <div className="feature-top">
              <div className="feature-icon">◷</div>
              <span className="feature-number">03</span>
            </div>

            <h3>Health History</h3>

            <p>
              Keep track of previous assessments and conversations
              in one convenient and organized place.
            </p>

            <div className="feature-line"></div>
          </div>

        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="home-footer">

        <div className="home-logo">
          <span className="logo-icon">✚</span>
          <span>
            MediAssist <span className="logo-ai">AI</span>
          </span>
        </div>

        <p>AI-powered healthcare information assistant</p>

        <small>
          For informational purposes only. Not a substitute for professional medical advice.
        </small>
      </footer>

    </div>
  );
}

export default Home;