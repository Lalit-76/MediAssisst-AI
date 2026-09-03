import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      {/* Navigation */}
      <nav className="home-navbar">
        <div className="home-logo">
          <span className="logo-icon">✚</span>
          <span>MediAssist AI</span>
        </div>

        <div className="nav-links">
          <Link to="/login" className="nav-login">
            Login
          </Link>

          <Link to="/register" className="nav-register">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            ✨ AI-Powered Healthcare Assistant
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
              Get Started
              <span>→</span>
            </Link>

            <Link to="/login" className="secondary-button">
              Login
            </Link>
          </div>

          <div className="hero-note">
            🔒 Your health information is kept private and secure.
          </div>
        </div>

        {/* Health Card */}
        <div className="hero-visual">
          <div className="health-card">
            <div className="card-top">
              <div>
                <span className="card-label">MediAssist AI</span>
                <h3>How can I help you?</h3>
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

      {/* Features */}
      <section className="features-section">
        <div className="section-heading">
          <span>WHAT WE OFFER</span>
          <h2>Healthcare made simpler</h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">✦</div>
            <h3>AI Health Assistant</h3>
            <p>
              Ask health-related questions and receive helpful,
              easy-to-understand information.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">♥</div>
            <h3>Health Assessment</h3>
            <p>
              Record your symptoms and get an AI-powered assessment
              based on the information you provide.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">◷</div>
            <h3>Health History</h3>
            <p>
              Keep track of your previous assessments and conversations
              in one convenient place.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-logo">
          <span className="logo-icon">✚</span>
          <span>MediAssist AI</span>
        </div>

        <p>AI-powered healthcare information assistant</p>
      </footer>
    </div>
  );
}

export default Home;