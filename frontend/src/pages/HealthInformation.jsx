import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HealthInformation.css";

function HealthInformation() {

  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [search, setSearch] = useState("");


  const healthTopics = [
    {
      id: 1,
      icon: "🤒",
      title: "Common Symptoms",
      description:
        "Learn about common symptoms, possible general causes, and when to seek medical advice.",
      content: [
        "Headache can be associated with stress, dehydration, lack of sleep, infections, or other conditions.",
        "Fever is commonly associated with infections, although there can be other causes.",
        "Fatigue can occur due to poor sleep, stress, dehydration, illness, or lifestyle factors.",
        "Persistent, severe, or worsening symptoms should be evaluated by a qualified healthcare professional."
      ]
    },

    {
      id: 2,
      icon: "🫀",
      title: "Heart Health",
      description:
        "General information about maintaining cardiovascular health.",
      content: [
        "Regular physical activity can support cardiovascular health.",
        "A balanced diet with vegetables, fruits, whole grains, and appropriate protein can support overall health.",
        "Avoiding tobacco and maintaining healthy lifestyle habits can reduce cardiovascular risks.",
        "Chest pain, severe difficulty breathing, fainting, or sudden weakness require urgent medical attention."
      ]
    },

    {
      id: 3,
      icon: "🥗",
      title: "Nutrition",
      description:
        "Learn about balanced eating and healthy nutrition habits.",
      content: [
        "A varied diet can help provide essential nutrients.",
        "Include vegetables, fruits, whole grains, protein sources, and healthy fats in appropriate amounts.",
        "Drink adequate water according to your individual needs.",
        "Limit excessive consumption of highly processed foods, added sugars, and excessive salt."
      ]
    },

    {
      id: 4,
      icon: "🏃",
      title: "Exercise & Fitness",
      description:
        "General information about physical activity and healthy movement.",
      content: [
        "Regular physical activity can support cardiovascular health, strength, mobility, and overall wellbeing.",
        "Start gradually if you have not exercised regularly.",
        "Include a combination of aerobic activity and strength-building exercises when appropriate.",
        "Stop exercising and seek medical advice if you experience concerning symptoms such as severe chest pain or fainting."
      ]
    },

    {
      id: 5,
      icon: "😴",
      title: "Sleep",
      description:
        "General information about healthy sleep habits and better rest.",
      content: [
        "Maintaining a consistent sleep schedule can support healthy sleep habits.",
        "Keeping your sleeping environment comfortable, quiet, and dark may help improve sleep.",
        "Limiting excessive caffeine and screen use close to bedtime may be helpful.",
        "Persistent sleep problems or significant daytime tiredness should be discussed with a qualified healthcare professional."
      ]
    },

    {
      id: 6,
      icon: "🧠",
      title: "Mental Wellness",
      description:
        "General information about stress management, sleep, and emotional wellbeing.",
      content: [
        "Regular sleep, physical activity, social connection, and healthy routines can support mental wellbeing.",
        "Relaxation techniques such as breathing exercises or mindfulness may help manage everyday stress.",
        "Talking to a trusted person or qualified professional can be helpful when difficulties persist.",
        "If someone is in immediate danger or experiencing a mental health emergency, contact local emergency services or an appropriate crisis service."
      ]
    },

    {
      id: 7,
      icon: "🚨",
      title: "Warning Signs",
      description:
        "Important symptoms that may require urgent medical attention.",
      content: [
        "Severe difficulty breathing can require emergency medical attention.",
        "Sudden chest pain or pressure can be an emergency.",
        "Sudden weakness, facial drooping, difficulty speaking, or confusion can be warning signs of a stroke.",
        "Severe bleeding, loss of consciousness, seizures, or rapidly worsening symptoms require urgent medical evaluation."
      ]
    },

    {
      id: 8,
      icon: "🫁",
      title: "Respiratory Health",
      description:
        "General information about breathing and respiratory health.",
      content: [
        "Coughing, congestion, wheezing, and shortness of breath can have different causes.",
        "Respiratory symptoms may occur with infections, allergies, environmental irritants, or other conditions.",
        "Avoiding tobacco smoke and other respiratory irritants can support respiratory health.",
        "Severe difficulty breathing or rapidly worsening respiratory symptoms require urgent medical attention."
      ]
    },

    {
      id: 9,
      icon: "💧",
      title: "Hydration",
      description:
        "General information about hydration and maintaining fluid balance.",
      content: [
        "Water is important for many normal body functions.",
        "Fluid needs can vary depending on activity, climate, diet, age, and individual circumstances.",
        "Thirst, dry mouth, dark urine, and tiredness can sometimes occur with inadequate fluid intake.",
        "Severe dehydration symptoms or inability to keep fluids down may require medical attention."
      ]
    },

    {
      id: 10,
      icon: "🩹",
      title: "First Aid",
      description:
        "Basic general information for common minor injuries and emergencies.",
      content: [
        "For a minor cut, gently clean the area and cover it with an appropriate clean dressing.",
        "For a minor burn, cool the affected area with clean running water and avoid applying ice directly.",
        "For serious injuries, heavy bleeding, loss of consciousness, or severe burns, seek emergency medical care.",
        "First-aid information does not replace professional medical treatment."
      ]
    }
  ];


  // ============================================================
  // SEARCH TOPICS
  // ============================================================

  const filteredTopics = useMemo(() => {

    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return healthTopics;
    }

    return healthTopics.filter((topic) => {

      return (
        topic.title.toLowerCase().includes(searchText) ||
        topic.description.toLowerCase().includes(searchText) ||
        topic.content.some((item) =>
          item.toLowerCase().includes(searchText)
        )
      );

    });

  }, [search]);


  // ============================================================
  // OPEN TOPIC
  // ============================================================

  const openTopic = (topic) => {

    setSelectedTopic(topic);

    window.setTimeout(() => {

      const detailElement =
        document.getElementById("topic-detail");

      if (detailElement) {

        detailElement.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }, 50);

  };


  // ============================================================
  // CLOSE TOPIC
  // ============================================================

  const closeTopic = () => {

    setSelectedTopic(null);

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
  // DASHBOARD
  // ============================================================

  const goToDashboard = () => {

    navigate("/dashboard");

  };


  // ============================================================
  // AI ASSISTANT
  // ============================================================

  const goToAssistant = () => {

    navigate("/chat");

  };


  return (

    <div className="health-info-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="health-info-header">


        <div
          className="health-info-logo"
          onClick={goToDashboard}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {

            if (event.key === "Enter") {
              goToDashboard();
            }

          }}
        >

          MediAssist <span>AI</span>

        </div>


        <div className="health-info-header-actions">


          <button
            type="button"
            className="back-dashboard-button"
            onClick={goToDashboard}
          >
            ← Dashboard
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
          MAIN
      ====================================================== */}

      <main className="health-info-container">


        {/* ====================================================
            TITLE
        ==================================================== */}

        <div className="health-info-title">


          <div className="health-info-main-icon">
            💊
          </div>


          <div>

            <h1>
              Health Information
            </h1>

            <p>
              Explore general health information and healthy
              lifestyle guidance.
            </p>

          </div>


        </div>



        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="health-search-container">


          <div className="health-search">


            <span className="health-search-icon">
              🔍
            </span>


            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search health topics..."
              aria-label="Search health topics"
            />


            {search && (

              <button
                type="button"
                className="clear-search-button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>

            )}


          </div>


          <div className="health-search-count">

            {filteredTopics.length}{" "}
            {filteredTopics.length === 1
              ? "topic"
              : "topics"
            }

          </div>


        </div>



        {/* ====================================================
            SELECTED TOPIC
        ==================================================== */}

        {selectedTopic && (

          <section
            id="topic-detail"
            className="topic-detail-card"
          >


            <button
              type="button"
              className="close-topic-button"
              onClick={closeTopic}
              aria-label="Close topic"
            >
              ✕
            </button>


            <div className="topic-detail-title">


              <div className="topic-detail-icon">

                {selectedTopic.icon}

              </div>


              <div>

                <h2>

                  {selectedTopic.title}

                </h2>


                <p>

                  {selectedTopic.description}

                </p>

              </div>


            </div>



            <div className="topic-content">


              <h3>
                General Information
              </h3>


              {selectedTopic.content.map(
                (item, index) => (

                  <div
                    className="topic-point"
                    key={`${selectedTopic.id}-${index}`}
                  >

                    <span>
                      ✓
                    </span>

                    <p>
                      {item}
                    </p>

                  </div>

                )
              )}


            </div>



            <div className="topic-note">

              ⚠️ <strong>Important:</strong> This information
              is for general educational purposes only and is
              not a medical diagnosis or treatment plan.

            </div>


          </section>

        )}



        {/* ====================================================
            TOPICS TITLE
        ==================================================== */}

        <div className="health-info-section-header">


          <div>

            <h2 className="health-info-section-title">

              Explore Health Topics

            </h2>


            <p>

              Select a topic to learn more.

            </p>

          </div>


        </div>



        {/* ====================================================
            TOPICS
        ==================================================== */}

        {filteredTopics.length > 0 ? (

          <div className="health-topic-grid">


            {filteredTopics.map((topic) => (

              <article
                className={`health-topic-card ${
                  selectedTopic?.id === topic.id
                    ? "active-topic"
                    : ""
                }`}
                key={topic.id}
              >


                <div className="health-topic-icon">

                  {topic.icon}

                </div>


                <h3>

                  {topic.title}

                </h3>


                <p>

                  {topic.description}

                </p>


                <button
                  type="button"
                  onClick={() => openTopic(topic)}
                >

                  {selectedTopic?.id === topic.id
                    ? "View Again ↑"
                    : "Learn More →"
                  }

                </button>


              </article>

            ))}


          </div>

        ) : (

          <div className="health-no-results">


            <div className="no-results-icon">
              🔎
            </div>


            <h2>
              No health topics found
            </h2>


            <p>
              Try searching for another health topic.
            </p>


            <button
              type="button"
              onClick={() => setSearch("")}
            >
              Show All Topics
            </button>


          </div>

        )}



        {/* ====================================================
            AI ASSISTANT CTA
        ==================================================== */}

        <section className="health-info-ai-card">


          <div className="health-info-ai-icon">
            🤖
          </div>


          <div className="health-info-ai-content">


            <h2>
              Have a health question?
            </h2>


            <p>

              Ask MediAssist AI for general health information
              about symptoms, wellness, and health concerns.

            </p>


          </div>


          <button
            type="button"
            onClick={goToAssistant}
          >

            Ask AI Assistant →

          </button>


        </section>



        {/* ====================================================
            DISCLAIMER
        ==================================================== */}

        <div className="health-info-disclaimer">


          <span className="disclaimer-icon">
            ⚠️
          </span>


          <div>

            <strong>
              Important:
            </strong>{" "}

            MediAssist AI provides general health information
            for educational purposes. It does not replace
            professional medical advice, diagnosis, or treatment.
            If you have serious or emergency symptoms, seek
            appropriate professional medical care immediately.

          </div>


        </div>


      </main>


    </div>

  );

}


export default HealthInformation;