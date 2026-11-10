import React, { useEffect, useRef, useState } from "react";
import "../styles/about.css";
import aboutHero from "../assets/about-1.webp";

function About() {
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal-on-scroll");

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    revealElements.forEach((el) => observer.observe(el));
    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;
      let start = 0;
      const stepTime = Math.abs(Math.floor(duration / end));
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, stepTime);
      return () => clearInterval(timer);
    }, [isVisible, end, duration]);

    return count;
  };

  const learners = useCountUp(10);
  const instructors = useCountUp(100);
  const partners = useCountUp(150);
  const hours = useCountUp(15);

  return (
    <div className="about-page">
      <section className="about-hero">
        <img src={aboutHero} alt="About Us" className="hero-image" />
        <div className="hero-overlay">
          <h1>We help you to upgrade your knowledge effectively</h1>
          <p>
            Wealth creation is an evolutionary and positive-sum game. Status is
            a zero-sum game. Those focused on wealth creation are often just
            seeking mastery and impact.
          </p>
        </div>
      </section>

      <section className="about-features">
        <h2>What do you get</h2>
        <div className="features-main">
          <div className="feature-card reveal-on-scroll">
            <h3>🎓 High-quality Courses</h3>
            <p>
              Learn from top professionals through interactive and engaging
              lessons.
            </p>
          </div>
          <div className="feature-card reveal-on-scroll">
            <h3>👨‍🏫 Personal Mentor</h3>
            <p>
              Get guided one-on-one by experienced mentors from your field of
              interest.
            </p>
          </div>
          <div className="feature-card reveal-on-scroll">
            <h3>💬 Premium Support</h3>
            <p>
              Access dedicated support to help you achieve your learning goals.
            </p>
          </div>
        </div>
        <div className="features-bg">
          <div className="features-secondary">
            <div className="feature-item small reveal-on-scroll">
              <div className="feature-icon">📘</div>
              <div className="feature-text">
                <h4>Up to 500 courses available</h4>
                <p>
                  Expand your knowledge with expertly crafted courses designed
                  for real-world success.
                </p>
              </div>
            </div>

            <div className="feature-item large reveal-on-scroll">
              <div className="feature-icon">⭐</div>
              <div className="feature-text">
                <h4>Write reviews & gain credits</h4>
                <p>Greatness is often overlooked - but never fades.</p>
              </div>
            </div>

            <div className="feature-item small reveal-on-scroll">
              <div className="feature-icon">🎓</div>
              <div className="feature-text">
                <h4>Learn from best professors</h4>
                <p>
                  Gain valuable insights from top educators with real industry
                  experience.
                </p>
              </div>
            </div>

            <div className="feature-item large reveal-on-scroll">
              <div className="feature-icon">🤝</div>
              <div className="feature-text">
                <h4>Share courses with your friends</h4>
                <p>
                  Learning is better together — share knowledge and inspire
                  others to achieve more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="fast-facts" ref={sectionRef}>
        <h2>Fast Facts</h2>
        <p>Empowering learners through innovative online education.</p>
        <div className="facts-container">
          <div className="fact-card reveal-on-scroll">
            <h3>{learners}K+</h3>
            <p>Active learners on the Edutech platform</p>
          </div>
          <div className="fact-card reveal-on-scroll">
            <h3>{instructors}+</h3>
            <p>Certified instructors and mentors</p>
          </div>
          <div className="fact-card reveal-on-scroll">
            <h3>{partners}+</h3>
            <p>Industry partners & collaborations</p>
          </div>
          <div className="fact-card reveal-on-scroll">
            <h3>{hours}M+</h3>
            <p>Learning hours completed globally</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
