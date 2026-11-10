import React, {useEffect, useContext, useState} from "react";
import "../styles/hackathons.css";
import axios from "axios";
import { Link } from "react-router-dom";
import hackImg1 from "../assets/hack1.webp";
import hackImg2 from "../assets/hack2.webp";
import hackImg3 from "../assets/hack3.webp";
import hackImg4 from "../assets/hack4.webp";
import hackImg5 from "../assets/hack5.webp";
import hackImg6 from "../assets/hack6.webp";
import hackImg7 from "../assets/hack7.webp";
import hackathonHero from "../assets/hackathon-hero.webp";
import { AppContext } from "../context/Appcontext";

function Hackathons() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const { backendUrl, userData } = useContext(AppContext);
  const [activeHacks, setActiveHacks] = useState([]);
  const [upcomingHacks, setUpcomingHacks] = useState([]);

  // Fetch active hackathons
  useEffect(() => {
    const fetchActiveHackathons = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/hackathon/all/active`);
        if (res.data?.success && res.data?.hackathons) {
          setActiveHacks(res.data.hackathons);
        }
      } catch (error) {
        console.error('Error fetching active hackathons:', error);
      }
    };
    
    fetchActiveHackathons();
  }, [backendUrl]);

  // Fetch inactive hackathons
  useEffect(() => {
    const fetchInactiveHackathons = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/hackathon/all/inactive`);
        if (res.data?.success && res.data?.hackathons) {
          setUpcomingHacks(res.data.hackathons);
        }
      } catch (error) {
        console.error('Error fetching inactive hackathons:', error);
      }
    };
    
    fetchInactiveHackathons();
  }, [backendUrl]);

  const handleScroll = () => {
    const section = document.querySelector(".hackathon-list");
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="hackathon-page">
      {/* ---- Hero Section ----- */}
      <section className="hero-section">
        <img src={hackathonHero} alt="Hackathon Hero" className="hero-img" />

        <div className="hero-content">
          <h1 className="hero-title shake-text">
            Code <span>Create</span> Conquer!
          </h1>

          <button className="hero-btn" onClick={handleScroll}>
            Register Now
          </button>
        </div>
      </section>

      {/* ---- Why Section ----- */}
      <section className="why-center-section">
        <div className="section-header">
          <h2 className="main-title">Your Next Leap Forward</h2>
          <p className="subtitle">
            Unlock unparalleled growth and opportunity.
          </p>
        </div>

        <div className="why-pillar-grid">
          <div className="pillar-card yellow-gradient">
            <h3 className="pillar-title">Real-World Impact</h3>
            <p className="pillar-description">
              Challenge yourself by developing solutions for genuine industry
              needs, building a portfolio-ready project.
            </p>
          </div>

          <div className="pillar-card green-gradient">
            <h3 className="pillar-title">Collaborative Growth</h3>
            <p className="pillar-description">
              Enhance teamwork, master agile methodologies, and sharpen
              essential problem-solving skills in a high-energy environment.
            </p>
          </div>

          <div className="pillar-card orange-gradient">
            <h3 className="pillar-title">Connect with Leaders</h3>
            <p className="pillar-description">
              Gain exclusive exposure direct visibility with top tech employers
              and industry leaders.
            </p>
          </div>
        </div>
      </section>

      {/* --- Present Hackathon Section ----- */}
      <section className="hackathon-list">
        <h2 className="section-title">Present Hackathons</h2>
        <p className="section-sub">
          Participate in hackathons to build skills and showcase your abilities.
        </p>

        <div className="hackathon-cards">
          {activeHacks.length > 0 ? (
            activeHacks.map((h) => (
              <div className="hackathon-card" key={h._id}>
                <img src={(h.image && `${backendUrl}/${h.image}`) || hackImg4} className="hackathon-img" />
                <h3>{h.name}</h3>
                <p>{h.description}</p>
                {userData && Array.isArray(userData.enrolledHackathons) && userData.enrolledHackathons.some(eh => (eh.name === h.name) || (eh._id === h._id)) ? (
                  <Link to={`/hackathon/${h.name}`} className="register-btn">Go to Hackathon</Link>
                ) : (
                  <Link to={`/hackathon/${h.name}`} className="register-btn">Register</Link>
                )}
              </div>
            ))
          ) : (
            <>
              {/* <div className="hackathon-card">
                <img src={hackImg4} className="hackathon-img" />
                <h3>AI Innovation Challenge</h3>
                <p>Develop innovative AI solutions to solve real-world problems.</p>
                <Link to="/hackathon/aiinnovation" className="register-btn">Register</Link>
              </div>

              <div className="hackathon-card">
                <img src={hackImg5} className="hackathon-img" />
                <h3>Data Science Sprint</h3>
                <p>Work with datasets and build impactful analytics projects.</p>
                <Link to="/hackathon/datascience" className="register-btn">Register</Link>
              </div>

              <div className="hackathon-card">
                <img src={hackImg6} className="hackathon-img" />
                <h3>Web Dev Marathon</h3>
                <p>Collaborate with teams to create modern, responsive web apps.</p>
                <Link to="/hackathon/webdev" className="register-btn">Register</Link>
              </div> */}
            </>
          )}
        </div>
      </section>
      {/* ---- Upcoming Hackathon Section ----- */}
      <section className="hackathon-list">
        <h2 className="section-title">Upcoming Hackathons</h2>
        <p className="section-sub">Participate in hackathons to build skills and showcase your abilities.</p>

        <div className="hackathon-cards">
          {upcomingHacks.length > 0 ? (
            upcomingHacks.map((h) => (
              <div className="hackathon-card" key={h._id}>
                <img src={(h.image && `${backendUrl}/${h.image}`) || hackImg3} className="hackathon-img" />
                <h3>{h.name}</h3>
                <p>{h.description}</p>
                {userData && Array.isArray(userData.enrolledHackathons) && userData.enrolledHackathons.some(eh => (eh.name === h.name) || (eh._id === h._id)) ? (
                  <Link to={`/hackathon/${h.name}`} className="register-btn">Go to Hackathon</Link>
                ) : (
                  <Link to={`/hackathon/${h.name}`} className="register-btn">Register</Link>
                )}
              </div>
            ))
          ) : (
            <>
              {/* <div className="hackathon-card">
                <img src={hackImg3} alt="" className="hackathon-img" />
                <h3>Mobile App Makerthon</h3>
                <p>Prototype and build mobile apps that solve real user problems.</p>
                <Link to="/hackathon/mobileapp" className="register-btn">Register</Link>
              </div>

              <div className="hackathon-card">
                <img src={hackImg2} alt="" className="hackathon-img" />
                <h3>UI/UX Design Race</h3>
                <p>Craft intuitive, user-focused designs from concept to prototype.</p>
                <Link to="/hackathon/uiux" className="register-btn">Register</Link>
              </div>

              <div className="hackathon-card">
                <img src={hackImg6} alt="" className="hackathon-img" />
                <h3>Web Dev Marathon</h3>
                <p>Collaborate with teams to create modern, responsive web apps.</p>
                <Link to="/hackathon/webdev" className="register-btn">Register</Link>
              </div>

              <div className="hackathon-card">
                <img src={hackImg1} alt="" className="hackathon-img" />
                <h3>Full-Stack Code Clash</h3>
                <p>Build complete end-to-end solutions using modern web technologies.</p>
                <Link to="/hackathon/codeclash" className="register-btn">Register</Link>
              </div>

              <div className="hackathon-card">
                <img src={hackImg7} alt="" className="hackathon-img" />
                <h3>Frontend Rapid Sprint</h3>
                <p>Design and develop clean, interactive interfaces under time pressure.</p>
                <Link to="/hackathon/frontendsprint" className="register-btn">Register</Link>
              </div> */}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Hackathons;
