import React, { useEffect, useContext } from "react";
import "../styles/coursePageStyles.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function CyberSecurity() {
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
        courseName: "Cyber Security",
        price: 2499,
      },
    });
  };

  const enrolled = (userData && userData.enrolledCourses || []).some(c => c.name === 'Cyber Security');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="coursepage-layout">
      {/* --- Hero Section --- */}
      <section className="coursepage-hero">
        <h1 className="coursepage-title">Cyber Security</h1>
        <p className="coursepage-sub">
          Learn ethical hacking, network security, threat detection, and
          defensive strategies to protect systems and data.
        </p>
        {enrolled ? (
          <Link to="/course/resources" state={{ courseName: 'Cyber Security' }} className="coursepage-enroll-btn">Go to Course Resources</Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>
            Enroll Now
          </button>
        )}
        {/* --- stats Section --- */}
        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">4.6 ★</span>
            <span className="coursepage-stat-sub">180+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">3 months</span>
            <span className="coursepage-stat-sub">Beginner–Intermediate</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">Real Security Labs</span>
            <span className="coursepage-stat-sub">Hands-on practice</span>
          </div>
        </div>
      </section>

      {/* --- What you'll learn  --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>

        <ul className="coursepage-list">
          <li>
            Understand core cybersecurity principles, attack types, and defense
            mechanisms.
          </li>
          <li>
            Perform ethical hacking, vulnerability testing, and penetration
            testing.
          </li>
          <li>
            Secure networks, servers, and applications using industry best
            practices.
          </li>
          <li>Detect and analyze threats using SIEM and monitoring tools.</li>
          <li>
            Implement encryption, access control, and identity management.
          </li>
          <li>
            Work with firewalls, VPNs, IDS/IPS, and endpoint security tools.
          </li>
        </ul>
      </section>

      {/* --- Skills Section --- */}
      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>

        <div className="coursepage-skills">
          {[
            "Ethical Hacking",
            "Penetration Testing",
            "Network Security",
            "Kali Linux",
            "Cryptography",
            "Security Auditing",
            "SIEM Tools",
            "Firewalls",
            "VPN Configuration",
            "Incident Response",
            "Threat Analysis",
            "Access Control",
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
          The Cyber Security Bootcamp takes you from foundational security
          concepts to hands-on penetration testing, network protection, and
          real-world threat analysis. You’ll work with professional tools used
          by ethical hackers and security analysts to detect, prevent, and
          respond to cyber attacks.
        </p>

        <div className="coursepage-columns">
          <ul>
            <li>Cybersecurity Fundamentals</li>
            <li>Network Protocols</li>
            <li>Vulnerability Scanning</li>
            <li>Password Attacks</li>
            <li>Penetration Testing</li>
            <li>Metasploit Framework</li>
          </ul>

          <ul>
            <li>Web App Security</li>
            <li>Cryptography Basics</li>
            <li>Firewall Management</li>
            <li>VPN & Tunneling</li>
            <li>Monitoring & SIEM Tools</li>
            <li>Security Policies</li>
          </ul>

          <ul>
            <li>Identity Access Management</li>
            <li>Cloud Security Basics</li>
            <li>Secure System Design</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
