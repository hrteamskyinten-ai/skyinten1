import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import axios from "axios";
import "../hackathonCards/hackathonPageStyles.css";
import { toast } from "react-toastify";

export default function HackathonPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, backendUrl } = useContext(AppContext);
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        
        // Fetch hackathon by slug/name
        const { data } = await axios.get(`${backendUrl}/api/hackathon/name/${slug}`);
        if (data.success && data.hackathon) {
          setHackathon(data.hackathon);
          setError(null);
        } else {
          setError("Hackathon not found");
        }
      } catch (err) {
        console.error('Failed to fetch hackathon:', err);
        setError("Failed to load hackathon details");
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, [slug, backendUrl]);

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

    if (hackathon) {
      navigate("/payment", {
        state: {
          courseName: hackathon.name,
          price: hackathon.price || 499,
          itemType: 'hackathon'
        },
      });
    }
  };

  const handleStart = () => {
    if (hackathon) {
      navigate('/HackathonExam/ExamInstructions', { state: { hackathonName: hackathon.name } });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getResultsDate = () => {
    if (!hackathon || !hackathon.schedule || !hackathon.schedule.endDatetime) return 'TBA';
    const endDate = new Date(hackathon.schedule.endDatetime);
    const resultsDate = new Date(endDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    return formatDate(resultsDate.toISOString());
  };

  if (loading) {
    return <div className="hack-detail-container" style={{ padding: "40px", textAlign: "center" }}>Loading hackathon details...</div>;
  }

  if (error || !hackathon) {
    return (
      <div className="hack-detail-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2>{error || "Hackathon not found"}</h2>
        <button onClick={() => navigate("/hackathons")} style={{ marginTop: "20px", padding: "10px 20px" }}>
          Back to Hackathons
        </button>
      </div>
    );
  }

  const enrolled = !!(userData && userData.enrolledHackathons && userData.enrolledHackathons.some(h => h.name === hackathon.name));
  const completedEntry = userData && userData.completedHackathons && userData.completedHackathons.find(h => h.hackathonId._id === hackathon._id);
  const completed = !!completedEntry;
  const score = completedEntry ? completedEntry.score : null;

  const startDate = hackathon?.schedule?.startDatetime ? formatDate(hackathon.schedule.startDatetime) : 'TBA';
  const endDate = hackathon?.schedule?.endDatetime ? formatDate(hackathon.schedule.endDatetime) : 'TBA';
  const resultsDate = getResultsDate();

  return (
    <div className="hack-detail-container">
      <section className="hack-detail-hero">
        <h1 className="hack-detail-title">{hackathon.name}</h1>
        <p className="hack-detail-sub">
          {hackathon.subtitle || hackathon.description || "Challenge yourself and showcase your skills"}
        </p>
        {completed ? (
          <button className="hack-detail-btn" disabled>Your exam is done - Score: {score}</button>
        ) : enrolled ? (
          <button className="hack-detail-btn" onClick={handleStart}>Start Hackathon</button>
        ) : (
          <button className="hack-detail-btn" onClick={handlePay} disabled={hackathon && !hackathon.active}>
            Pay Now
          </button>
        )}
      </section>

      {/* --- About Section --- */}
      <section className="hack-section">
        <h2 className="hack-sec-title">About the Hackathon</h2>
        <p className="hack-sec-text">
          {hackathon.about || hackathon.description || "This hackathon is designed to challenge your skills and help you learn through practical problem-solving. Participate, showcase your abilities, and earn recognition."}
        </p>
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">Who Can Participate?</h2>
        <ul className="hack-list">
          {(hackathon.whoCanParticipate && hackathon.whoCanParticipate.length > 0) ? (
            hackathon.whoCanParticipate.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <>
              <li>Students and professionals interested in coding</li>
              <li>Developers at all skill levels</li>
              <li>Anyone looking to improve their problem-solving abilities</li>
            </>
          )}
        </ul>
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">Hackathon Timeline</h2>
        <div className="hack-timeline">
          <div>
            <strong>Registration Status:</strong> {hackathon && !hackathon.active ? 'Coming Soon' : 'Open'}
          </div>
          <div>
            <strong>Hackathon Start:</strong> {startDate}
          </div>
          <div>
            <strong>Hackathon End:</strong> {endDate}
          </div>
          <div>
            <strong>Results Date:</strong> {resultsDate}
          </div>
        </div>
      </section>

      <section className="hack-section">
        <h2 className="hack-sec-title">Rewards</h2>
        <ul className="hack-list">
          {(hackathon.rewards && hackathon.rewards.length > 0) ? (
            hackathon.rewards.map((reward, index) => (
              <li key={index}>📜 {reward}</li>
            ))
          ) : (
            <>
              <li>📜 Certificate for all participants</li>
              <li>💼 Internship opportunity for top performers</li>
            </>
          )}
        </ul>
      </section>
    </div>
  );
}
