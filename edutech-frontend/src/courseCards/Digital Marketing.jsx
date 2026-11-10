import React, { useEffect } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Marketing() {
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
        courseName: "Digital Marketing",
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
        <h1 className="coursepage-title">Digital Marketing</h1>
        <p className="coursepage-sub">
          Learn SEO, social media marketing, content strategy, advertising,
          analytics, and brand growth techniques used by modern marketers.
        </p>
        <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.6 ★</span>
            <span className="coursepage-stat-sub">110+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">1–2 months</span>
            <span className="coursepage-stat-sub">Beginner friendly</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">
              Real Marketing Projects
            </span>
            <span className="coursepage-stat-sub">Brand strategy included</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>Optimize websites using SEO and keyword research strategies.</li>
          <li>
            Create and manage social media campaigns for brand visibility.
          </li>
          <li>Run paid ads on Google, Facebook, and Instagram Ads Manager.</li>
          <li>
            Measure performance using Google Analytics and marketing KPIs.
          </li>
          <li>Design effective content strategies for digital platforms.</li>
          <li>
            Use email marketing tools for automation and audience engagement.
          </li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "SEO Optimization",
            "Keyword Research",
            "Social Media Marketing",
            "Google Ads",
            "Facebook Ads",
            "Email Marketing",
            "Analytics",
            "Content Strategy",
            "Branding",
            "Marketing Automation",
            "Copywriting",
            "Lead Generation",
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
          The Digital Marketing Bootcamp teaches you SEO, paid advertising,
          analytics, content marketing, and brand-building strategies. You’ll
          work on real campaigns, analyze competitor data, create targeted ad
          sets, and learn how to grow organic and paid traffic for any business.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>SEO Fundamentals</li>
            <li>On-Page Optimization</li>
            <li>Keyword Planning</li>
            <li>Content Writing</li>
            <li>Marketing Funnels</li>
            <li>Facebook & Instagram Ads</li>
          </ul>

          <ul>
            <li>Google Ads Campaigns</li>
            <li>Audience Targeting</li>
            <li>Conversion Tracking</li>
            <li>Email Automation</li>
            <li>Brand Positioning</li>
            <li>Google Analytics</li>
          </ul>

          <ul>
            <li>Data Reporting</li>
            <li>Social Media Strategy</li>
            <li>Influencer Marketing</li>
            <li>Landing Page Optimization</li>
            <li>Real Marketing Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
