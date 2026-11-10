import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Fullstack() {
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
        courseName: "Full-Stack Web Development Bootcamp",
        price: 2499,
      },
    });
  };

  const enrolled = (userData && userData.enrolledCourses || []).some(c => c.name === 'Full-Stack Web Development Bootcamp');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">
          The Complete Full-Stack <br /> Web Development Bootcamp
        </h1>
        <p className="coursepage-sub">
          Become a Full-Stack Web Developer with just ONE course. HTML, CSS,
          Javascript, Node, React, MongoDB, and more.
        </p>
        {enrolled ? (
          <Link to="/course/resources" state={{ courseName: 'Full-Stack Web Development Bootcamp' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.5 ★</span>
            <span className="coursepage-stat-sub">(130 reviews)</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">3 weeks to complete</span>
            <span className="coursepage-stat-sub">at 10 hours a week</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Flexible schedule</span>
            <span className="coursepage-stat-sub">Learn at your own pace</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>Master HTML5 and CSS3 to build responsive web pages.</li>
          <li>
            Develop dynamic applications using JavaScript (ES6+) and DOM
            manipulation.
          </li>
          <li>Create RESTful APIs with Node.js and Express.</li>
          <li>Use Git & GitHub for version control and team collaboration.</li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Restful API",
            "Responsive Web Design",
            "Full-Stack Development",
            "Spring Framework",
            "Amazon Web Services",
            "Java",
            "Server Side",
            "API",
            "Javascript",
            "Front-End Development",
            "Model View Controller",
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
          This Full-Stack Web Development Bootcamp is designed to teach you
          everything needed to become a professional full-stack developer.
        </p>
        <p className="coursepage-desc">
          The course covers a wide range of technologies, including:
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Front-End Development</li>
            <li>HTML5</li>
            <li>CSS3</li>
            <li>Flexbox</li>
            <li>Grid</li>
            <li>Bootstrap 5</li>
            <li>JavaScript ES6</li>
            <li>DOM Manipulation</li>
          </ul>

          <ul>
            <li>Databases</li>
            <li>SQL</li>
            <li>PostgreSQL</li>
            <li>Authentication</li>
            <li>React.js</li>
            <li>React Hooks</li>
            <li>Web Design</li>
            <li>Deployment with GitHub Pages</li>
          </ul>

          <ul>
            <li>Git & GitHub</li>
            <li>Backend Development</li>
            <li>Node.js</li>
            <li>NPM</li>
            <li>Express.js</li>
            <li>EJS</li>
            <li>REST</li>
            <li>APIs</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
