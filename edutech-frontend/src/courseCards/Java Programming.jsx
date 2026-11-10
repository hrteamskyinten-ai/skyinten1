import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Java() {
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
        courseName: "Java Programming",
        price: 2499,
      },
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">Java Development Bootcamp</h1>
        <p className="coursepage-sub">
          Learn core Java, object-oriented programming, data structures, Spring
          Framework, APIs, and backend development.
        </p>
        {((userData && userData.enrolledCourses) || []).some(c => c.name === 'Java Programming') ? (
          <Link to="/course/resources" state={{ courseName: 'Java Programming' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.7 ★</span>
            <span className="coursepage-stat-sub">130+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">3 months</span>
            <span className="coursepage-stat-sub">Beginner–Intermediate</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Spring Boot Projects</span>
            <span className="coursepage-stat-sub">REST API development</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Master core Java programming, OOP principles, and Java syntax.
          </li>
          <li>
            Work with data structures, collections framework, and algorithms.
          </li>
          <li>Build production-grade applications using Spring Boot.</li>
          <li>
            Create RESTful APIs and connect Java applications with databases.
          </li>
          <li>Use JDBC, Hibernate, and JPA for database communication.</li>
          <li>Deploy Java applications to cloud and server environments.</li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Java",
            "OOP",
            "Spring Boot",
            "REST APIs",
            "Hibernate",
            "JPA",
            "MySQL",
            "PostgreSQL",
            "Data Structures",
            "Algorithms",
            "Maven",
            "Backend Development",
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
          The Java Development Bootcamp covers everything from core Java and
          object-oriented programming to modern enterprise application
          development using Spring Boot. You’ll build real REST APIs, integrate
          databases, and deploy Java applications like a professional backend
          engineer.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Java Basics & Syntax</li>
            <li>OOP Principles</li>
            <li>Collections Framework</li>
            <li>Exception Handling</li>
            <li>Multithreading</li>
            <li>File Handling</li>
          </ul>

          <ul>
            <li>Spring Boot Basics</li>
            <li>REST API Development</li>
            <li>Dependency Injection</li>
            <li>JPA Repositories</li>
            <li>MySQL / PostgreSQL</li>
            <li>Maven & Build Tools</li>
          </ul>

          <ul>
            <li>Unit Testing (JUnit)</li>
            <li>Cloud Deployment</li>
            <li>Microservices Basics</li>
            <li>Real Java Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
