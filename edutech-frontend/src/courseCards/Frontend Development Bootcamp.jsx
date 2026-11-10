import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Frontend() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContext);
  const handleEnroll = () => {
    if (!userData) {
      toast.info("Please Sign in to purchase courses", { position: "top-center", autoClose: 1800 });
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1900);
      return;
    }

    if (userData && userData.verifiedStatus === false) {
      toast.info("Your Account Is Not Verified. Only The Verified Accounts Have The Access To Purchase Courses", { position: "top-center", autoClose: 2200 });
      return;
    }

    navigate("/payment", {
      state: {
        courseName: "Frontend Development Bootcamp",
        price: 2499,
      },
    });
  };

  const enrolled = (userData && userData.enrolledCourses || []).some(c => c.name === 'Frontend Development Bootcamp');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">Frontend Development Bootcamp</h1>
        <p className="coursepage-sub">
          Learn to build modern, responsive, and interactive user interfaces
          using HTML, CSS, JavaScript, and React.js.
        </p>
        {enrolled ? (
          <Link to="/course/resources" state={{ courseName: 'Frontend Development Bootcamp' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.4 ★</span>
            <span className="coursepage-stat-sub">200+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">2–3 months</span>
            <span className="coursepage-stat-sub">Beginner friendly</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Real UI Projects</span>
            <span className="coursepage-stat-sub">Portfolio building</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Build responsive websites using HTML5, CSS3, Flexbox, and Grid.
          </li>
          <li>Create dynamic interfaces using JavaScript ES6+.</li>
          <li>
            Develop full-scale applications using React.js and React Hooks.
          </li>
          <li>Work with APIs, async operations, and real-time data.</li>
          <li>Apply UI/UX principles to design clean user interfaces.</li>
          <li>
            Deploy frontend applications using Netlify, Vercel, or GitHub Pages.
          </li>
        </ul>
      </section>

      {/* SKILLS */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "HTML5",
            "CSS3",
            "JavaScript",
            "React.js",
            "Responsive Web Design",
            "UI/UX",
            "API Integration",
            "Git",
            "Tailwind CSS",
            "Bootstrap",
            "State Management",
            "Web Deployment",
          ].map((skill, index) => (
            <span key={index} className="coursepage-skill">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* --- Description Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Description</h2>

        <p className="coursepage-desc">
          This Frontend Development Bootcamp prepares you to build modern,
          interactive websites and applications. You’ll learn everything from
          HTML and CSS to advanced React development, API integration, and
          responsive interface design used in real-world web projects.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>HTML5 Basics</li>
            <li>CSS3 & Flexbox</li>
            <li>Grid Layouts</li>
            <li>Responsive Design</li>
            <li>JavaScript ES6+</li>
            <li>DOM Manipulation</li>
          </ul>

          <ul>
            <li>React.js Framework</li>
            <li>Hooks & Components</li>
            <li>State Management</li>
            <li>Fetch & Axios</li>
            <li>Routing (React Router)</li>
            <li>UI Optimization</li>
          </ul>

          <ul>
            <li>Tailwind / Bootstrap</li>
            <li>Figma to UI Design</li>
            <li>Performance Improvements</li>
            <li>Git & GitHub</li>
            <li>Frontend Deployment</li>
            <li>Real-World Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
