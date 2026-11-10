import React, { useEffect, useContext, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { AppContext } from "../context/Appcontext";
import axios from "axios";
import "../styles/coursePageStyles.css";
import { toast } from "react-toastify";

export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, backendUrl } = useContext(AppContext);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        
        // Fetch course by slug/name
        const { data } = await axios.get(`${backendUrl}/api/courses/name/${slug}`);
        if (data.success && data.course) {
          setCourse(data.course);
          setError(null);
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [slug, backendUrl]);

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

    if (course) {
      navigate("/payment", {
        state: {
          courseName: course.name,
          price: course.price,
        },
      });
    }
  };

  if (loading) {
    return <div className="coursepage-layout" style={{ padding: "40px", textAlign: "center" }}>Loading course details...</div>;
  }

  if (error || !course) {
    return (
      <div className="coursepage-layout" style={{ padding: "40px", textAlign: "center" }}>
        <h2>{error || "Course not found"}</h2>
        <button onClick={() => navigate("/courses")} style={{ marginTop: "20px", padding: "10px 20px" }}>
          Back to Courses
        </button>
      </div>
    );
  }

  const isEnrolled = ((userData && userData.enrolledCourses) || []).some(c => c.name === course.name);

  return (
    <div className="coursepage-layout">
      <section className="coursepage-hero">
        <h1 className="coursepage-title">{course.name}</h1>
        <p className="coursepage-sub">
          {course.subject || "Enhance your skills with this comprehensive course"}
        </p>
        {isEnrolled ? (
          <Link to="/course/resources" state={{ courseName: course.name }} className="coursepage-enroll-btn">
            Go to Course Resources
          </Link>
        ) : (
          <button className="coursepage-enroll-btn" onClick={handleEnroll}>
            Enroll Now
          </button>
        )}

        <div className="coursepage-stats">
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">{course.rating || 4.6} ★</span>
            <span className="coursepage-stat-sub">{course.reviews || 100}+ reviews</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">{course.duration || 1-3} months</span>
            <span className="coursepage-stat-sub">{ course.approach || "Self-paced learning" }</span>
          </div>
          <div className="coursepage-stat-item">
            <span className="coursepage-stat-main">{ course.approachSubtitle || "Hands-on Projects"}</span>
            <span className="coursepage-stat-sub">Industry Relevant</span>
          </div>
        </div>
      </section>

      <section className="coursepage-section">
        <h2 className="coursepage-heading">What you'll learn</h2>
        <ul className="coursepage-list">
          {(course.whatYouWillLearn && course.whatYouWillLearn.length > 0) ? (
            course.whatYouWillLearn.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <li>Learn essential skills and concepts in this course</li>
          )}
        </ul>
      </section>

      <section className="coursepage-section">
        <h2 className="coursepage-heading">Skills you'll gain</h2>
        <div className="coursepage-skills">
          {(course.skillsYouWillGain && course.skillsYouWillGain.length > 0) ? (
            course.skillsYouWillGain.map((skill, index) => (
              <span key={index} className="coursepage-skill">
                {skill}
              </span>
            ))
          ) : (
            <span className="coursepage-skill">Programming</span>
          )}
        </div>
      </section>

      <section className="coursepage-section">
        <h2 className="coursepage-heading">Description</h2>
        <p className="coursepage-desc">
          {course.description || "This comprehensive course covers all essential concepts and practical skills needed to master this subject."}
        </p>

        {course.descriptionPoints && course.descriptionPoints.length > 0 && (
          <div className="coursepage-columns">
            <ul>
              {course.descriptionPoints.slice(0, Math.ceil(course.descriptionPoints.length / 3)).map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>

            {course.descriptionPoints.length > 3 && (
              <ul>
                {course.descriptionPoints.slice(Math.ceil(course.descriptionPoints.length / 3), Math.ceil(course.descriptionPoints.length * 2 / 3)).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}
            
            {course.descriptionPoints.length > 6 && (
              <ul>
                {course.descriptionPoints.slice(Math.ceil(course.descriptionPoints.length * 2 / 3)).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
