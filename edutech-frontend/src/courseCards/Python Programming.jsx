import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Python() {
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
        courseName: "Python Programming",
        price: 2499,
      },
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const enrolled = ((userData && userData.enrolledCourses) || []).some(
    (c) => c.name === "Python Programming"
  );

  const skills = [
    "Python",
    "Flask",
    "Django",
    "APIs",
    "Pandas",
    "Automation",
    "JSON",
    "File Handling",
    "Scripting",
    "Data Analysis",
    "Backend Development",
  ];

  return (
    <div className="coursepage-layout">
      <section className="coursepage-hero">
        <h1 className="coursepage-title">Python Programming</h1>
        <p className="coursepage-sub">
          Learn Python from fundamentals to advanced concepts including
          automation, APIs, data analysis, and backend development.
        </p>
        {enrolled ? (
          <Link
            to="/course/resources"
            state={{ courseName: "Python Programming" }}
            className="coursepage-enroll-btn"
          >
            Go to Course Resources
          </Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>
            Enroll Now
          </button>
        )}

        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.6 ★</span>
            <span className="coursepage-stat-sub">210+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">2–3 months</span>
            <span className="coursepage-stat-sub">Beginner friendly</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Hands-on Python Projects</span>
            <span className="coursepage-stat-sub">Automation + APIs</span>
          </div>
        </div>
      </section>

      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>Core Python syntax, data types, and control structures.</li>
          <li>Work with Python libraries for automation, data processing, and scripting.</li>
          <li>Build backend applications using Flask and Django frameworks.</li>
          <li>Interact with APIs, JSON, and external services.</li>
          <li>Use Python for file handling, automation, and task scheduling.</li>
          <li>Analyze data using Pandas, NumPy, and Matplotlib.</li>
        </ul>
      </section>

      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {skills.map((skill, index) => (
            <span key={index} className="coursepage-skill">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="coursepage-section">
        <h2 className="coursepage-heading">Description</h2>

        <p className="coursepage-desc">
          The Python Programming course covers everything from basic Python
          programming to backend development, automation, and data analysis.
          You’ll build real-world applications, automate workflows, and use
          Python’s powerful libraries to solve practical problems like APIs,
          file operations, and data visualization.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Python Basics</li>
            <li>Variables & Data Types</li>
            <li>Loops & Conditions</li>
            <li>Functions & Modules</li>
            <li>OOP in Python</li>
            <li>Error Handling</li>
          </ul>

          <ul>
            <li>Flask Backend</li>
            <li>Django Framework</li>
            <li>API Integration</li>
            <li>JSON Parsing</li>
            <li>Web Scraping</li>
            <li>File Automation</li>
          </ul>

          <ul>
            <li>Pandas Data Analysis</li>
            <li>NumPy Arrays</li>
            <li>Matplotlib Charts</li>
            <li>Data Cleaning</li>
            <li>Deployment Basics</li>
            <li>Real Python Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
