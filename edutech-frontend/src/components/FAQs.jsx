import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import "../styles/faq.css";

const faqs = [
  {
    q: "How do I enroll in a course?",
    a: "Create an account, choose a course, and complete the payment. Your dashboard will unlock the course instantly.",
  },
  {
    q: "Do I get a certificate after completing a course?",
    a: "Yes. You will receive a verified digital certificate once you complete all modules and assessments.",
  },
  {
    q: "Are the classes live or recorded?",
    a: "Courses include a mix of recorded lessons, live doubt-clearing sessions, and hands-on tasks.",
  },
  {
    q: "Can beginners join your programs?",
    a: "Yes. Every course starts with fundamentals, so no prior experience is required.",
  },
  {
    q: "How long do I have access to the course?",
    a: "You get lifetime access to all recorded content and resources.",
  },
  {
    q: "Do you offer internships after training?",
    a: "Yes. Selected learners get internship opportunities based on performance.",
  },
  {
    q: "Can I switch courses after enrolling?",
    a: "You can switch within 48 hours of enrollment by contacting support.",
  },
  {
    q: "How do I attend live sessions?",
    a: "Live session links appear in your dashboard under the 'Live Classes' tab.",
  },
  {
    q: "What if I miss a live class?",
    a: "Recordings are uploaded within 24 hours and available anytime.",
  },
];

export default function FAQs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="faq-wrapper">
      <h2 className="faq-title">Frequently Asked Questions</h2>

      <div style={{ margin: '12px 0 18px', background:'#f7fbff', padding:12, borderRadius:6 }}>
        <small>
          If you have any queries or need any assistance for your career please fill out the form in contact page —{' '}
          <Link to="/Contact" style={{ color: '#007bff', fontWeight: 600 }}>click here</Link>
        </small>
      </div>

      {faqs.map((item, idx) => (
        <FAQItem
          key={idx}
          question={item.q}
          answer={item.a}
          isOpen={openIndex === idx}
          onClick={() => toggle(idx)}
        />
      ))}
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onClick }) {
  const contentRef = useRef(null);

  return (
    <div className="faq-item">
      <button className="faq-question" onClick={onClick}>
        {question}
        <span className={`arrow ${isOpen ? "rotate" : ""}`}>▼</span>
      </button>

      <div
        className="faq-answer"
        ref={contentRef}
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight + "px" : "0px",
        }}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
}
