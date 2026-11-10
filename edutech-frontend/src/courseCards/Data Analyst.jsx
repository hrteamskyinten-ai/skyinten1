import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function DataAnalyst() {
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
        courseName: "Data Analyst",
        price: 2499,
      },
    });
  };
  const enrolled = (userData && userData.enrolledCourses || []).some(c => c.name === 'Data Analyst');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">Data Analyst</h1>
        <p className="coursepage-sub">
          Learn data analytics, data visualization, SQL, and business
          intelligence tools to make data-driven decisions.
        </p>
        {enrolled ? (
          <Link to="/course/resources" state={{ courseName: 'Data Analyst' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.5 ★</span>
            <span className="coursepage-stat-sub">150+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">2–3 months</span>
            <span className="coursepage-stat-sub">Beginner friendly</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Hands-on Projects</span>
            <span className="coursepage-stat-sub">Portfolio-building</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Analyze, clean, and organize raw datasets for business insights.
          </li>
          <li>Write SQL queries to manage and extract data from databases.</li>
          <li>Create dashboards using Power BI, Tableau, and Excel.</li>
          <li>Perform statistical analysis and forecasting.</li>
          <li>Use Python libraries like Pandas, NumPy, and Matplotlib.</li>
          <li>Turn data insights into actionable business recommendations.</li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Data Cleaning",
            "Data Visualization",
            "SQL",
            "Excel",
            "Power BI",
            "Tableau",
            "Python",
            "Pandas",
            "NumPy",
            "Statistics",
            "Dashboards",
            "Business Intelligence",
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
          The Data Analyst Bootcamp prepares you for real-world roles in data
          analysis, business intelligence, and reporting. You’ll work with SQL,
          Python, Excel, Power BI, and Tableau to explore datasets, build
          dashboards, and extract meaningful insights that help companies make
          data-driven decisions.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Excel Fundamentals</li>
            <li>Data Cleaning Techniques</li>
            <li>Pivot Tables</li>
            <li>Statistical Analysis</li>
            <li>Forecasting</li>
            <li>Data Manipulation (Pandas)</li>
          </ul>

          <ul>
            <li>SQL Basics</li>
            <li>Joins & Subqueries</li>
            <li>Database Management</li>
            <li>Power BI Visuals</li>
            <li>Interactive Dashboards</li>
            <li>Python Data Analysis</li>
          </ul>

          <ul>
            <li>Data Visualization</li>
            <li>Tableau Dashboards</li>
            <li>Business Insights</li>
            <li>Reporting & Storytelling</li>
            <li>Real Data Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
