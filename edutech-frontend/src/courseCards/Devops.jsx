import React, { useEffect, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "../styles/coursePageStyles.css";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function Devops() {
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
        courseName: "DevOps",
        price: 2499
      }
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">DevOps</h1>
        <p className="coursepage-sub">
          Learn CI/CD pipelines, cloud automation, containers, Kubernetes,
          monitoring, and modern DevOps workflows.
        </p>
        {((userData && userData.enrolledCourses) || []).some(c => c.name === 'DevOps') ? (
          <Link to="/course/resources" state={{ courseName: 'DevOps' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.4 ★</span>
            <span className="coursepage-stat-sub">170+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">3 months</span>
            <span className="coursepage-stat-sub">Intermediate</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Real DevOps Projects</span>
            <span className="coursepage-stat-sub">CI/CD + Kubernetes</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Build CI/CD pipelines using Jenkins, GitHub Actions, or GitLab CI.
          </li>
          <li>Work with Docker containers and Kubernetes orchestration.</li>
          <li>Automate cloud infrastructure using Terraform and Ansible.</li>
          <li>
            Monitor systems using Prometheus, Grafana, and cloud monitoring
            tools.
          </li>
          <li>Manage Linux servers, networking, and shell scripting.</li>
          <li>
            Implement DevOps culture, workflows, and deployment strategies.
          </li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "DevOps",
            "CI/CD",
            "Linux",
            "Docker",
            "Kubernetes",
            "Terraform",
            "Ansible",
            "GitHub Actions",
            "Prometheus",
            "Grafana",
            "Cloud Automation",
            "Shell Scripting",
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
          This DevOps Engineering Bootcamp trains you in automation, CI/CD,
          cloud deployment, and container orchestration. You will learn how to
          build reliable pipelines, manage cloud infrastructure, and deploy
          applications at scale using the same tools used by top tech companies.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Linux Administration</li>
            <li>Shell Scripting</li>
            <li>Git & Version Control</li>
            <li>CI/CD Pipeline Setup</li>
            <li>GitHub Actions</li>
            <li>Docker Containers</li>
          </ul>

          <ul>
            <li>Kubernetes Clusters</li>
            <li>Cloud Deployments</li>
            <li>Networking Basics</li>
            <li>Monitoring Tools</li>
            <li>Alerting Systems</li>
            <li>Load Balancing</li>
          </ul>

          <ul>
            <li>Scaling Strategies</li>
            <li>Real DevOps Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
