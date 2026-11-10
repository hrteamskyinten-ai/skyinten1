import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function AIRobotics() {
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
        courseName: "AI Robotics",
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
        <h1 className="coursepage-title">AI & Robotics</h1>
        <p className="coursepage-sub">
          Learn Artificial Intelligence, Machine Learning, and Robotics
          Engineering to build intelligent, autonomous systems.
        </p>
        {((userData && userData.enrolledCourses) || []).some(c => c.name === 'AI Robotics') ? (
          <Link to="/course/resources" state={{ courseName: 'AI Robotics' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.6 ★</span>
            <span className="coursepage-stat-sub">140+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">3–4 months</span>
            <span className="coursepage-stat-sub">Self-paced learning</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Hands-on Robotics</span>
            <span className="coursepage-stat-sub">Industry Projects</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Build AI models using Machine Learning, Deep Learning, and neural
            networks.
          </li>
          <li>
            Program robots using Python, ROS (Robot Operating System), and
            automation tools.
          </li>
          <li>
            Use computer vision techniques for real-time object detection and
            tracking.
          </li>
          <li>Work with embedded systems, sensors, and robotic actuators.</li>
          <li>
            Design autonomous robotic systems with path planning and navigation.
          </li>
          <li>
            Integrate hardware and AI software into functional robotic projects.
          </li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Machine Learning",
            "Deep Learning",
            "Python",
            "TensorFlow",
            "Computer Vision",
            "OpenCV",
            "ROS",
            "Robotics Programming",
            "Neural Networks",
            "Path Planning",
            "Embedded Systems",
            "Object Detection",
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
          This AI & Robotics Engineering Bootcamp covers the full spectrum of
          intelligent systems— from machine learning and neural networks to
          robotics programming, embedded systems, and real-time automation. You
          will learn how to build, program, and deploy AI-powered robots capable
          of perception, decision-making, and autonomous navigation.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Python Programming</li>
            <li>Machine Learning</li>
            <li>Deep Learning Models</li>
            <li>Neural Networks</li>
            <li>Computer Vision (OpenCV)</li>
            <li>Image Classification</li>
          </ul>

          <ul>
            <li>Robotics Fundamentals</li>
            <li>Motion Control</li>
            <li>Autonomous Navigation</li>
            <li>Embedded Systems</li>
            <li>Microcontrollers</li>
            <li>AI Model Deployment</li>
          </ul>

          <ul>
            <li>Object Tracking</li>
            <li>Project-Based Robotics</li>
            <li>Real-Time AI Systems</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
