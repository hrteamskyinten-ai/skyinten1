import React, { useEffect } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { useContext } from "react";
import { toast } from "react-toastify";

export default function CloudComputing() {
  const navigate = useNavigate();
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
        courseName: "Cloud Computing",
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
        <h1 className="coursepage-title">Cloud Computing</h1>
        <p className="coursepage-sub">
          Learn AWS, Azure, DevOps, and cloud infrastructure to deploy, manage,
          and scale modern applications in the cloud.
        </p>
        {((userData && userData.enrolledCourses) || []).some(c => c.name === 'Cloud Computing') ? (
          <Link to="/course/resources" state={{ courseName: 'Cloud Computing' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>Enroll Now</button>
        )}

        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.5 ★</span>
            <span className="coursepage-stat-sub">160+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">2–3 months</span>
            <span className="coursepage-stat-sub">Self-paced learning</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Cloud Hands-on Labs</span>
            <span className="coursepage-stat-sub">Real Deployments</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Work with AWS, Azure, and Google Cloud to build cloud-native
            applications.
          </li>
          <li>
            Deploy, scale, and monitor cloud services using industry-standard
            tools.
          </li>
          <li>Implement CI/CD pipelines and DevOps workflows.</li>
          <li>
            Manage virtual machines, networks, storage, and cloud security.
          </li>
          <li>
            Use containerization with Docker and orchestration with Kubernetes.
          </li>
          <li>Design highly available and fault-tolerant architectures.</li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "AWS",
            "Azure",
            "Google Cloud",
            "DevOps",
            "Docker",
            "Kubernetes",
            "Terraform",
            "CI/CD",
            "Linux Server Management",
            "Cloud Security",
            "Networking",
            "Monitoring & Logging",
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
          This Cloud Computing Bootcamp is designed to teach you how to
          architect, deploy, and manage cloud-based solutions using AWS, Azure,
          and Google Cloud. You’ll gain hands-on experience with virtual
          machines, cloud networking, containerization, Kubernetes clusters,
          security, and real production-level deployments.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>AWS EC2 & S3</li>
            <li>Cloud Security</li>
            <li>Azure Virtual Machines</li>
            <li>Azure Networking</li>
            <li>Google Cloud Fundamentals</li>
            <li>Load Balancers</li>
          </ul>

          <ul>
            <li>Docker Containers</li>
            <li>Kubernetes Clusters</li>
            <li>CI/CD Pipelines</li>
            <li>Monitoring Tools</li>
            <li>Logging & Alerting</li>
            <li>Virtual Networks</li>
          </ul>

          <ul>
            <li>Auto Scaling Groups</li>
            <li>Serverless Functions</li>
            <li>Database Services</li>
            <li>Real Cloud Projects</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

