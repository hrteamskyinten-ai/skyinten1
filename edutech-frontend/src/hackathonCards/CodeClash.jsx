import React, { useEffect, useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./hackathonPageStyles.css";
import { AppContext } from "../context/Appcontext";
import { toast } from "react-toastify";

export default function CodeClash() {
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AppContext);
  const [hackathon, setHackathon] = useState(null);
  const price = 499;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch hackathon data by name
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/hackathon/all`);
        if (data.success && data.hackathons) {
          const hack = data.hackathons.find(h => h.name === 'Full-Stack Code Clash');
          if (hack) {
            setHackathon(hack);
          }
        }
      } catch (err) {
        console.error('Failed to fetch hackathon data:', err);
      }
    })();
  }, [backendUrl]);

  const location = useLocation();
  const handlePay = () => {
    if (!userData) {
      toast.info("Please Sign in to purchase hackathons", { position: "top-center", autoClose: 1800 });
      setTimeout(() => navigate('/login', { state: { from: location.pathname } }), 1900);
      return;
    }

    if (userData && userData.verifiedStatus === false) {
      toast.info("Your Account Is Not Verified Only The Verified Accounts Have The Access To Purchase Hackathons", { position: "top-center", autoClose: 2200 });
      return;
    }

    navigate("/payment", { state: { courseName: "Full-Stack Code Clash", price, itemType: 'hackathon' } });
  };
  const handleStart = () => navigate('/HackathonExam/ExamInstructions', { state: { hackathonName: 'Full-Stack Code Clash' } });

  const enrolled = !!(userData && userData.enrolledHackathons && userData.enrolledHackathons.some(h => h.name === 'Full-Stack Code Clash'));
  const completed = !!(userData && userData.completedHackathons && hackathon && userData.completedHackathons.some(h => h.hackathonId._id === hackathon._id));

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate results announcement date (10 days after end date)
  const getResultsDate = () => {
    if (!hackathon || !hackathon.schedule || !hackathon.schedule.endDatetime) return 'TBA';
    const endDate = new Date(hackathon.schedule.endDatetime);
    const resultsDate = new Date(endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    return formatDate(resultsDate.toISOString());
  };

  const startDate = hackathon?.schedule?.startDatetime ? formatDate(hackathon.schedule.startDatetime) : 'TBA';
  const endDate = hackathon?.schedule?.endDatetime ? formatDate(hackathon.schedule.endDatetime) : 'TBA';
  const resultsDate = getResultsDate();

  return (
    <div className="hack-detail-container">
      <section className="hack-detail-hero">
        <h1 className="hack-detail-title">Full-Stack Code Clash</h1>
        <p className="hack-detail-sub">
          Build complete end-to-end applications that combine strong frontend,
          backend, and database skills.
        </p>
        {completed ? (
          <button className="hack-detail-btn" disabled>Your exam is done</button>
        ) : enrolled ? (
          <button className="hack-detail-btn" onClick={handleStart}>Start Hackathon</button>
        ) : (
          <button className="hack-detail-btn" onClick={handlePay} disabled={hackathon && !hackathon.active}>Pay Now</button>
        )}
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">About the Hackathon</h2>
        <p className="hack-sec-text">
          This challenge pushes participants to deliver real, production-style
          applications. You work across the full stack: frontend interfaces,
          backend logic, APIs, authentication, and data persistence. The focus
          is clean architecture, reliable performance, and practical
          problem-solving.
        </p>
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">Who Can Participate?</h2>
        <ul className="hack-list">
          <li>Developers comfortable with both frontend and backend</li>
          <li>Students learning full-stack workflows</li>
          <li>Backend developers expanding into client-side work</li>
          <li>Anyone who wants to test complete development abilities</li>
        </ul>
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">Hackathon Timeline</h2>
        <div className="hack-timeline">
          <div>
            <strong>Registration Starts:</strong> {hackathon && !hackathon.active ? 'TBA' : 'Today'}
          </div>
          <div>
            <strong>Hackathon Start:</strong> {startDate}
          </div>
          <div>
            <strong>Submission Deadline:</strong> {endDate}
          </div>
          <div>
            <strong>Results Announcement:</strong> {resultsDate}
          </div>
        </div>
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">Rewards</h2>
        <ul className="hack-list">
          <li>📜 Certificates for all participants</li>
          <li>💼 Internship opportunity for top performers</li>
        </ul>
      </section>
    </div>
  );
}
