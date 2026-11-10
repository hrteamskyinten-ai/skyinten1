import React from "react";
import { Link } from "react-router-dom";
import "../../styles/examInterface.css";

export default function HackathonSuccess() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#071428",
      gap: "30px",
      padding: "20px"
    }}>
      <div style={{
        fontSize: "60px",
        textAlign: "center"
      }}>
        ✅
      </div>
      
      <h1 style={{
        fontSize: "36px",
        color: "#fff",
        textAlign: "center",
        margin: 0
      }}>
        Your Exam Submitted Successfully
      </h1>

      <Link to="/hackathons">
        <button style={{
          padding: "12px 30px",
          fontSize: "16px",
          fontWeight: "bold",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "background-color 0.3s ease"
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = "#45a049"}
        onMouseOut={(e) => e.target.style.backgroundColor = "#4CAF50"}
        >
          Go back to Hackathons
        </button>
      </Link>
    </div>
  );
}