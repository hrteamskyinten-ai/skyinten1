import React, { useContext, useEffect } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, useLocation, Link } from "react-router-dom";
import AppContext from "../context/Appcontext";
import { toast } from "react-toastify";


export default function Startup() {
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
        courseName: "Startup & Entrepreneurship",
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
        <h1 className="coursepage-title">
          Startup & Entrepreneurship
        </h1>
        <p className="coursepage-sub">
          Learn how to build, launch, and scale a successful startup using
          modern business, marketing, and product strategies.
        </p>
        {((userData && userData.enrolledCourses) || []).some(c => c.name === 'Startup & Entrepreneurship') ? (
          <Link to="/course/resources" state={{ courseName: 'Startup & Entrepreneurship' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.5 ★</span>
            <span className="coursepage-stat-sub">120+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">1–2 months</span>
            <span className="coursepage-stat-sub">Beginner friendly</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Real Startup Projects</span>
            <span className="coursepage-stat-sub">Idea to Launch</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Validate startup ideas using real customer and market research.
          </li>
          <li>
            Create business models, revenue plans, and go-to-market strategies.
          </li>
          <li>
            Build an MVP (Minimum Viable Product) using lean startup principles.
          </li>
          <li>
            Develop branding, marketing, and customer acquisition strategies.
          </li>
          <li>Pitch your startup to investors with a strong pitch deck.</li>
          <li>Understand funding, scaling, and startup operations.</li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Entrepreneurship",
            "Business Strategy",
            "MVP Building",
            "Pitch Deck Creation",
            "Market Research",
            "Branding",
            "Marketing Strategy",
            "Customer Acquisition",
            "Product Development",
            "Leadership",
            "Revenue Models",
            "Startup Management",
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
          The Startup & Entrepreneurship Bootcamp teaches you how to turn ideas
          into real businesses. You'll learn ideation, validation, product
          development, branding, marketing, funding, and scaling. This course
          covers everything modern founders use to launch startups in the real
          world.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Business Idea Validation</li>
            <li>Customer Research</li>
            <li>Market Analysis</li>
            <li>Lean Startup Principles</li>
            <li>MVP Development</li>
            <li>Brand Building</li>
          </ul>

          <ul>
            <li>Marketing Channels</li>
            <li>SEO & Social Media</li>
            <li>Paid Advertising</li>
            <li>Pitch Deck Design</li>
            <li>Investor Outreach</li>
            <li>Funding Options</li>
          </ul>

          <ul>
            <li>Budget Planning</li>
            <li>Business Models</li>
            <li>Operations & Scaling</li>
            <li>Team Management</li>
            <li>Real Startup Simulations</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
