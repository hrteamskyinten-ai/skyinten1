import React, { useState, useEffect } from "react";
import "../styles/homepage.css";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-image.webp";
import courseImg1 from "../assets/course1.webp";
import courseImg2 from "../assets/course2.webp";
import courseImg3 from "../assets/course3.webp";
import courseImg4 from "../assets/course4.webp";
import courseImg5 from "../assets/course5.webp";
import courseImg6 from "../assets/course6.webp";
import {
  FaBullseye,
  FaUserTie,
  FaBookOpen,
  FaPuzzlePiece,
  FaLaptopCode,
  FaTrophy,
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function HomePage() {

  const [homeCourses, setHomeCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
        const url = base + "/api/courses/all/active";
        const { data } = await axios.get(url);
        if (data && data.success && data.activeCourses && Array.isArray(data.activeCourses.courses)) {
          const courses = data.activeCourses.courses.slice();
          // shuffle
          for (let i = courses.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [courses[i], courses[j]] = [courses[j], courses[i]];
          }
          setHomeCourses(courses.slice(0, 3));
        } else {
          setHomeCourses([]);
        }
      } catch (err) {
        console.error('HomePage fetchActive error', err);
        setHomeCourses([]);
      }
    };
    fetchActive();
  }, []);

  return (
    <div className="home">
      {/* ---- Hero Section ---- */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <h1>
              Unlock Your{" "}
              <span className="highlight shake-text">Potential</span> <br />
              with Expert-Led Courses
            </h1>
            <p>
              Learn anytime, anywhere. Gain real-world skills and achieve your
              goals with our interactive, on-demand courses.
            </p>
            <div className="hero-buttons">
              <a href="/courses" className="btn-primary">
                Start Learning
              </a>
              <a href="/hackathons" className="btn-secondary">
                Join Hackathons
              </a>
            </div>
          </div>

          <div className="hero-right">
            <img src={heroImage} alt="Learning and Mentorship" />
          </div>
        </div>
      </section>

      {/* ---- Why Choose Section ----- */}
      <section className="why-section">
        <h2>Why Choose Us for Your Learning Journey?</h2>
        <p className="why-subtext">
          Discover the key features that make our courses the ideal choice for
          advancing your knowledge and career.
        </p>

        <div className="why-cards">
          <div className="why-card">
            <div className="icon-wrapper">
              <FaBullseye />
            </div>
            <h3>Flexible Learning Options</h3>
            <p>
              Life is busy, and we get it. With our flexible schedules, you can
              learn whenever it suits you, fitting education around your life.
            </p>
          </div>

          <div className="why-card">
            <div className="icon-wrapper">
              <FaUserTie />
            </div>
            <h3>Expert-Led Courses</h3>
            <p>
              Our instructors are industry leaders dedicated to delivering
              high-quality education. Learn from the best and gain insights
              directly from experts.
            </p>
          </div>

          <div className="why-card">
            <div className="icon-wrapper">
              <FaBookOpen />
            </div>
            <h3>Lifetime Course Access</h3>
            <p>
              Once enrolled, you’ll have lifetime access to your courses.
              Revisit lessons anytime, ensuring that knowledge is always at your
              fingertips.
            </p>
          </div>

          <div className="why-card">
            <div className="icon-wrapper">
              <FaPuzzlePiece />
            </div>
            <h3>Curriculum Up-to-Date</h3>
            <p>
              We are committed to delivering the latest knowledge and skills.
              Our curriculum is regularly updated to meet industry standards and
              demands.
            </p>
          </div>

          <div className="why-card">
            <div className="icon-wrapper">
              <FaLaptopCode />
            </div>
            <h3>Projects & Assignments</h3>
            <p>
              Theory meets practice with projects that prepare you for
              real-world challenges. Gain hands-on experience as you build your
              portfolio.
            </p>
          </div>

          <div className="why-card">
            <div className="icon-wrapper">
              <FaTrophy />
            </div>
            <h3>Certificates Achievement</h3>
            <p>
              Earn certificates recognized and valued by industry professionals.
              Display your achievements and boost your career prospects.
            </p>
          </div>
        </div>
      </section>

      {/* ---- FindPerfect Course Section ---- */}
      <section className="courses-section">
        <h2>Find the Perfect Course for You</h2>
        <p className="courses-subtext">
          Explore a wide range of courses to boost your career or learn
          something new.
        </p>


        <div className="course-grid">
          {homeCourses && homeCourses.length ? (
            homeCourses.map((course) => (
              <div className="course-card" key={course._id}>
                <img src={`${(import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')}/${(course.image || '').replace(/\\/g, '/').replace(/^\//, '')}`} alt={course.name} loading="lazy" />
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <div className="course-meta">
                    <span className="rating">⭐ 4.5 ({course.reviews})</span>
                  </div>
                  <div className="course-footer">
                    <span className="price">{course.price} INR</span>
                    <Link to={`/course/${course.name}`} className="enroll-btn">
                      Know More
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* <div className="course-card">
                <img
                  src={courseImg1}
                  alt="Web Development Bootcamp"
                  loading="lazy"
                />
                <div className="course-info">
                  <h4>Full-Stack Web Development Bootcamp</h4>
                  <div className="course-meta">
                    <span className="rating">⭐ 4.5 (131)</span>
                  </div>
                  <div className="course-footer">
                    <span className="price">2499.00 INR</span>
                    <Link to="/course/fullstack" className="enroll-btn">
                      Know More
                    </Link>
                  </div>
                </div>
              </div>
              <div className="course-card">
                <img src={courseImg2} alt="Data Analyst" loading="lazy" />
                <div className="course-info">
                  <h4>Data Analyst</h4>
                  <div className="course-meta">
                    <span className="rating">⭐ 4.5 (154)</span>
                  </div>
                  <div className="course-footer">
                    <span className="price">2499.00 INR</span>
                    <Link to="/course/dataanalyst" className="enroll-btn">
                      Know More
                    </Link>
                  </div>
                </div>
              </div>
              <div className="course-card">
                <img src={courseImg3} alt="AI Robotics" loading="lazy" />
                <div className="course-info">
                  <h4>AI Robotics</h4>
                  <div className="course-meta">
                    <span className="rating">⭐ 4.6 (144)</span>
                  </div>
                  <div className="course-footer">
                    <span className="price">2499.00 INR</span>
                    <Link to="/course/airobotics" className="enroll-btn">
                      Know More
                    </Link>
                  </div>
                </div>
              </div> */}
            </>
          )}
        </div>

        <div className="view-all">
          <a href="/courses" className="view-all-btn">
            View all Courses
          </a>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
