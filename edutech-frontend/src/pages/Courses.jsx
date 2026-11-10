import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/courses.css";
import { Link } from "react-router-dom";
import courseHero from "../assets/course-hero.svg";
import courseImg1 from "../assets/course1.webp";
import courseImg2 from "../assets/course2.webp";
import courseImg3 from "../assets/course3.webp";
import courseImg4 from "../assets/course4.webp";
import courseImg5 from "../assets/course5.webp";
import courseImg6 from "../assets/course6.webp";
import courseImg7 from "../assets/course7.webp";
import courseImg8 from "../assets/course8.webp";
import courseImg9 from "../assets/course9.webp";
import courseImg10 from "../assets/course10.webp";
import courseImg11 from "../assets/course11.webp";
import { AppContext } from "../context/Appcontext";

function Courses() {


  const { activeCourses, backendUrl, userData } = useContext(AppContext);
  const [topCourses, setTopCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch active courses directly if not in context
  useEffect(() => {
    const fetchActiveCourses = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/courses/all/active`);
        if (res.data?.success && res.data?.activeCourses?.courses) {
          setAllCourses(res.data.activeCourses.courses);
        }
      } catch (error) {
        console.error('Error fetching active courses:', error);
      }
    };
    
    if (!activeCourses?.courses || activeCourses.courses.length === 0) {
      fetchActiveCourses();
    } else {
      setAllCourses(activeCourses.courses);
    }
  }, [activeCourses, backendUrl]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/courses/top`);
        if (res.data && res.data.success && res.data.topCourses) {
          setTopCourses(res.data.topCourses);
        }
      } catch (err) {
        console.error("fetchTop courses error", err.message || err);
      }
    };

    fetchTop();
  }, [backendUrl]);

  // Default top-3 courses (shown when there are no purchases).
  const defaultTopCourses = [
    { id: "default-1", name: "Data Analyst", image: courseImg2, price: "2499.00", enrolledCount: 154, link: "/course/Data Analyst" },
    { id: "default-2", name: "AI Robotics", image: courseImg3, price: "2499.00", enrolledCount: 144, link: "/course/Ai Robotics" },
    { id: "default-3", name: "Full-Stack Web Development Bootcamp", image: courseImg1, price: "2499.00", enrolledCount: 131, link: "/course/Full-Stack Web Development Bootcamp" },
  ];

  // Merge backend topCourses into defaultTopCourses one-by-one, keeping only 3 items.
  const displayTop = (() => {
    const merged = defaultTopCourses.map((d) => ({ ...d }));
    if (topCourses && topCourses.length) {
      // replace defaults starting from index 0 with backend results (one-by-one)
      for (let i = 0; i < Math.min(3, topCourses.length); i++) {
        const tc = topCourses[i];
        merged[i] = {
          id: tc._id || `top-${i}`,
          name: tc.name,
          // make backend image a full URL so we can distinguish it from imported images
          image: tc.image ? `${backendUrl}/${tc.image}` : tc.image,
          price: tc.price,
          enrolledCount: tc.enrolledCount || 0,
          reviews: tc.reviews || 120,
          link: `/course/${tc.name}`,
        };
      }
    }
    return merged.slice(0, 3);
  })();

  const handleScroll = () => {
    const section = document.querySelector(".top-courses");
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <section className="courses-page">
        <div className="courses-content">
          <h1>
            Education That <br />
            <span>Moves With You —</span> <br />
            Anytime, Anywhere.
          </h1>

          <p>
            Learn from anywhere, anytime — with expert-led courses, flexible
            schedules, and global access.
          </p>

          <button className="courses-btn" onClick={handleScroll}>
            Start Learning Now
          </button>
        </div>

        <div className="courses-image float-node">
          <img src={courseHero} alt="Online Learning" />
        </div>
      </section>

      {/* --- TopCourses Section --- */}
      <section className="top-courses">
        <h2>Our Top Courses for You</h2>
        <p className="top-subtext">
          Skill up and achieve your career goals with our most popular programs.
        </p>

        <div className="course-section-grid">
          {displayTop.map((course, idx) => (
            <div className="course-section-card" key={course.id || course.name || idx}>
              <img
                src={typeof course.image === "string" && course.image.startsWith("http") ? course.image : course.image}
                alt={course.name}
                loading="lazy"
              />
              <div className="course-section-info">
                <h4>{course.name}</h4>
                <div className="course-rating">
                  <span className="rating">⭐ 4.5 ({course.reviews})</span>
                </div>
                <div className="course-section-footer">
                  <span className="course-price">{course.price} INR</span>
                  {userData && Array.isArray(userData.enrolledCourses) && userData.enrolledCourses.some(ec => (ec.name === course.name) || (ec._id === course._id)) ? (
                    <Link to={`/course/${course.name}`} state={{ courseName: course.name }} className="enroll-btn">Enrolled</Link>
                  ) : (
                    <Link to={`/course/${course.name}`} className="enroll-btn">Know More</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- OurAll Courses Section --- */}
      <section className="our-courses">
        <h2>Our All Courses</h2>
        <p className="our-subtext">
          Discover your potential and unlock new career opportunities.
        </p>

        <div className="course-section-grid">

          {(Array.isArray(allCourses) ? allCourses : []).map((course) => (
            <div className="course-section-card" key={course._id}>
              <img src={`${import.meta.env.VITE_BACKEND_URL}/${course.image}`} alt={course.name} loading="lazy" />
              <div className="course-section-info">
                <h4>{course.name}</h4>
                <div className="course-rating">
                  <span className="rating">⭐ 4.5 ({course.reviews})</span>
                </div>
                <div className="course-section-footer">
                  <span className="course-price">{course.price} INR</span>
                  {userData && Array.isArray(userData.enrolledCourses) && userData.enrolledCourses.some(ec => (ec.name === course.name) || (ec._id === course._id)) ? (
                    <Link to={`/course/${course.name}`} state={{ courseName: course.name }} className="enroll-btn">Enrolled</Link>
                  ) : (
                    <Link to={`/course/${course.name}`} className="enroll-btn">Know More</Link>
                  )}
                </div>
              </div>
            </div>
          ))}



          {/* <div className="course-section-card">
            <img src={courseImg7} alt="Devops" loading="lazy" />
            <div className="course-section-info">
              <h4>Devops</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.4 (173)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/devops" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div> */}

          {/* <div className="course-section-card">
            <img src={courseImg8} alt="Cloud computing" loading="lazy" />
            <div className="course-section-info">
              <h4>Cloud Computing</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.5 (161)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/cloudcomputing" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img
              src={courseImg9}
              alt="Start up entrepreneurship"
              loading="lazy"
            />
            <div className="course-section-info">
              <h4>StartUp Entrepreneurship</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.5 (126)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/startup" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img src={courseImg10} alt="Java Programming" loading="lazy" />
            <div className="course-section-info">
              <h4>Java Programming</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.7 (137)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/java" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img src={courseImg2} alt="Data Analyst" loading="lazy" />
            <div className="course-section-info">
              <h4>Data Analyst</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.5 (154)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/dataanalyst" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img src={courseImg3} alt="AI Robotics" loading="lazy" />
            <div className="course-section-info">
              <h4>AI Robotics</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.6 (144)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/airobotics" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img src={courseImg11} alt="Python Programming" loading="lazy" />
            <div className="course-section-info">
              <h4>Python Programming</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.6 (211)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/python" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img
              src={courseImg1}
              alt="Web Development Bootcamp"
              loading="lazy"
            />
            <div className="course-section-info">
              <h4>Full-Stack Web Development Bootcamp</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.5 (131)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/fullstack" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div> */}

          {/* <div className="course-section-card">
            <img src={courseImg4} alt="Cyber Security" loading="lazy" />
            <div className="course-section-info">
              <h4>Cyber Security</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.6 (189)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/cybersecurity" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div>

          <div className="course-section-card">
            <img
              src={courseImg6}
              alt="Backend Development Bootcamp"
              loading="lazy"
            />
            <div className="course-section-info">
              <h4>Backend Development Bootcamp</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.7 (97)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/backend" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div> */}

          {/* <div className="course-section-card">
            <img src={courseImg5} alt="Digital Marketing" loading="lazy" />
            <div className="course-section-info">
              <h4>Digital Marketing</h4>
              <div className="course-rating">
                <span className="rating">⭐ 4.6 (113)</span>
              </div>
              <div className="course-section-footer">
                <span className="course-price">2499.00 INR</span>
                <Link to="/course/marketing" className="enroll-btn">
                  Know More
                </Link>
              </div>
            </div>
          </div> */}

        </div>
      </section>
    </>
  );
}

export default Courses;
