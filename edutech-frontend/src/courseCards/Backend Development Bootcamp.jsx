import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Backend() {
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
        courseName: "Backend Development Bootcamp",
        price: 2499,
      },
    });
  };
  const enrolled = (userData && userData.enrolledCourses || []).some(c => c.name === 'Backend Development Bootcamp');
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">Backend Development Bootcamp</h1>
        <p className="coursepage-sub">
          Learn how to build and deploy secure, scalable, and high-performance
          backend systems using industry-standard tools.
        </p>
        {enrolled ? (
          <Link to="/course/resources" state={{ courseName: 'Backend Development Bootcamp' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>
            Enroll Now
          </button>
        )}

        {/* --- Stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.7 ★</span>
            <span className="coursepage-stat-sub">90+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">2–3 months</span>
            <span className="coursepage-stat-sub">Self-paced learning</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Hands-on Projects</span>
            <span className="coursepage-stat-sub">Industry-focused</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Build RESTful APIs using Node.js, Express, and modern backend
            frameworks.
          </li>
          <li>Design relational and non-relational database schemas.</li>
          <li>
            Implement authentication, authorization, and secure backend
            workflows.
          </li>
          <li>Work with SQL, PostgreSQL, and MongoDB for data storage.</li>
          <li>Use Git, GitHub, and version control best practices.</li>
          <li>
            Deploy backend applications to cloud platforms like AWS and Render.
          </li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Node.js",
            "Express.js",
            "REST APIs",
            "PostgreSQL",
            "SQL",
            "MongoDB",
            "Authentication",
            "JWT",
            "Server-Side Logic",
            "MVC Architecture",
            "API Security",
            "Cloud Deployment",
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
          This Backend Development Bootcamp teaches you how to build server-side
          applications, databases, APIs, and cloud-ready backend systems. You
          will learn modern backend frameworks, database management,
          authentication workflows, and deployment practices used by
          professional backend engineers.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Node.js Fundamentals</li>
            <li>Express.js Framework</li>
            <li>Middleware Functions</li>
            <li>Routing & Controllers</li>
            <li>MVC Pattern</li>
            <li>Error Handling</li>
          </ul>

          <ul>
            <li>PostgreSQL & SQL</li>
            <li>MongoDB</li>
            <li>Database Design</li>
            <li>Authentication (JWT / OAuth)</li>
            <li>Security Best Practices</li>
            <li>Git & GitHub</li>
          </ul>

          <ul>
            <li>API Testing</li>
            <li>Deployment (AWS / Render)</li>
            <li>Environment Variables</li>
            <li>Scalability Concepts</li>
            <li>Hands-on Backend Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
